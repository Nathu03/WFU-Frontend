import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Zap, Users, Shield, Clock, Star, CheckCircle, ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'About Us - We4U',
  description: 'Learn about We4U - Your trusted service operations platform',
};

const values = [
  {
    icon: Shield,
    title: 'Trust & Reliability',
    description: 'We verify all service professionals and guarantee quality work every time.',
  },
  {
    icon: Clock,
    title: 'Punctuality',
    description: 'We value your time. Our professionals arrive when scheduled, always.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We go above and beyond to exceed expectations.',
  },
  {
    icon: Star,
    title: 'Excellence',
    description: 'We maintain the highest standards in service delivery and customer support.',
  },
];

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50,000+', label: 'Services Completed' },
  { value: '200+', label: 'Verified Professionals' },
  { value: '25+', label: 'Cities Covered' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-300" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">We4U</span>
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-brand py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About We4U</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            We're on a mission to make professional services accessible, reliable, and hassle-free 
            for everyone across Sri Lanka.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We4U was founded with a simple belief: finding reliable home services shouldn't be 
              a headache. What started as a small team connecting homeowners with skilled 
              professionals has grown into Sri Lanka's trusted service operations platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-4">
                To revolutionize how people access and experience professional services by creating 
                a seamless platform that connects customers with verified, skilled professionals.
              </p>
              <ul className="space-y-2">
                {[
                  'Connect customers with vetted professionals',
                  'Ensure transparent pricing and quality',
                  'Make service booking effortless',
                  'Support local service businesses',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the most trusted and loved service platform in South Asia, where quality, 
                reliability, and customer satisfaction are the foundation of every interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6 border">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-brand py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience the difference?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers who trust We4U for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/services">
                Browse Services <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} We4U. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
