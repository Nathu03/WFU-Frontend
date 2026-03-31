'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Search, Download, Calendar, Clock, Users, UserCheck, UserX,
  Loader2, MapPin, ChevronLeft, ChevronRight, Plus, Edit, RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ATTENDANCE_STATUSES } from '@/lib/enums';

function FieldRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export default function AttendancePage() {
  const [search, setSearch]               = useState('');
  const [departmentFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter]   = useState<string>('all');
  const [selectedDate, setDate]           = useState(new Date().toISOString().split('T')[0]);

  // dialogs
  const [recordOpen, setRecordOpen]       = useState(false);
  const [editRecord, setEditRecord]       = useState<any>(null);

  const queryClient = useQueryClient();

  /* ── Queries ── */
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendance', selectedDate, departmentFilter, statusFilter, search],
    queryFn: () => api.get('/attendance', {
      params: { date: selectedDate, department: departmentFilter !== 'all' ? departmentFilter : undefined, status: statusFilter !== 'all' ? statusFilter : undefined, search: search || undefined, per_page: 100 },
    }),
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/employees/departments'),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-active'],
    queryFn: () => api.get('/employees', { params: { status: 'active', per_page: 200 } }),
  });

  /* ── Mutations ── */
  const checkInMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/attendance/manual-entry', payload),
    onSuccess: () => {
      toast.success('Attendance recorded');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setRecordOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to record attendance'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      api.put(`/attendance/${id}`, data),
    onSuccess: () => {
      toast.success('Attendance updated');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setEditRecord(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const attendance: any[] = data?.data?.data || [];
  const departments: string[] = departmentsData?.data?.data || [];
  const employees: any[] = employeesData?.data?.data || [];

  // compute stats from records
  const stats = {
    total:   employees.length,
    present: attendance.filter((r: any) => r.check_in_time && !r.is_late).length,
    absent:  attendance.filter((r: any) => !r.check_in_time).length,
    late:    attendance.filter((r: any) => r.is_late).length,
  };

  const navigate = (dir: 'prev' | 'next') => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
    setDate(d.toISOString().split('T')[0]);
  };

  const statusBadge = (record: any) => {
    const s = record.status || (record.check_in_time ? 'present' : 'absent');
    const map: Record<string, string> = {
      present:  'bg-emerald-100 text-emerald-700',
      late:     'bg-amber-100 text-amber-700',
      absent:   'bg-red-100 text-red-700',
      half_day: 'bg-blue-100 text-blue-700',
      on_leave: 'bg-violet-100 text-violet-700',
      holiday:  'bg-slate-100 text-slate-600',
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[s] || 'bg-slate-100 text-slate-700'}`}>
        {s?.replace(/_/g, ' ')}
      </span>
    );
  };

  const fmtTime = (t: string | null) => {
    if (!t) return '—';
    return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDuration = (mins: number | null) => {
    if (!mins) return '—';
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const handleRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    checkInMutation.mutate({
      employee_id:    fd.get('employee_id'),
      date:           fd.get('date'),
      check_in_time:  fd.get('check_in') || undefined,
      check_out_time: fd.get('check_out') || undefined,
      status:         fd.get('status') || 'present',
      notes:          fd.get('notes') || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editRecord.id,
      data: {
        check_in_time:  fd.get('check_in') ? `${fd.get('check_in')}:00` : undefined,
        check_out_time: fd.get('check_out') ? `${fd.get('check_out')}:00` : undefined,
        status:         fd.get('status'),
        notes:          fd.get('notes') || undefined,
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track employee attendance and work hours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={() => setRecordOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Record Attendance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: stats.total,   icon: Users,      color: 'bg-blue-100 text-blue-600' },
          { label: 'Present',         value: stats.present, icon: UserCheck,  color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Absent',          value: stats.absent,  icon: UserX,      color: 'bg-red-100 text-red-600' },
          { label: 'Late',            value: stats.late,    icon: Clock,      color: 'bg-amber-100 text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Date & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('prev')}><ChevronLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-slate-500" />
            <Input type="date" value={selectedDate} onChange={(e) => setDate(e.target.value)}
              className="border-0 p-0 h-auto text-center font-semibold text-slate-900 w-36" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('next')}><ChevronRight className="w-4 h-4" /></Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={departmentFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[155px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ATTENDANCE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
            ) : attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-500 font-medium">No attendance records for this date</p>
                  <p className="text-slate-400 text-xs mt-1">Records appear once employees check in, or you can add them manually.</p>
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-indigo-700">
                          {record.employee?.name?.charAt(0)?.toUpperCase() || record.employee?.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{record.employee?.name || record.employee?.user?.name}</p>
                        <p className="text-xs text-slate-500">{record.employee?.employee_code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                      {record.employee?.department || '—'}
                    </span>
                  </TableCell>
                  <TableCell>{statusBadge(record)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />{fmtTime(record.check_in_time)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />{fmtTime(record.check_out_time)}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">{fmtDuration(record.working_hours ? Math.round(record.working_hours * 60) : null)}</TableCell>
                  <TableCell>
                    {record.check_in_location ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {record.check_in_location.latitude?.toFixed(3)}, {record.check_in_location.longitude?.toFixed(3)}
                      </span>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditRecord(record)} className="text-slate-500 hover:text-indigo-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── RECORD ATTENDANCE DIALOG ── */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Manual Attendance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecord} className="space-y-4 mt-2">
            <FieldRow label="Employee *" htmlFor="att-emp">
              <Select name="employee_id" required>
                <SelectTrigger id="att-emp"><SelectValue placeholder="Select employee…" /></SelectTrigger>
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
            </FieldRow>

            <div className="grid grid-cols-3 gap-4">
              <FieldRow label="Date *" htmlFor="att-date">
                <Input id="att-date" name="date" type="date" defaultValue={selectedDate} required />
              </FieldRow>
              <FieldRow label="Check-in Time" htmlFor="att-in">
                <Input id="att-in" name="check_in" type="time" />
              </FieldRow>
              <FieldRow label="Check-out Time" htmlFor="att-out">
                <Input id="att-out" name="check_out" type="time" />
              </FieldRow>
            </div>

            <FieldRow label="Status *" htmlFor="att-status">
              <Select name="status" defaultValue="present" required>
                <SelectTrigger id="att-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow label="Notes" htmlFor="att-notes">
              <Textarea id="att-notes" name="notes" placeholder="Optional notes (reason for absence, late reason, etc.)" rows={2} />
            </FieldRow>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={checkInMutation.isPending}>
                {checkInMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recording…</> : 'Record Attendance'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT ATTENDANCE DIALOG ── */}
      <Dialog open={editRecord !== null} onOpenChange={(open) => !open && setEditRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                <p className="font-semibold text-slate-900">{editRecord.employee?.name || editRecord.employee?.user?.name}</p>
                <p className="text-slate-500">{editRecord.employee?.department} • {selectedDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Check-in Time" htmlFor="edit-in">
                  <Input id="edit-in" name="check_in" type="time"
                    defaultValue={editRecord.check_in_time ? String(editRecord.check_in_time).slice(0, 5) : ''} />
                </FieldRow>
                <FieldRow label="Check-out Time" htmlFor="edit-out">
                  <Input id="edit-out" name="check_out" type="time"
                    defaultValue={editRecord.check_out_time ? String(editRecord.check_out_time).slice(0, 5) : ''} />
                </FieldRow>
              </div>

              <FieldRow label="Status" htmlFor="edit-status">
                <Select name="status" defaultValue={editRecord.status || 'present'}>
                  <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Notes" htmlFor="edit-notes">
                <Textarea id="edit-notes" name="notes" defaultValue={editRecord.notes || ''} rows={2} />
              </FieldRow>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditRecord(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
