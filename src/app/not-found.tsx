'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-accent/20 mb-6">
            <Search className="w-12 h-12 text-brand-accent" />
          </div>
          <h1 className="text-8xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white/90 mb-2">Page Not Found</h2>
          <p className="text-white/70 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-accent text-brand-primary hover:bg-brand-accent/90"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => window.history.back()}
            >
              <button type="button">
                <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                Go Back
              </button>
            </Button>
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm mb-3">Need help?</p>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Link href="/contact">
                <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                Contact Support
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
