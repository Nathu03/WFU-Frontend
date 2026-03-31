'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Search, Zap, Package, Wrench, Clock, CheckCircle, AlertCircle,
  Truck, MapPin, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TrackPage() {
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      toast.error('Please enter a reference number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackingResult(null);

    try {
      const response = await api.get(`/public/track/${reference.trim()}`);
      setTrackingResult(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Order not found';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'returned':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
      case 'processing':
      case 'assigned':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
      case 'submitted':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'processing':
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            <Link href="/rentals" className="text-sm font-medium text-muted-foreground hover:text-foreground">Rentals</Link>
            <Link href="/track" className="text-sm font-medium text-primary">Track Order</Link>
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
      <section className="gradient-brand py-16" aria-labelledby="track-heading">
        <div className="container mx-auto px-4 text-center">
          <h1 id="track-heading" className="text-4xl md:text-5xl font-bold text-white mb-4">
            Track Your Order
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Enter your reference number to track the status of your service request or rental.
          </p>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="Enter reference number (e.g., SRV-2024-XXXX)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="pl-12 h-12 bg-white text-foreground rounded-xl"
                  aria-label="Reference number"
                />
              </div>
              <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tracking...
                  </span>
                ) : (
                  <>
                    Track
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Result */}
      <section className="py-12" aria-label="Tracking result">
        <div className="container mx-auto px-4 max-w-3xl">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-red-800 mb-2">Order Not Found</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">
                Please check your reference number and try again.
              </p>
            </div>
          )}

          {trackingResult && (
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {trackingResult.type === 'service' ? (
                        <Wrench className="w-5 h-5 text-primary" aria-hidden="true" />
                      ) : (
                        <Package className="w-5 h-5 text-primary" aria-hidden="true" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {trackingResult.type === 'service' ? 'Service Request' : 'Rental Order'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">{trackingResult.reference}</h2>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(trackingResult.status)}`}>
                    {getStatusIcon(trackingResult.status)}
                    {trackingResult.status.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Service/Item</Label>
                    <p className="font-medium">{trackingResult.title || trackingResult.item_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Created</Label>
                    <p className="font-medium">{new Date(trackingResult.created_at).toLocaleDateString()}</p>
                  </div>
                  {trackingResult.scheduled_date && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase">Scheduled Date</Label>
                      <p className="font-medium">{new Date(trackingResult.scheduled_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {trackingResult.location && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase">Location</Label>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {trackingResult.location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                {trackingResult.timeline && trackingResult.timeline.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Status History</h3>
                    <div className="space-y-4">
                      {trackingResult.timeline.map((event: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            {index < trackingResult.timeline.length - 1 && (
                              <div className="w-0.5 flex-1 bg-muted-foreground/20 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium">{event.status.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">{event.notes}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/contact">Need Help?</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/login">
                      View Full Details
                      <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!trackingResult && !error && (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">Enter your reference number</h3>
              <p className="text-muted-foreground">
                You can find your reference number in your confirmation email or receipt.
              </p>
            </div>
          )}
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
