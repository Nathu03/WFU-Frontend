import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROLES = ['super_admin', 'admin', 'finance_head', 'finance', 'hr'];
const EMPLOYEE_ROLES = ['employee'];

const publicPaths = [
  '/', '/login', '/login/otp', '/admin/login', '/register',
  '/forgot-password', '/reset-password',
  '/services', '/rentals', '/track',
  '/about', '/contact', '/privacy-policy', '/terms-of-service',
];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) return true;
  return ['/services/', '/rentals/', '/track/'].some((p) => pathname.startsWith(p));
}

function parseAuth(request: NextRequest): { token: string | null; roles: string[] } {
  const raw = request.cookies.get('auth-storage')?.value;
  if (!raw) return { token: null, roles: [] };
  try {
    // Cookie may be base64-encoded, URL-encoded, or raw JSON — handle all cases
    let jsonStr = raw;
    if (!raw.startsWith('{')) {
      try {
        // Try base64 first
        jsonStr = Buffer.from(raw, 'base64').toString('utf-8');
      } catch {
        // Fall back to URL decode
        jsonStr = decodeURIComponent(raw);
      }
    }
    const parsed = JSON.parse(jsonStr);
    return {
      token: parsed?.state?.token ?? null,
      roles: parsed?.state?.user?.roles ?? [],
    };
  } catch {
    return { token: null, roles: [] };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const { token, roles } = parseAuth(request);
  const isAuthenticated = !!token;
  const isAdminUser = ADMIN_ROLES.some((r) => roles.includes(r));
  const isEmployeeUser = EMPLOYEE_ROLES.some((r) => roles.includes(r));

  // Already logged in trying to access login pages → redirect to their dashboard
  if (isAuthenticated) {
    if (pathname === '/login' || pathname === '/register') {
      if (isAdminUser) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (isEmployeeUser) return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
    if (pathname === '/admin/login') {
      if (isAdminUser) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  // Not authenticated → redirect to appropriate login
  if (!isAuthenticated) {
    if (pathname.startsWith('/admin')) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated but accessing wrong area
  if (pathname.startsWith('/admin') && !isAdminUser) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url));
  }
  if (pathname.startsWith('/employee') && !isEmployeeUser && !isAdminUser) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
