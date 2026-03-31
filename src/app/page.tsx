'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Clock, Users, Wrench, Star, CheckCircle,
  Zap, Package, CreditCard, BarChart3, Phone, Mail, MapPin,
  ChevronRight, Menu, X, Sparkles, TrendingUp, HeartHandshake,
} from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────── */
const stats = [
  { label: 'Happy Customers', value: '10,000+', icon: Users },
  { label: 'Services Completed', value: '50,000+', icon: CheckCircle },
  { label: 'Expert Technicians', value: '200+', icon: Wrench },
  { label: 'Cities Covered', value: '25+', icon: MapPin },
];

const services = [
  {
    icon: Wrench,
    title: 'Home Repairs',
    desc: 'Plumbing, electrical, carpentry and general maintenance by certified experts.',
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Package,
    title: 'Equipment Rental',
    desc: 'Rent industrial and household equipment for short or long-term needs.',
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50 text-violet-700',
  },
  {
    icon: Zap,
    title: 'Quick Repairs',
    desc: 'Fast same-day repair services for urgent home and appliance issues.',
    gradient: 'from-amber-400 to-orange-500',
    light: 'bg-amber-50 text-amber-700',
  },
  {
    icon: Shield,
    title: 'Maintenance Plans',
    desc: 'Scheduled preventive maintenance to keep your property in top shape.',
    gradient: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50 text-emerald-700',
  },
];

const features = [
  'Verified & background-checked professionals',
  'Real-time job tracking & live updates',
  'Transparent pricing — no hidden fees',
  '100% satisfaction guarantee',
  'Flexible scheduling at your convenience',
  'Instant online booking & payment',
];

const trustPoints = [
  { icon: Clock,       title: 'On-Time Arrival',  desc: 'Technicians arrive within the scheduled window, guaranteed.',  bg: 'bg-blue-500' },
  { icon: Shield,      title: 'Insured Work',      desc: 'All work is fully insured and backed by our quality promise.', bg: 'bg-emerald-500' },
  { icon: BarChart3,   title: 'Live Tracking',     desc: 'Track your service request in real-time from any device.',     bg: 'bg-violet-500' },
  { icon: CreditCard,  title: 'Easy Payments',     desc: 'Cards, cash, and mobile banking — pay however you like.',      bg: 'bg-orange-500' },
];

const testimonials = [
  { name: 'Ashan Perera',    role: 'Homeowner',        text: 'WeForYou technicians are always on time and do excellent work. Best service platform in Sri Lanka!', rating: 5, avatar: 'AP' },
  { name: 'Nisansala Silva', role: 'Business Owner',   text: 'Managing our office maintenance is so easy now. The admin panel is incredibly well-designed.', rating: 5, avatar: 'NS' },
  { name: 'Roshan Fernando', role: 'Property Manager', text: 'The rental equipment section saved us a ton of cost. Highly recommend to every property manager!', rating: 5, avatar: 'RF' },
];

const navLinks = [
  { href: '/services',  label: 'Services' },
  { href: '/rentals',   label: 'Rentals' },
  { href: '/track',     label: 'Track Order' },
  { href: '/about',     label: 'About' },
  { href: '/contact',   label: 'Contact' },
];

/* ── Component ─────────────────────────────────────────────── */
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">WeForYou</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-150">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2.5">
            <Link href="/login"
              className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors shadow-sm shadow-indigo-200">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-indigo-900 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-28 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 rounded-full px-5 py-2 text-sm font-semibold mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Trusted by 10,000+ customers across Sri Lanka
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 max-w-5xl mx-auto">
            Professional Services
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              Delivered With Care
            </span>
          </h1>

          {/* Sub-heading */}
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your one-stop platform for home services, equipment rentals, and professional maintenance.
            Quality guaranteed, every single time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/services"
              className="flex items-center gap-2 text-base font-bold text-indigo-900 bg-yellow-300 hover:bg-yellow-200 px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-yellow-500/20 hover:scale-105">
              Browse Services <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/track"
              className="flex items-center gap-2 text-base font-semibold text-white border border-white/25 hover:bg-white/10 px-8 py-3.5 rounded-2xl transition-all backdrop-blur-sm">
              Track Your Order <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/12 transition-colors">
                <Icon className="h-5 w-5 text-indigo-300 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-white mb-0.5">{value}</div>
                <div className="text-xs font-medium text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-slate-50" />
      </section>

      {/* ── SERVICES ───────────────────────────────────────── */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <TrendingUp className="h-4 w-4" /> What We Offer
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Services Built for You
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              From quick repairs to long-term maintenance plans — we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ icon: Icon, title, desc, gradient, light }) => (
              <div key={title}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${light}`}>
                  Learn more <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <HeartHandshake className="h-4 w-4" /> Why We4U?
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
                Thousands trust us<br />every single day
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                We combine technology with skilled professionals to deliver an unmatched service experience — every time you need us.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {features.map((f) => (
                  <div key={f} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/services"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/about"
                  className="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-6 py-3 rounded-xl transition-colors">
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right: trust cards */}
            <div className="grid grid-cols-2 gap-4">
              {trustPoints.map(({ icon: Icon, title, desc, bg }) => (
                <div key={title}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1.5 text-sm">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-indigo-200 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" /> Customer Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              What our customers say
            </h2>
            <div className="flex items-center justify-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-300 fill-yellow-300" />
              ))}
              <span className="ml-2 text-slate-300 font-semibold text-sm">4.9 / 5 from 2,400+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map(({ name, role, text, rating, avatar }) => (
              <div key={name}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 hover:bg-white/15 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  ))}
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{name}</p>
                    <p className="text-xs text-indigo-300">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl px-8 py-16 text-center overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-52 h-52 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" /> Limited-time offer — First service free!
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of satisfied customers. Book your first service today and experience the WeForYou difference.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register"
                  className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-indigo-900 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-yellow-500/20 text-base">
                  Create Free Account <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/contact"
                  className="flex items-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl transition-all text-base">
                  Talk to Us <Phone className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white">WeForYou</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">
                Professional services delivered with care and quality. Your trusted partner for home and business needs across Sri Lanka.
              </p>
              <div className="space-y-2 text-sm text-slate-500">
                <a href="tel:+94771234567" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" /> +94 77 123 4567
                </a>
                <a href="mailto:hello@weforyou.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" /> hello@weforyou.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Colombo, Sri Lanka
                </span>
              </div>
            </div>

            {[
              { title: 'Services', links: ['All Services', 'Home Repairs', 'Equipment Rentals', 'Maintenance Plans', 'Quick Repairs'] },
              { title: 'Company',  links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact'] },
              { title: 'Legal',    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <Link href={`/${link.toLowerCase().replace(/ /g, '-')}`}
                        className="text-sm text-slate-500 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} WeForYou (Pvt) Ltd. All rights reserved.</p>
            <p className="text-slate-600 text-sm">Made with ❤️ in Sri Lanka 🇱🇰</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
