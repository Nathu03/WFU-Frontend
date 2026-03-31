'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, Star, Clock, ArrowRight, Zap, Phone, Mail,
  Wrench, Home, Car, Laptop, Shirt, Building,
} from 'lucide-react';
import { api } from '@/lib/api';

const categoryIcons: Record<string, any> = {
  repairs: Wrench,
  home: Home,
  automotive: Car,
  electronics: Laptop,
  cleaning: Shirt,
  commercial: Building,
  default: Wrench,
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['public-service-categories'],
    queryFn: () => api.get('/public/services/categories'),
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-services', selectedCategory, searchQuery],
    queryFn: () => api.get('/public/services', {
      params: {
        category: selectedCategory,
        search: searchQuery || undefined,
      },
    }),
  });

  const categories = categoriesData?.data?.data || [];
  const services = servicesData?.data?.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-yellow-300" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">We4U</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link href="/services" className="text-sm font-medium text-primary">Services</Link>
            <Link href="/rentals" className="text-sm font-medium text-muted-foreground hover:text-foreground">Rentals</Link>
            <Link href="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground">Track Order</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-brand py-16" aria-labelledby="services-heading">
        <div className="container mx-auto px-4 text-center">
          <h1 id="services-heading" className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Professional services for all your needs. Quality work, fair prices, and reliable service.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white text-foreground rounded-xl"
              aria-label="Search services"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b" aria-label="Service categories">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All Services
            </Button>
            {!categoriesLoading && categories.map((category: any) => {
              const Icon = categoryIcons[category.slug] || categoryIcons.default;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full"
                >
                  <Icon className="w-4 h-4 mr-1" aria-hidden="true" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12" aria-label="Available services">
        <div className="container mx-auto px-4">
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-2xl h-64" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <article
                  key={service.id}
                  className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {service.image && (
                    <div className="h-40 bg-muted">
                      <img
                        src={service.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{service.name}</h3>
                        {service.category && (
                          <Badge variant="secondary" className="mt-1">{service.category.name}</Badge>
                        )}
                      </div>
                      {service.is_featured && (
                        <Badge className="bg-brand-accent text-brand-primary">Featured</Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {service.average_rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                          {service.average_rating.toFixed(1)}
                        </span>
                      )}
                      {service.estimated_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {service.estimated_duration}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          {service.currency} {parseFloat(service.base_price).toLocaleString()}
                        </span>
                        {service.pricing_type !== 'fixed' && (
                          <span className="text-sm text-muted-foreground">/{service.pricing_type}</span>
                        )}
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/services/${service.id}`}>
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold mb-4">Can't find what you need?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Contact us for custom service requests. We're here to help with all your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                Contact Us
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+94112345678">
                <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60">© {new Date().getFullYear()} We4U. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
