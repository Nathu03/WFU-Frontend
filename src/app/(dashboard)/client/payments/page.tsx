'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Payment {
  id: number;
  service_request: {
    id: number;
    reference_code: string;
    service: {
      name: string;
    };
  };
  amount: number;
  payment_method: string;
  reference_number: string;
  payment_date: string;
  status: string;
  receipt_path: string | null;
}

export default function ClientPaymentsPage() {
  const [status, setStatus] = useState('all');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['my-payments', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      const response = await apiClient.get(`/client/payments?${params}`);
      return response.data;
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending_finance_review: { variant: 'outline', icon: <Clock className="h-3 w-3 mr-1" /> },
      finance_verified: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      success: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon } = config[status] || { variant: 'outline', icon: null };
    const labels: Record<string, string> = {
      pending_finance_review: 'Processing',
      finance_verified: 'Verified',
      success: 'Completed',
      rejected: 'Rejected',
    };
    return (
      <Badge variant={variant} className="flex items-center w-fit">
        {icon}
        {labels[status] || status}
      </Badge>
    );
  };

  const totalPaid = payments?.data?.filter((p: Payment) => p.status === 'success')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;

  const pendingAmount = payments?.data?.filter((p: Payment) => 
    ['pending_finance_review', 'finance_verified'].includes(p.status)
  ).reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Payments</h1>
        <p className="text-slate-500">View and track your payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              LKR {totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              LKR {pendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.data?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_finance_review">Processing</SelectItem>
                <SelectItem value="finance_verified">Verified</SelectItem>
                <SelectItem value="success">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payments?.data?.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No payments yet</h3>
              <p className="text-slate-500">Your payment history will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.data?.map((payment: Payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.reference_number}</TableCell>
                    <TableCell>
                      <div>
                        <p>{payment.service_request?.service?.name}</p>
                        <p className="text-sm text-slate-500">
                          {payment.service_request?.reference_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      LKR {payment.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method?.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'success' && payment.receipt_path && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-xs text-slate-500">Visa, Mastercard</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Bank Transfer</p>
                <p className="text-xs text-slate-500">Direct deposit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Online Payment</p>
                <p className="text-xs text-slate-500">PayHere, Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Cash</p>
                <p className="text-xs text-slate-500">Pay on service</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
