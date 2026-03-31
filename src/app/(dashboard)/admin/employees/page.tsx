'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Users, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Employee {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
  joined_at: string;
  salary: { base: number; formatted: string };
}

interface EmployeeStats {
  total: number;
  active: number;
  on_leave: number;
  terminated: number;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active:     { label: 'Active',     cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  on_leave:   { label: 'On Leave',   cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  suspended:  { label: 'Suspended',  cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
  terminated: { label: 'Terminated', cls: 'bg-red-100 text-red-700 border border-red-200' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { label: status, cls: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function EmployeesPage() {
  const [search, setSearch]     = useState('');
  const [department, setDep]    = useState('all');
  const [status, setStatus]     = useState('all');
  const [dialogOpen, setDialog] = useState(false);
  const queryClient             = useQueryClient();

  const { data: empData, isLoading } = useQuery({
    queryKey: ['employees', search, department, status],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (search) p.append('search', search);
      if (department !== 'all') p.append('department', department);
      if (status !== 'all') p.append('status', status);
      const r = await apiClient.get(`/employees?${p}`);
      return r.data;
    },
  });

  const { data: stats } = useQuery<EmployeeStats>({
    queryKey: ['employee-stats'],
    queryFn: async () => (await apiClient.get('/employees/statistics')).data.data,
  });

  const { data: deptList } = useQuery<string[]>({
    queryKey: ['departments'],
    queryFn: async () => (await apiClient.get('/employees/departments')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const r = await apiClient.post('/employees', data);
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      toast.success('Employee created successfully');
      setDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { data[k] = v as string; });
    createMutation.mutate(data);
  };

  const employees: Employee[] = empData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your workforce and team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" placeholder="+94 7X XXX XXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nic">NIC</Label>
                  <Input id="nic" name="nic" placeholder="200012345678" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department *</Label>
                  <Input id="department" name="department" placeholder="e.g. Engineering" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="position">Position *</Label>
                  <Input id="position" name="position" placeholder="e.g. Senior Technician" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salary">Salary (LKR) *</Label>
                  <Input id="salary" name="salary" type="number" min="0" placeholder="50000" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="joined_at">Join Date *</Label>
                  <Input id="joined_at" name="joined_at" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contract_start">Contract Start</Label>
                  <Input id="contract_start" name="contract_start" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contract_end">Contract End</Label>
                  <Input id="contract_end" name="contract_end" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emergency_contact_name">Emergency Contact</Label>
                  <Input id="emergency_contact_name" name="emergency_contact_name" placeholder="Contact name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emergency_contact_phone">Emergency Phone</Label>
                  <Input id="emergency_contact_phone" name="emergency_contact_phone" placeholder="+94 7X XXX XXXX" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="Street, City, Province" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                  ) : 'Create Employee'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Employees', value: stats?.total ?? 0, icon: Users,     color: 'bg-indigo-100 text-indigo-600',  val: 'text-slate-900' },
          { label: 'Active',          value: stats?.active ?? 0, icon: UserCheck, color: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700' },
          { label: 'On Leave',        value: stats?.on_leave ?? 0, icon: Clock,   color: 'bg-amber-100 text-amber-600',    val: 'text-amber-700' },
          { label: 'Terminated',      value: stats?.terminated ?? 0, icon: UserX, color: 'bg-red-100 text-red-600',        val: 'text-red-700' },
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
            placeholder="Search by name, email, code, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={department} onValueChange={setDep}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {deptList?.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Code</TableHead>
                <TableHead>Name / Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading employees…
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-500 font-medium">No employees found</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        {emp.employee_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{emp.department}</TableCell>
                    <TableCell className="text-slate-700">{emp.position}</TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {emp.joined_at ? new Date(emp.joined_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emp.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
