'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, DollarSign, Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Payment {
  id: number;
  service_request: { id: number; reference_code: string };
  client: { id: number; name: string };
  total_amount: number;
  payment_method: string;
  payment_reference: string;
  payment_date: string;
  status: string;
  submitted_at: string;
}

interface PaymentDashboard {
  pending_verification: number;
  pending_approval: number;
  approved_today: number;
  total_this_month: number;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending_finance_review: { label: 'Pending Verify', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  finance_verified:       { label: 'Awaiting Approval', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  success:                { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  rejected:               { label: 'Rejected', cls: 'bg-red-100 text-red-700 border border-red-200' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function PaymentsPage() {
  const [search, setSearch]             = useState('');
  const [status, setStatus]             = useState('all');
  const [selectedPayment, setSelected]  = useState<Payment | null>(null);
  const [verifyOpen, setVerifyOpen]     = useState(false);
  const queryClient                     = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', search, status],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.append('search', search);
      if (status !== 'all') p.append('status', status);
      const r = await apiClient.get(`/payments?${p}`);
      return r.data;
    },
  });

  const { data: dashboard } = useQuery<PaymentDashboard>({
    queryKey: ['payment-dashboard'],
    queryFn: async () => (await apiClient.get('/payments/dashboard')).data.data,
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      return (await apiClient.post(`/payments/${id}/verify`, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-dashboard'] });
      toast.success('Payment verified successfully');
      setVerifyOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Verification failed'),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved, notes }: { id: number; approved: boolean; notes?: string }) => {
      return (await apiClient.post(`/payments/${id}/approve`, { approved, notes })).data;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-dashboard'] });
      toast.success(approved ? 'Payment approved' : 'Payment rejected');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPayment) return;
    const fd = new FormData(e.currentTarget);
    verifyMutation.mutate({
      id: selectedPayment.id,
      data: {
        verified_amount: fd.get('verified_amount'),
        bank_reference:  fd.get('bank_reference'),
        verified:        fd.get('verified') === 'true',
        notes:           fd.get('notes'),
      },
    });
  };

  const payments: Payment[] = paymentsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">Review and approve client payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending Verify',   value: dashboard?.pending_verification ?? 0, icon: Clock,        color: 'bg-amber-100 text-amber-600',   val: 'text-amber-700' },
          { label: 'Pending Approval', value: dashboard?.pending_approval ?? 0,     icon: Clock,        color: 'bg-blue-100 text-blue-600',     val: 'text-blue-700' },
          { label: 'Approved Today',   value: dashboard?.approved_today ?? 0,       icon: CheckCircle,  color: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700' },
          { label: 'Month Total (LKR)', value: (dashboard?.total_this_month ?? 0).toLocaleString(), icon: DollarSign, color: 'bg-indigo-100 text-indigo-600', val: 'text-slate-900' },
        ].map(({ label, value, icon: Icon, color, val }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${val} mb-1`}>{value}</div>
            <p className="text-sm font-medium text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by reference, client name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending_finance_review">Pending Verification</SelectItem>
            <SelectItem value="finance_verified">Awaiting Approval</SelectItem>
            <SelectItem value="success">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount (LKR)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading payments…
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-500 font-medium">No payments found</p>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        {payment.payment_reference || payment.service_request?.reference_code || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{payment.client?.name}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {payment.total_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize text-slate-700">
                      {payment.payment_method?.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell><StatusBadge status={payment.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === 'pending_finance_review' && (
                          <Button
                            size="sm"
                            onClick={() => { setSelected(payment); setVerifyOpen(true); }}
                          >
                            Verify
                          </Button>
                        )}
                        {payment.status === 'finance_verified' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => approveMutation.mutate({ id: payment.id, approved: true })}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => approveMutation.mutate({ id: payment.id, approved: false })}
                              disabled={approveMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <form onSubmit={handleVerify} className="space-y-4 mt-2">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-sm">
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Reference:</span>{' '}
                  {selectedPayment.payment_reference || '—'}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Amount:</span>{' '}
                  LKR {selectedPayment.total_amount?.toLocaleString()}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold text-slate-900">Client:</span>{' '}
                  {selectedPayment.client?.name}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="verified_amount">Verified Amount (LKR)</Label>
                <Input
                  id="verified_amount"
                  name="verified_amount"
                  type="number"
                  step="0.01"
                  defaultValue={selectedPayment.total_amount}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank_reference">Bank Transaction Reference</Label>
                <Input
                  id="bank_reference"
                  name="bank_reference"
                  defaultValue={selectedPayment.payment_reference}
                  placeholder="Bank ref / TXN ID"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Optional verification notes" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button
                  type="submit"
                  name="verified"
                  value="false"
                  variant="destructive"
                  disabled={verifyMutation.isPending}
                >
                  Reject
                </Button>
                <Button
                  type="submit"
                  name="verified"
                  value="true"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</>
                    : 'Verify & Approve'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
