'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search, Plus, Eye, UserPlus, Play, CheckCircle, XCircle,
  Clock, AlertCircle, Calendar, Loader2, RefreshCw, ClipboardList,
} from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-800',
  assigned:    'bg-blue-100 text-blue-800',
  in_progress: 'bg-violet-100 text-violet-800',
  on_hold:     'bg-slate-100 text-slate-700',
  completed:   'bg-emerald-100 text-emerald-800',
  cancelled:   'bg-red-100 text-red-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

export default function ServiceRequestsPage() {
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState<string>('all');
  const [priorityFilter, setPriority]     = useState<string>('all');
  const [page, setPage]                   = useState(1);

  // dialog states
  const [createOpen, setCreateOpen]           = useState(false);
  const [assignOpen, setAssignOpen]           = useState(false);
  const [statusOpen, setStatusOpen]           = useState(false);
  const [detailOpen, setDetailOpen]           = useState(false);
  const [selected, setSelected]              = useState<any>(null);

  // form state
  const [assignEmpId, setAssignEmpId]         = useState('');
  const [newStatus, setNewStatus]             = useState('');
  const [statusNotes, setStatusNotes]         = useState('');

  const queryClient = useQueryClient();

  /* ── Data Queries ── */
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['service-requests', page, search, statusFilter, priorityFilter],
    queryFn: () => api.get('/service-requests', {
      params: { page, search: search || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined, per_page: 15 },
    }),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-active'],
    queryFn: () => api.get('/employees', { params: { status: 'active', per_page: 100 } }),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => api.get('/services', { params: { per_page: 100, is_active: true } }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['client-users'],
    queryFn: () => api.get('/admin/users', { params: { role: 'client', per_page: 100, status: 'active' } }),
  });

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/service-requests', payload),
    onSuccess: () => {
      toast.success('Service request created');
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      setCreateOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create request'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, empId }: { id: number; empId: number }) =>
      api.post(`/service-requests/${id}/assign`, { employee_id: empId }),
    onSuccess: () => {
      toast.success('Employee assigned');
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      setAssignOpen(false);
      setAssignEmpId('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Assignment failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      api.post(`/service-requests/${id}/status`, { status, notes }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      setStatusOpen(false);
      setNewStatus('');
      setStatusNotes('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Status update failed'),
  });

  const requests  = Array.isArray(data?.data?.data) ? data.data.data : [];
  const meta      = data?.data?.meta;
  const employees = Array.isArray(employeesData?.data?.data) ? employeesData.data.data : [];
  const services  = Array.isArray(servicesData?.data?.data) ? servicesData.data.data : [];
  const clients   = Array.isArray(clientsData?.data?.data) ? clientsData.data.data : [];

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      service_id:     fd.get('service_id'),
      client_id:      fd.get('client_id') || undefined,
      priority:       fd.get('priority'),
      location:       fd.get('location'),
      scheduled_date: fd.get('scheduled_date') || undefined,
      description:    fd.get('description') || undefined,
      contact_name:   fd.get('contact_name') || undefined,
      contact_phone:  fd.get('contact_phone') || undefined,
      notes:          fd.get('notes') || undefined,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track all service requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: meta?.total ?? requests.length, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
          { label: 'Pending',    value: requests.filter((r: any) => r.status === 'pending').length,     icon: Clock,        color: 'bg-amber-100 text-amber-600' },
          { label: 'In Progress',value: requests.filter((r: any) => r.status === 'in_progress').length, icon: AlertCircle,  color: 'bg-violet-100 text-violet-600' },
          { label: 'Completed',  value: requests.filter((r: any) => r.status === 'completed').length,   icon: CheckCircle,  color: 'bg-emerald-100 text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by reference, client, service…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriority}>
          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-500 font-medium">No service requests found</p>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell><span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{req.reference_code}</span></TableCell>
                  <TableCell className="font-medium text-slate-900">{req.service?.name || '—'}</TableCell>
                  <TableCell className="text-slate-700">{req.client?.name || '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-700'}`}>
                      {req.status?.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[req.priority] || 'bg-slate-100 text-slate-700'}`}>
                      {req.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700">{req.assigned_employee?.user?.name || <span className="text-slate-400 italic">Unassigned</span>}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {req.scheduled_date ? (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(req.scheduled_date).toLocaleDateString()}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(req); setDetailOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {req.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                          onClick={() => { setSelected(req); setAssignEmpId(''); setAssignOpen(true); }}>
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      )}
                      {['assigned', 'in_progress'].includes(req.status) && (
                        <Button variant="ghost" size="sm" className="text-violet-600 hover:bg-violet-50"
                          onClick={() => { setSelected(req); setNewStatus(''); setStatusNotes(''); setStatusOpen(true); }}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {meta.from}–{meta.to} of {meta.total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE REQUEST DIALOG ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Service Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service */}
              <FormRow>
                <Label htmlFor="service_id">Service *</Label>
                <Select name="service_id" required>
                  <SelectTrigger id="service_id"><SelectValue placeholder="Select a service…" /></SelectTrigger>
                  <SelectContent>
                    {services.length === 0
                      ? <SelectItem value="_none" disabled>No services available</SelectItem>
                      : services.map((s: any) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </FormRow>

              {/* Client User */}
              <FormRow>
                <Label htmlFor="client_id">Client (optional)</Label>
                <Select name="client_id">
                  <SelectTrigger id="client_id"><SelectValue placeholder="Select client…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Walk-in / No account</SelectItem>
                    {clients.map((u: any) => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.name} — {u.phone || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>

              {/* Contact Name */}
              <FormRow>
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input id="contact_name" name="contact_name" placeholder="Full name" required />
              </FormRow>

              {/* Contact Phone */}
              <FormRow>
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input id="contact_phone" name="contact_phone" placeholder="+94 7X XXX XXXX" required />
              </FormRow>

              {/* Priority */}
              <FormRow>
                <Label htmlFor="priority">Priority *</Label>
                <Select name="priority" required defaultValue="medium">
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>

              {/* Scheduled Date */}
              <FormRow>
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input id="scheduled_date" name="scheduled_date" type="datetime-local" />
              </FormRow>
            </div>

            {/* Location */}
            <FormRow>
              <Label htmlFor="location">Service Location *</Label>
              <Input id="location" name="location" placeholder="Address / Area" required />
            </FormRow>

            {/* Description */}
            <FormRow>
              <Label htmlFor="description">Issue Description *</Label>
              <Textarea id="description" name="description" placeholder="Describe the issue or service needed in detail…" rows={3} required />
            </FormRow>

            {/* Internal Notes */}
            <FormRow>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Admin notes (not visible to client)" rows={2} />
            </FormRow>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : 'Create Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── ASSIGN EMPLOYEE DIALOG ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1.5">
              <p className="text-slate-700"><span className="font-semibold text-slate-900">Reference:</span> {selected?.reference_code}</p>
              <p className="text-slate-700"><span className="font-semibold text-slate-900">Service:</span> {selected?.service?.name}</p>
              <p className="text-slate-700"><span className="font-semibold text-slate-900">Client:</span> {selected?.client?.name || '—'}</p>
            </div>
            <FormRow>
              <Label htmlFor="emp-select">Select Employee *</Label>
              <Select value={assignEmpId} onValueChange={setAssignEmpId}>
                <SelectTrigger id="emp-select"><SelectValue placeholder="Choose an employee…" /></SelectTrigger>
                <SelectContent>
                  {employees.length === 0
                    ? <SelectItem value="_none" disabled>No active employees</SelectItem>
                    : employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name || emp.user?.name} — {emp.department}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </FormRow>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button
              onClick={() => assignMutation.mutate({ id: selected.id, empId: parseInt(assignEmpId) })}
              disabled={!assignEmpId || assignMutation.isPending}
            >
              {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── UPDATE STATUS DIALOG ── */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Current:</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[selected?.status] || 'bg-slate-100 text-slate-700'}`}>
                {selected?.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <FormRow>
              <Label>New Status *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue placeholder="Select new status…" /></SelectTrigger>
                <SelectContent>
                  {selected?.status === 'assigned' && <SelectItem value="in_progress">In Progress</SelectItem>}
                  {selected?.status === 'in_progress' && (
                    <>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </>
                  )}
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow>
              <Label htmlFor="status-notes">Notes (optional)</Label>
              <Textarea id="status-notes" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Add notes about this status change…" rows={3} />
            </FormRow>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button
              onClick={() => statusMutation.mutate({ id: selected.id, status: newStatus, notes: statusNotes || undefined })}
              disabled={!newStatus || statusMutation.isPending}
            >
              {statusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DETAIL VIEW DIALOG ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Reference',  selected.reference_code],
                  ['Service',    selected.service?.name],
                  ['Client',     selected.client?.name],
                  ['Location',   selected.location],
                  ['Priority',   selected.priority],
                  ['Scheduled',  selected.scheduled_date ? new Date(selected.scheduled_date).toLocaleDateString() : '—'],
                  ['Assigned To',selected.assigned_employee?.user?.name || 'Unassigned'],
                  ['Created',    selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{k}</p>
                    <p className="font-medium text-slate-900">{v || '—'}</p>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">{selected.description}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status:</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[selected.status] || 'bg-slate-100 text-slate-700'}`}>
                  {selected.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
