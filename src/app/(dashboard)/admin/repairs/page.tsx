'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search, Wrench, Clock, CheckCircle, UserPlus, Eye,
  AlertTriangle, Plus, Loader2, Play,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Repair {
  id: number;
  reference_code: string;
  client: { id: number; name: string; phone: string };
  item: { type: string; brand: string; model: string };
  status: { current: string; label: string; color: string };
  priority: { value: string; label: string };
  assigned_employee: { id: number; user: { name: string } } | null;
  scheduling: { scheduled_date: string } | null;
  issue_description?: string;
  created_at: string;
}

interface Employee {
  id: number;
  user: { name: string };
  department: string;
}

const STATUS_BG: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  assigned:    'bg-blue-100 text-blue-700',
  diagnosing:  'bg-violet-100 text-violet-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  on_hold:     'bg-slate-100 text-slate-600',
  completed:   'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-red-100 text-red-700',
};

const PRIORITY_BG: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-slate-100 text-slate-600',
};

function FieldRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export default function RepairsPage() {
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('all');
  const [priorityF, setPriority]= useState('all');

  // dialogs
  const [createOpen, setCreateOpen]       = useState(false);
  const [assignOpen, setAssignOpen]       = useState(false);
  const [statusOpen, setStatusOpen]       = useState(false);
  const [detailOpen, setDetailOpen]       = useState(false);
  const [selected, setSelected]           = useState<Repair | null>(null);
  const [assignEmpId, setAssignEmpId]     = useState('');
  const [newStatus, setNewStatus]         = useState('');
  const [statusNotes, setStatusNotes]     = useState('');

  const queryClient = useQueryClient();

  /* ── Queries ── */
  const { data: repairsData, isLoading } = useQuery({
    queryKey: ['repairs', search, statusF, priorityF],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.append('search', search);
      if (statusF !== 'all') p.append('status', statusF);
      if (priorityF !== 'all') p.append('priority', priorityF);
      return (await apiClient.get(`/repairs?${p}`)).data;
    },
  });

  const { data: employeesData } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => (await apiClient.get('/employees?status=active&per_page=100')).data,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-for-repair'],
    queryFn: async () => (await apiClient.get('/admin/users?role=client&per_page=100')).data,
  });

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiClient.post('/repairs', payload),
    onSuccess: () => {
      toast.success('Repair request created');
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      setCreateOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create repair request'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ repairId, employeeId }: { repairId: number; employeeId: number }) =>
      apiClient.post(`/repairs/${repairId}/assign`, { employee_id: employeeId }),
    onSuccess: () => {
      toast.success('Technician assigned');
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      setAssignOpen(false);
      setAssignEmpId('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Assignment failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ repairId, status, notes }: { repairId: number; status: string; notes?: string }) =>
      apiClient.post(`/repairs/${repairId}/status`, { status, notes }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['repairs'] });
      setStatusOpen(false);
      setNewStatus('');
      setStatusNotes('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Status update failed'),
  });

  const repairs: Repair[]  = repairsData?.data || [];
  const employees: Employee[] = employeesData?.data || [];
  const clients: any[]     = clientsData?.data || [];

  const pendingCount    = repairs.filter((r) => r.status.current === 'pending').length;
  const inProgressCount = repairs.filter((r) => ['assigned', 'in_progress', 'diagnosing'].includes(r.status.current)).length;
  const completedCount  = repairs.filter((r) => r.status.current === 'completed').length;
  const urgentCount     = repairs.filter((r) => r.priority.value === 'urgent').length;

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      client_id:          fd.get('client_id') && fd.get('client_id') !== 'walkin' ? fd.get('client_id') : undefined,
      contact_name:       fd.get('contact_name'),
      contact_phone:      fd.get('contact_phone'),
      item_type:          fd.get('item_type'),
      item_brand:         fd.get('item_brand') || undefined,
      item_model:         fd.get('item_model') || undefined,
      issue_description:  fd.get('issue_description'),
      priority:           fd.get('priority'),
      scheduled_date:     fd.get('scheduled_date') || undefined,
      estimated_cost:     fd.get('estimated_cost') || undefined,
      notes:              fd.get('notes') || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Repair Services</h1>
          <p className="page-subtitle">Manage repair requests and assign technicians</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />New Repair Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: 'Pending',     value: pendingCount,    icon: Clock,         color: 'text-amber-500',   num: 'text-amber-600' },
          { title: 'In Progress', value: inProgressCount, icon: Wrench,        color: 'text-blue-500',    num: 'text-blue-600' },
          { title: 'Completed',   value: completedCount,  icon: CheckCircle,   color: 'text-emerald-500', num: 'text-emerald-600' },
          { title: 'Urgent',      value: urgentCount,     icon: AlertTriangle, color: 'text-red-500',     num: 'text-red-600' },
        ].map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{s.title}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${s.num}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search by reference, client, item…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="diagnosing">Diagnosing</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityF} onValueChange={setPriority}>
              <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-12"><Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
              ) : repairs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Wrench className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-500 font-medium">No repair requests found</p>
                  </TableCell>
                </TableRow>
              ) : (
                repairs.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {repair.reference_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-900">{repair.client?.name}</p>
                      <p className="text-xs text-slate-500">{repair.client?.phone}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-800">{repair.item?.type}</p>
                      <p className="text-xs text-slate-500">{[repair.item?.brand, repair.item?.model].filter(Boolean).join(' ')}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_BG[repair.priority?.value] || 'bg-slate-100 text-slate-700'}`}>
                        {repair.priority?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {repair.assigned_employee
                        ? repair.assigned_employee.user?.name
                        : <span className="text-slate-400 italic text-sm">Unassigned</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BG[repair.status?.current] || 'bg-slate-100 text-slate-700'}`}>
                        {repair.status?.label || repair.status?.current}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {repair.scheduling?.scheduled_date
                        ? new Date(repair.scheduling.scheduled_date).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(repair); setDetailOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!repair.assigned_employee && repair.status.current === 'pending' && (
                          <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50"
                            onClick={() => { setSelected(repair); setAssignEmpId(''); setAssignOpen(true); }}>
                            <UserPlus className="h-4 w-4 mr-1" />Assign
                          </Button>
                        )}
                        {['assigned', 'diagnosing', 'in_progress'].includes(repair.status.current) && (
                          <Button size="sm" variant="ghost" className="text-violet-600 hover:bg-violet-50"
                            onClick={() => { setSelected(repair); setNewStatus(''); setStatusNotes(''); setStatusOpen(true); }}>
                            <Play className="h-4 w-4" />
                          </Button>
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

      {/* ── CREATE REPAIR DIALOG ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Repair Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5 mt-2">
            {/* Client */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Client Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow label="Select Client (optional)" htmlFor="create-client">
                  <Select name="client_id" defaultValue="walkin">
                    <SelectTrigger id="create-client"><SelectValue placeholder="Walk-in / Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walkin">Walk-in (no account)</SelectItem>
                      {clients.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name} — {c.phone || c.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Contact Name *" htmlFor="create-cname">
                  <Input id="create-cname" name="contact_name" placeholder="Full name" required />
                </FieldRow>
                <FieldRow label="Contact Phone *" htmlFor="create-cphone">
                  <Input id="create-cphone" name="contact_phone" placeholder="+94 7X XXX XXXX" required />
                </FieldRow>
              </div>
            </div>

            {/* Item */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Item Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldRow label="Item Type *" htmlFor="create-itype">
                  <Select name="item_type" required>
                    <SelectTrigger id="create-itype"><SelectValue placeholder="Select type…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Smartphone">Smartphone</SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Desktop PC">Desktop PC</SelectItem>
                      <SelectItem value="Printer">Printer</SelectItem>
                      <SelectItem value="TV">TV / Monitor</SelectItem>
                      <SelectItem value="AC">Air Conditioner</SelectItem>
                      <SelectItem value="Washing Machine">Washing Machine</SelectItem>
                      <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="Camera">Camera</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow label="Brand" htmlFor="create-ibrand">
                  <Input id="create-ibrand" name="item_brand" placeholder="Samsung, Apple…" />
                </FieldRow>
                <FieldRow label="Model" htmlFor="create-imodel">
                  <Input id="create-imodel" name="item_model" placeholder="Galaxy S22, M1…" />
                </FieldRow>
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow label="Priority *" htmlFor="create-priority">
                <Select name="priority" defaultValue="medium" required>
                  <SelectTrigger id="create-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Scheduled Date" htmlFor="create-sched">
                <Input id="create-sched" name="scheduled_date" type="datetime-local" />
              </FieldRow>
              <FieldRow label="Estimated Cost (LKR)" htmlFor="create-cost">
                <Input id="create-cost" name="estimated_cost" type="number" min="0" step="0.01" placeholder="0.00" />
              </FieldRow>
            </div>

            <FieldRow label="Issue Description *" htmlFor="create-issue">
              <Textarea id="create-issue" name="issue_description" placeholder="Describe the problem in detail…" rows={3} required />
            </FieldRow>

            <FieldRow label="Internal Notes" htmlFor="create-notes">
              <Textarea id="create-notes" name="notes" placeholder="Admin internal notes…" rows={2} />
            </FieldRow>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : 'Create Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── ASSIGN TECHNICIAN DIALOG ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-sm">
                <p className="text-slate-700"><span className="font-semibold text-slate-900">Reference:</span> {selected.reference_code}</p>
                <p className="text-slate-700"><span className="font-semibold text-slate-900">Item:</span> {selected.item?.type} — {selected.item?.brand} {selected.item?.model}</p>
                <p className="text-slate-700"><span className="font-semibold text-slate-900">Client:</span> {selected.client?.name}</p>
              </div>
              <FieldRow label="Select Technician *" htmlFor="assign-tech">
                <Select value={assignEmpId} onValueChange={setAssignEmpId}>
                  <SelectTrigger id="assign-tech"><SelectValue placeholder="Choose a technician…" /></SelectTrigger>
                  <SelectContent>
                    {employees.length === 0
                      ? <SelectItem value="_none" disabled>No active employees</SelectItem>
                      : employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.user?.name} — {emp.department}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button
              disabled={!assignEmpId || assignMutation.isPending}
              onClick={() => selected && assignMutation.mutate({ repairId: selected.id, employeeId: parseInt(assignEmpId) })}
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
            <DialogTitle>Update Repair Status</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Current:</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BG[selected.status?.current] || 'bg-slate-100 text-slate-700'}`}>
                  {selected.status?.label || selected.status?.current}
                </span>
              </div>
              <FieldRow label="New Status *">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue placeholder="Select new status…" /></SelectTrigger>
                  <SelectContent>
                    {selected.status?.current === 'assigned' && <SelectItem value="diagnosing">Diagnosing</SelectItem>}
                    {['assigned', 'diagnosing'].includes(selected.status?.current) && <SelectItem value="in_progress">In Progress</SelectItem>}
                    {selected.status?.current === 'in_progress' && (
                      <>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    )}
                    {selected.status?.current === 'on_hold' && <SelectItem value="in_progress">Resume (In Progress)</SelectItem>}
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Notes (optional)" htmlFor="status-notes">
                <Textarea id="status-notes" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Add notes about this status change…" rows={3} />
              </FieldRow>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button
              disabled={!newStatus || statusMutation.isPending}
              onClick={() => selected && statusMutation.mutate({ repairId: selected.id, status: newStatus, notes: statusNotes || undefined })}
            >
              {statusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DETAILS DIALOG ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Repair Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Reference',  selected.reference_code],
                  ['Client',     selected.client?.name],
                  ['Phone',      selected.client?.phone],
                  ['Item',       `${selected.item?.type} — ${[selected.item?.brand, selected.item?.model].filter(Boolean).join(' ')}`],
                  ['Priority',   selected.priority?.label],
                  ['Scheduled',  selected.scheduling?.scheduled_date ? new Date(selected.scheduling.scheduled_date).toLocaleDateString() : '—'],
                  ['Assigned',   selected.assigned_employee?.user?.name || 'Unassigned'],
                  ['Created',    new Date(selected.created_at).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{k}</p>
                    <p className="font-medium text-slate-900">{v || '—'}</p>
                  </div>
                ))}
              </div>
              {selected.issue_description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Issue Description</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">{selected.issue_description}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status:</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BG[selected.status?.current] || 'bg-slate-100 text-slate-700'}`}>
                  {selected.status?.label || selected.status?.current}
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
