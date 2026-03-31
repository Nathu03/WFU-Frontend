'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Loader2, Phone, MessageCircle, ArrowLeft, Zap,
} from 'lucide-react';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

function OtpLoginForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const type = searchParams.get('type') || 'sms';
  const isWhatsApp = type === 'whatsapp';

  const phoneForm = useForm<PhoneFormData>({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSendOtp = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      await authApi.sendOtp({
        identifier: data.phone,
        type: isWhatsApp ? 'whatsapp' : 'sms',
      });
      setPhone(data.phone);
      setStep('otp');
      setCountdown(60);
      toast.success(`OTP sent to ${data.phone} via ${isWhatsApp ? 'WhatsApp' : 'SMS'}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({
        phone,
        otp: data.otp,
      });
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      const userRoles = response.data.user.roles;
      if (userRoles.includes('super_admin') || userRoles.includes('admin') || userRoles.includes('finance_head') || userRoles.includes('finance')) {
        router.push('/admin/dashboard');
      } else if (userRoles.includes('employee')) {
        router.push('/employee/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await authApi.sendOtp({
        identifier: phone,
        type: isWhatsApp ? 'whatsapp' : 'sms',
      });
      setCountdown(60);
      toast.success('OTP resent successfully');
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        {isWhatsApp ? (
          <MessageCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
        ) : (
          <Phone className="h-6 w-6 text-primary" aria-hidden="true" />
        )}
        <span className="font-semibold text-foreground">
          {isWhatsApp ? 'WhatsApp' : 'SMS'} Login
        </span>
      </div>

      {step === 'phone' ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Enter your phone number</h2>
            <p className="text-muted-foreground text-sm">
              We'll send a one-time password to verify your identity.
            </p>
          </div>

          <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="phone"
                  type="tel"
                  {...phoneForm.register('phone')}
                  className="pl-10"
                  placeholder="+94 7X XXX XXXX"
                  aria-describedby={phoneForm.formState.errors.phone ? 'phone-error' : undefined}
                  aria-invalid={phoneForm.formState.errors.phone ? 'true' : 'false'}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p id="phone-error" className="text-xs text-destructive mt-1" role="alert">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP via {isWhatsApp ? 'WhatsApp' : 'SMS'}
                </>
              )}
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">Enter the OTP</h2>
            <p className="text-muted-foreground text-sm">
              We sent a 6-digit code to {phone}
            </p>
          </div>

          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="otp">One-Time Password</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                {...otpForm.register('otp')}
                className="text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                aria-describedby={otpForm.formState.errors.otp ? 'otp-error' : undefined}
                aria-invalid={otpForm.formState.errors.otp ? 'true' : 'false'}
              />
              {otpForm.formState.errors.otp && (
                <p id="otp-error" className="text-xs text-destructive mt-1 text-center" role="alert">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={resendOtp}
              disabled={countdown > 0 || isLoading}
              className={`text-sm ${countdown > 0 ? 'text-muted-foreground' : 'text-primary hover:underline'}`}
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Change phone number
          </button>
        </>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to login options
        </Link>
      </div>
    </div>
  );
}

export default function OtpLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-300" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-white">We4U</span>
          </Link>
        </div>

        <Suspense fallback={<div className="animate-pulse h-96 bg-white/10 rounded-2xl" />}>
          <OtpLoginForm />
        </Suspense>

        <p className="mt-8 text-center text-white/50 text-sm">
          © {new Date().getFullYear()} We4U. All rights reserved.
        </p>
      </div>
    </div>
  );
}
