'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Search, Plus, Star, Clock, ArrowRight, Wrench,
  Loader2, Calendar, MapPin, CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ClientServicesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    service_location: '',
    priority: 'medium',
  });

  const queryClient = useQueryClient();

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['client-available-services', categoryFilter, search],
    queryFn: () => api.get('/public/services', {
      params: {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
        is_active: true,
      },
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => api.get('/public/services/categories'),
  });

  const { data: myRequestsData } = useQuery({
    queryKey: ['my-service-requests'],
    queryFn: () => api.get('/client/service-requests', {
      params: { per_page: 5 },
    }),
  });

  const requestMutation = useMutation({
    mutationFn: (data: any) => api.post('/client/service-requests', data),
    onSuccess: () => {
      toast.success('Service request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-service-requests'] });
      setRequestDialogOpen(false);
      setSelectedService(null);
      setRequestForm({
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        service_location: '',
        priority: 'medium',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    },
  });

  const services = servicesData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];
  const myRequests = myRequestsData?.data?.data || [];

  const openRequestDialog = (service: any) => {
    setSelectedService(service);
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    requestMutation.mutate({
      service_id: selectedService.id,
      ...requestForm,
    });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">Browse and request our available services</p>
        </div>
      </div>

      {/* My Recent Requests */}
      {myRequests.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">My Recent Requests</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/client/dashboard">View All</Link>
            </Button>
          </div>
          <div className="p-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {myRequests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex-shrink-0 w-64 p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {request.reference_code}
                    </span>
                    <Badge className={statusColors[request.status]}>
                      {request.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm line-clamp-1">{request.service?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-muted rounded-2xl h-64" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold mb-2">No services found</h3>
          <p className="text-muted-foreground">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <article
              key={service.id}
              className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {service.category && (
                      <Badge variant="secondary" className="mt-1">{service.category.name}</Badge>
                    )}
                  </div>
                  {service.is_featured && (
                    <Badge className="bg-brand-accent text-brand-primary">
                      <Star className="w-3 h-3 mr-1 fill-current" aria-hidden="true" />
                      Featured
                    </Badge>
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

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold">
                      {service.currency} {parseFloat(service.base_price).toLocaleString()}
                    </span>
                    {service.pricing_type !== 'fixed' && (
                      <span className="text-sm text-muted-foreground">/{service.pricing_type}</span>
                    )}
                  </div>
                  <Button size="sm" onClick={() => openRequestDialog(service)}>
                    Request
                    <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Request Service Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium">{selectedService.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedService.description}</p>
                <p className="text-lg font-bold mt-2">
                  {selectedService.currency} {parseFloat(selectedService.base_price).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of your needs</Label>
                <Textarea
                  id="description"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Describe what you need help with..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Preferred Date</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={requestForm.scheduled_date}
                    onChange={(e) => setRequestForm({ ...requestForm, scheduled_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Preferred Time</Label>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={requestForm.scheduled_time}
                    onChange={(e) => setRequestForm({ ...requestForm, scheduled_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_location">Service Location</Label>
                <Input
                  id="service_location"
                  value={requestForm.service_location}
                  onChange={(e) => setRequestForm({ ...requestForm, service_location: e.target.value })}
                  placeholder="Enter your address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={requestForm.priority}
                  onValueChange={(value) => setRequestForm({ ...requestForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!requestForm.description || requestMutation.isPending}
            >
              {requestMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
