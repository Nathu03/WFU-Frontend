import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Toaster } from '@/components/ui/sonner';
import { DynamicSiteHead } from '@/components/DynamicSiteHead';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'We4U - Service Operations Platform',
  description: 'Enterprise service operations, employee management, and rental platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DynamicSiteHead />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
