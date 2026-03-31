'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import {
  Loader2, Mail, Lock, Phone, MessageCircle, Eye, EyeOff,
  Zap, Shield, Users, ArrowRight, CheckCircle,
} from 'lucide-react';

const ADMIN_ROLES = ['super_admin', 'admin', 'finance_head', 'finance', 'hr'];
const EMPLOYEE_ROLES = ['employee'];

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');
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
      const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
      login(user, response.data.token);
      toast.success(`Welcome back, ${user.name}!`);

      const redirect = searchParams.get('redirect');

      let destination: string;
      if (ADMIN_ROLES.some((r) => roles.includes(r))) {
        destination =
          redirect && redirect.startsWith('/admin') && !redirect.startsWith('/admin/login')
            ? redirect
            : '/admin/dashboard';
      } else if (EMPLOYEE_ROLES.some((r) => roles.includes(r))) {
        destination =
          redirect && redirect.startsWith('/employee') ? redirect : '/employee/dashboard';
      } else {
        destination =
          redirect && redirect.startsWith('/client') ? redirect : '/client/dashboard';
      }
      // Use full navigation so browser sends the new cookie and middleware allows access
      setTimeout(() => { window.location.href = destination; }, 400);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="h-6 w-6 text-yellow-300" />
          </div>
          <span className="text-2xl font-bold text-white">WeForYou</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your trusted
              <br />
              <span className="text-yellow-300">service partner</span>
            </h1>
            <p className="text-white/70 mt-3 text-lg leading-relaxed">
              Book services, track requests, and manage everything from one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Book professional home services',
              'Track your service requests live',
              'Manage payments securely',
              'Rent equipment hassle-free',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/10 rounded-xl p-4">
          <Shield className="h-5 w-5 text-yellow-300 flex-shrink-0" />
          <p className="text-white/70 text-xs">
            Your data is protected with enterprise-grade security.
          </p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-300" />
              </div>
              <span className="text-2xl font-bold text-foreground">WeForYou</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to your account to continue
          </p>

          {/* Auth method toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            {(['email', 'otp'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setAuthMethod(method)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                  authMethod === method
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
                }`}
              >
                {method === 'email' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                {method === 'email' ? 'Email & Password' : 'OTP Login'}
              </button>
            ))}
          </div>

          {authMethod === 'email' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" {...register('email')} className="pl-10" placeholder="you@example.com" />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                  : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                }
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center bg-muted rounded-xl p-4">
                Receive a one-time password to your registered phone number
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login/otp?type=sms" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted py-3 text-sm font-medium transition-colors">
                  <Phone className="h-4 w-4" />SMS OTP
                </Link>
                <Link href="/login/otp?type=whatsapp" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted py-3 text-sm font-medium transition-colors">
                  <MessageCircle className="h-4 w-4 text-green-600" />WhatsApp
                </Link>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">or continue with</span></div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <a href={authApi.socialRedirect('google')} className="flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-muted py-2.5 text-sm font-medium transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </a>
            <a href={authApi.socialRedirect('facebook')} className="flex items-center justify-center gap-2 rounded-xl border border-border hover:bg-muted py-2.5 text-sm font-medium transition-colors">
              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Are you an admin?{' '}
            <Link href="/admin/login" className="text-indigo-600 font-medium hover:underline">Admin portal →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
