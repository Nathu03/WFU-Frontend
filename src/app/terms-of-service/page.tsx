import Link from 'next/link';
import { Zap } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - We4U',
  description: 'Terms of service for We4U service operations platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-300" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">We4U</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using We4U services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Services Description</h2>
            <p className="text-muted-foreground">
              We4U provides a platform connecting customers with service professionals for home repairs, 
              maintenance, equipment rentals, and related services. We facilitate these connections but 
              are not responsible for the actual service delivery by third-party providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
            <p className="text-muted-foreground mb-4">
              By using our payment services, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Pay all fees associated with your service requests</li>
              <li>Provide accurate billing information</li>
              <li>Authorize charges to your payment method</li>
              <li>Understand that prices may vary based on service requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cancellation Policy</h2>
            <p className="text-muted-foreground">
              Service requests may be cancelled up to 24 hours before the scheduled time without charge. 
              Late cancellations may incur a fee. Rental equipment must be returned on time to avoid 
              additional charges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              We4U shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages arising from your use of our services. Our total liability shall not exceed the 
              amount paid by you for the specific service in question.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from these terms shall be resolved through arbitration in accordance 
              with Sri Lankan law. Both parties agree to attempt informal resolution before pursuing 
              formal proceedings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes via email or through our platform. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@we4u.com" className="text-primary hover:underline">
                legal@we4u.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} We4U. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
