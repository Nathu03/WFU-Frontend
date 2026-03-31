'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, BarChart3, Users, Settings } from 'lucide-react';

const ADMIN_ROLES = ['super_admin', 'admin', 'finance_head', 'finance', 'hr'];

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      const user = response.data.user;
      // roles is now always a string[] from the API
      const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];

      if (!ADMIN_ROLES.some((r) => userRoles.includes(r))) {
        toast.error('Access denied. This portal is for administrators only.');
        return;
      }

      login(user, response.data.token);
      toast.success(`Welcome back, ${user.name}!`);

      const redirect = searchParams.get('redirect');
      // Only honour redirect if it points inside /admin (never to /admin/login itself)
      const destination =
        redirect &&
        redirect.startsWith('/admin') &&
        !redirect.startsWith('/admin/login')
          ? redirect
          : '/admin/dashboard';
      // Use full navigation so browser sends the new cookie and middleware allows access
      setTimeout(() => { window.location.href = destination; }, 400);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – dark admin branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">WeForYou</span>
            <span className="block text-xs text-slate-400 -mt-0.5">Admin Portal</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Operations
              <br />
              <span className="text-indigo-400">Control Center</span>
            </h1>
            <p className="text-slate-400 mt-3 leading-relaxed">
              Manage your entire service operations from one powerful dashboard.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { icon: BarChart3, label: 'Analytics & Reports', desc: 'Real-time business insights' },
              { icon: Users, label: 'Team Management', desc: 'Employees, roles & permissions' },
              { icon: Settings, label: 'System Configuration', desc: 'Settings & integrations' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="w-9 h-9 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          © {new Date().getFullYear()} WeForYou. Restricted access — authorized personnel only.
        </p>
      </div>

      {/* Right – login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">WeForYou</span>
              <span className="block text-xs text-gray-500 -mt-0.5">Admin Portal</span>
            </div>
          </div>

          {/* Admin badge */}
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1 text-xs font-medium mb-6">
            <Shield className="h-3 w-3" />
            Administrator Access
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in to Admin</h2>
          <p className="text-gray-500 text-sm mb-8">
            Enter your admin credentials to access the control panel.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="pl-10"
                  placeholder="admin@weforyou.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Authenticating...</>
              ) : (
                <><Shield className="mr-2 h-4 w-4" />Sign In to Admin Panel</>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              🔒 This portal is restricted to authorized administrators only. Unauthorized access attempts are logged.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Not an admin?{' '}
            <a href="/login" className="text-indigo-600 font-medium hover:underline">
              Go to user login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
