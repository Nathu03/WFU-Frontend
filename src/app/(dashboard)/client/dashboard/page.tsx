'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Wrench,
  Package,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface DashboardData {
  overview: {
    active_service_requests: number;
    active_rentals: number;
    active_repairs: number;
    pending_payments: number;
    unread_notifications: number;
  };
  recent_requests: Array<{
    id: number;
    reference: string;
    service: string;
    status: string;
    date: string;
  }>;
}

export default function ClientDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['client-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/client/dashboard');
      return response.data.data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      confirmed: 'secondary',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return colors[status] || 'outline';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome Back!</h1>
        <p className="text-slate-500">Here's an overview of your activities</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.active_service_requests || 0}</div>
            <Link href="/client/services" className="text-xs text-primary hover:underline">
              View all services →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.active_rentals || 0}</div>
            <Link href="/client/rentals" className="text-xs text-primary hover:underline">
              View rentals →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data?.overview.pending_payments || 0}</div>
            <Link href="/client/payments" className="text-xs text-primary hover:underline">
              View payments →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.overview.unread_notifications || 0}</div>
            <Link href="/client/notifications" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/services">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Wrench className="h-6 w-6" />
                <span>Request Service</span>
              </Button>
            </Link>
            <Link href="/rentals">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Package className="h-6 w-6" />
                <span>Browse Rentals</span>
              </Button>
            </Link>
            <Link href="/client/repairs">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                <Clock className="h-6 w-6" />
                <span>Track Repairs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Service Requests</CardTitle>
          <Link href="/client/services">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data?.recent_requests?.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No recent service requests. 
              <Link href="/services" className="text-primary hover:underline ml-1">
                Request a service
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {data?.recent_requests?.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{request.service}</p>
                    <p className="text-sm text-slate-500">
                      {request.reference} • {request.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    <Link href={`/client/services/${request.id}`}>
                      <Button variant="ghost" size="sm">
                        Track
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
