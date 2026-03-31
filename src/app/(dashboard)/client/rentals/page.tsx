'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  Package,
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Rental {
  id: number;
  reference_code: string;
  rental_item: {
    id: number;
    name: string;
    image: string;
  };
  start_date: string;
  end_date: string;
  total_amount: number;
  deposit_amount: number;
  status: string;
  created_at: string;
}

export default function ClientRentalsPage() {
  const [status, setStatus] = useState('all');

  const { data: rentals, isLoading } = useQuery({
    queryKey: ['my-rentals', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      const response = await apiClient.get(`/client/rentals?${params}`);
      return response.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      confirmed: 'secondary',
      active: 'default',
      returning: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Rentals</h1>
          <p className="text-slate-500">Manage your rental orders</p>
        </div>
        <Link href="/rentals">
          <Button>
            <Package className="mr-2 h-4 w-4" />
            Browse Items
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Rentals List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : rentals?.data?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No rentals yet</h3>
            <p className="text-slate-500 mb-4">
              You haven't rented any items yet. Browse our collection to get started.
            </p>
            <Link href="/rentals">
              <Button>Browse Rental Items</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rentals?.data?.map((rental: Rental) => {
            const daysRemaining = getDaysRemaining(rental.end_date);
            const isOverdue = rental.status === 'active' && daysRemaining < 0;

            return (
              <Card key={rental.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {rental.rental_item?.image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={rental.rental_item.image}
                          alt={rental.rental_item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">{rental.rental_item?.name}</h3>
                            {getStatusBadge(rental.status)}
                            {isOverdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mb-2">
                            Reference: {rental.reference_code}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-slate-500">Start Date</p>
                            <p className="font-medium">{new Date(rental.start_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-slate-500">End Date</p>
                            <p className="font-medium">{new Date(rental.end_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {rental.status === 'active' && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-slate-500'}`} />
                            <div>
                              <p className="text-slate-500">Days Remaining</p>
                              <p className={`font-medium ${isOverdue ? 'text-red-500' : ''}`}>
                                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-slate-500">Total Amount</p>
                            <p className="font-medium">LKR {rental.total_amount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
