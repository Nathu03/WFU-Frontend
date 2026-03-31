'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search, Star, MapPin, Calendar, ArrowRight, Zap, Package,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function RentalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [location, setLocation] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const { data: categoriesData } = useQuery({
    queryKey: ['rental-categories'],
    queryFn: () => api.get('/public/rentals/categories'),
  });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['rental-items', selectedCategory, searchQuery, location, priceRange],
    queryFn: () => api.get('/public/rentals/items', {
      params: {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        location: location || undefined,
        price_range: priceRange !== 'all' ? priceRange : undefined,
      },
    }),
  });

  const categories = categoriesData?.data?.data || [];
  const items = itemsData?.data?.data || [];

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
            <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground">Services</Link>
            <Link href="/rentals" className="text-sm font-medium text-primary">Rentals</Link>
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

      {/* Hero */}
      <section className="gradient-brand py-16" aria-labelledby="rentals-heading">
        <div className="container mx-auto px-4 text-center">
          <h1 id="rentals-heading" className="text-4xl md:text-5xl font-bold text-white mb-4">
            Equipment Rentals
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Rent high-quality equipment for your projects. Flexible terms, competitive rates.
          </p>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search equipment"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger aria-label="Select category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger aria-label="Select price range">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-1000">Under LKR 1,000/day</SelectItem>
                  <SelectItem value="1000-5000">LKR 1,000 - 5,000/day</SelectItem>
                  <SelectItem value="5000+">Over LKR 5,000/day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="py-12" aria-label="Available rental items">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-2xl h-80" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item: any) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="relative h-48 bg-muted">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-sm">Not Available</Badge>
                      </div>
                    )}
                    {item.is_available && item.stock_quantity <= 2 && (
                      <Badge className="absolute top-3 right-3 bg-orange-500">Low Stock</Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      {item.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">{item.category.name}</Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                      {item.pickup_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" />
                          {item.pickup_location}
                        </span>
                      )}
                      {item.min_rental_days && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          Min {item.min_rental_days} days
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <span className="text-lg font-bold text-foreground">
                          LKR {parseFloat(item.daily_rate).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">/day</span>
                      </div>
                      <Button asChild size="sm" disabled={!item.is_available}>
                        <Link href={`/rentals/${item.id}`}>
                          Rent Now
                          <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
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

      {/* Info Section */}
      <section className="py-16 bg-muted" aria-labelledby="how-it-works">
        <div className="container mx-auto px-4">
          <h2 id="how-it-works" className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Browse & Select', desc: 'Find the equipment you need from our catalog' },
              { step: '2', title: 'Book & Verify', desc: 'Complete your booking with ID verification' },
              { step: '3', title: 'Pickup & Return', desc: 'Collect your equipment and return when done' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full gradient-brand text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
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
