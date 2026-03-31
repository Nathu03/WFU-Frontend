'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search, Plus, Edit, Trash2, Star, ToggleLeft, ToggleRight,
  Loader2, Wrench, DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    tax_amount: '',
    currency: 'LKR',
    pricing_type: 'fixed',
    estimated_duration: '',
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-services', page, search, categoryFilter],
    queryFn: () => api.get('/services', {
      params: {
        page,
        search: search || undefined,
        category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
        per_page: 15,
      },
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => api.get('/service-categories'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (serviceId: number) => api.post(`/services/${serviceId}/toggle-active`),
    onSuccess: () => {
      toast.success('Service status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (serviceId: number) => api.post(`/services/${serviceId}/toggle-featured`),
    onSuccess: () => {
      toast.success('Featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      selectedService
        ? api.put(`/services/${selectedService.id}`, data)
        : api.post('/services', data),
    onSuccess: () => {
      toast.success(selectedService ? 'Service updated' : 'Service created');
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save service');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serviceId: number) => api.delete(`/services/${serviceId}`),
    onSuccess: () => {
      toast.success('Service deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
  });

  const services = data?.data?.data || [];
  const meta = data?.data?.meta;
  const categories = categoriesData?.data?.data || [];

  const resetForm = () => {
    setSelectedService(null);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      base_price: '',
      tax_amount: '',
      currency: 'LKR',
      pricing_type: 'fixed',
      estimated_duration: '',
    });
  };

  const openEditDialog = (service?: any) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        category_id: service.category_id?.toString() || '',
        base_price: service.base_price?.toString() || '',
        tax_amount: service.tax_amount?.toString() || '',
        currency: service.currency || 'LKR',
        pricing_type: service.pricing_type || 'fixed',
        estimated_duration: service.estimated_duration || '',
      });
    } else {
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      category_id: parseInt(formData.category_id),
      base_price: parseFloat(formData.base_price),
      tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : 0,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-slate-500">Manage service offerings and pricing</p>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Wrench className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.length}</p>
              <p className="text-sm text-slate-500">Total Services</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <ToggleRight className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.filter((s: any) => s.is_active).length}</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Star className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.filter((s: any) => s.is_featured).length}</p>
              <p className="text-sm text-slate-500">Featured</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <DollarSign className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-slate-500">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
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

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              services.map((service: any) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-slate-500 line-clamp-1">{service.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.category?.name || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {service.currency} {parseFloat(service.base_price).toLocaleString()}
                    </span>
                    {service.tax_amount > 0 && (
                      <span className="text-xs text-slate-500 block">
                        +{service.tax_amount} tax
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{service.pricing_type}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate(service.id)}
                      className={service.is_active ? 'text-green-600' : 'text-slate-500'}
                    >
                      {service.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeaturedMutation.mutate(service.id)}
                      className={service.is_featured ? 'text-yellow-500' : 'text-slate-500'}
                    >
                      <Star className={`w-5 h-5 ${service.is_featured ? 'fill-current' : ''}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(service)}
                        aria-label="Edit service"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this service?')) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Create Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_amount">Tax Amount</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing_type">Pricing Type</Label>
                <Select
                  value={formData.pricing_type}
                  onValueChange={(value) => setFormData({ ...formData, pricing_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="rental">Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Estimated Duration</Label>
              <Input
                id="estimated_duration"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="e.g., 2-3 hours"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedService ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
