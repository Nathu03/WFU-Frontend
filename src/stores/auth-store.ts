import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

const ADMIN_ROLES = ['super_admin', 'admin', 'finance_head', 'finance', 'hr'];
const EMPLOYEE_ROLES = ['employee'];

/** Write the auth cookie in base64-encoded JSON so the Next.js middleware can read it. */
function writeAuthCookie(token: string | null, user: User | null) {
  const json = JSON.stringify({ state: { token, user } });
  // btoa works with ASCII; for unicode names use a safe base64 approach
  const b64 = btoa(unescape(encodeURIComponent(json)));
  document.cookie = `auth-storage=${b64}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isAdmin: () => boolean;
  isEmployee: () => boolean;
  isClient: () => boolean;
  getRedirectPath: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => {
        set({ user });
        if (typeof document !== 'undefined' && user) {
          const { token } = get();
          writeAuthCookie(token, user);
        }
      },
      setToken: (token) => {
        set({ token });
        if (typeof document !== 'undefined') {
          const { user } = get();
          writeAuthCookie(token, user);
        }
      },
      login: (user, token) => {
        set({ user, token });
        if (typeof document !== 'undefined') {
          writeAuthCookie(token, user);
        }
      },
      logout: () => {
        set({ user: null, token: null });
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-storage=; path=/; max-age=0; SameSite=Lax';
        }
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) ?? false;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.some((r) => user?.roles?.includes(r)) ?? false;
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        // super_admin and admin bypass all permission checks
        if (user.roles?.includes('super_admin') || user.roles?.includes('admin')) return true;
        return user.permissions?.includes(permission) ?? false;
      },

      hasAnyPermission: (permissions) => {
        const { user } = get();
        if (!user) return false;
        if (user.roles?.includes('super_admin') || user.roles?.includes('admin')) return true;
        return permissions.some((p) => user.permissions?.includes(p));
      },

      isAdmin: () => {
        const { user } = get();
        return ADMIN_ROLES.some((r) => user?.roles?.includes(r)) ?? false;
      },

      isEmployee: () => {
        const { user } = get();
        return EMPLOYEE_ROLES.some((r) => user?.roles?.includes(r)) ?? false;
      },

      isClient: () => {
        const { user } = get();
        if (!user) return false;
        return !ADMIN_ROLES.some((r) => user.roles?.includes(r)) &&
               !EMPLOYEE_ROLES.some((r) => user.roles?.includes(r));
      },

      getRedirectPath: () => {
        const { user } = get();
        if (!user) return '/login';
        if (ADMIN_ROLES.some((r) => user.roles?.includes(r))) return '/admin/dashboard';
        if (EMPLOYEE_ROLES.some((r) => user.roles?.includes(r))) return '/employee/dashboard';
        return '/client/dashboard';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
