'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-white/70 mb-4">
            We encountered an unexpected error. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-white/50 text-sm font-mono bg-white/5 rounded-lg px-4 py-2 inline-block">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              size="lg"
              className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm mb-3">Still having issues?</p>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Link href="/contact">
                <Bug className="w-4 h-4 mr-2" aria-hidden="true" />
                Report a Bug
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 text-white/40 text-sm">
          <p>We4U - Service Operations Platform</p>
        </div>
      </div>
    </div>
  );
}
