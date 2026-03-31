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
  Search, Plus, UserX, UserCheck, Shield, Users,
  Loader2, Mail, Phone, Calendar, Eye, Edit,
} from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  inactive:  'bg-slate-100 text-slate-600',
  suspended: 'bg-red-100 text-red-700',
  pending:   'bg-amber-100 text-amber-700',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin:  'bg-purple-100 text-purple-800',
  admin:        'bg-blue-100 text-blue-800',
  finance_head: 'bg-indigo-100 text-indigo-800',
  finance:      'bg-cyan-100 text-cyan-800',
  hr:           'bg-pink-100 text-pink-800',
  employee:     'bg-orange-100 text-orange-800',
  client:       'bg-emerald-100 text-emerald-800',
};

function FieldRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export default function UsersPage() {
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState<string>('all');
  const [statusFilter, setStatus]     = useState<string>('all');
  const [page, setPage]               = useState(1);

  // dialogs
  const [createOpen, setCreateOpen]   = useState(false);
  const [rolesOpen, setRolesOpen]     = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [selectedUser, setUser]       = useState<any>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const queryClient = useQueryClient();

  /* ── Queries ── */
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => api.get('/admin/users', {
      params: { page, search: search || undefined, role: roleFilter !== 'all' ? roleFilter : undefined, status: statusFilter !== 'all' ? statusFilter : undefined, per_page: 15 },
    }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/admin/roles'),
  });

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/admin/users', payload),
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const rolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      api.post(`/admin/users/${id}/roles`, { roles }),
    onSuccess: () => {
      toast.success('Roles updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setRolesOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update roles'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/users/${id}/suspend`),
    onSuccess: () => { toast.success('User suspended'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/users/${id}/activate`),
    onSuccess: () => { toast.success('User activated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  const rawUsers = data?.data?.data;
  const users: any[] = Array.isArray(rawUsers) ? rawUsers : [];
  const meta         = data?.data?.meta;
  const rawRoles     = rolesData?.data?.data;
  const roles: any[] = Array.isArray(rawRoles) ? rawRoles : [];

  const stats = {
    total:   meta?.total ?? users.length,
    active:  users.filter((u) => u.status === 'active').length,
    admins:  users.filter((u) => u.roles?.some((r: any) => ['super_admin', 'admin'].includes(r.slug))).length,
    clients: users.filter((u) => u.roles?.some((r: any) => r.slug === 'client')).length,
  };

  const openRoles = (user: any) => {
    setUser(user);
    setSelectedRoles(user.roles?.map((r: any) => r.slug) || []);
    setRolesOpen(true);
  };

  const openEdit = (user: any) => {
    setUser(user);
    setEditOpen(true);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rolesArr = roles.map((r) => r.slug).filter((slug) => fd.get(`role_${slug}`) === 'on');
    createMutation.mutate({
      name:     fd.get('name'),
      email:    fd.get('email'),
      phone:    fd.get('phone') || undefined,
      nic:      fd.get('nic') || undefined,
      address:  fd.get('address') || undefined,
      password: fd.get('password'),
      password_confirmation: fd.get('password_confirmation'),
      status:   fd.get('status') || 'active',
      roles:    rolesArr.length > 0 ? rolesArr : ['client'],
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: selectedUser.id,
      data: {
        name:    fd.get('name'),
        email:   fd.get('email'),
        phone:   fd.get('phone') || undefined,
        nic:     fd.get('nic') || undefined,
        address: fd.get('address') || undefined,
        status:  fd.get('status'),
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',     value: stats.total,   icon: Users,      color: 'bg-blue-100 text-blue-600' },
          { label: 'Active',          value: stats.active,  icon: UserCheck,  color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Administrators',  value: stats.admins,  icon: Shield,     color: 'bg-violet-100 text-violet-600' },
          { label: 'Clients',         value: stats.clients, icon: Users,      color: 'bg-orange-100 text-orange-600' },
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
          <Input placeholder="Search by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((r: any) => <SelectItem key={r.id} value={r.slug}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-500 font-medium">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {user.avatar
                          ? <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : <span className="text-sm font-semibold text-indigo-700">{user.name?.charAt(0)?.toUpperCase()}</span>}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {user.phone && <p className="text-sm text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{user.phone}</p>}
                      {user.nic   && <p className="text-xs text-slate-500">NIC: {user.nic}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((r: any) => (
                        <span key={r.id} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[r.slug] || 'bg-slate-100 text-slate-700'}`}>
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[user.status] || 'bg-slate-100 text-slate-600'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="text-slate-500 hover:text-slate-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openRoles(user)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        <Shield className="w-4 h-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button variant="ghost" size="sm" onClick={() => suspendMutation.mutate(user.id)} className="text-red-600 hover:bg-red-50"
                          disabled={suspendMutation.isPending}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => activateMutation.mutate(user.id)} className="text-emerald-600 hover:bg-emerald-50"
                          disabled={activateMutation.isPending}>
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Showing {meta.from}–{meta.to} of {meta.total}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE USER DIALOG ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow label="Full Name *" htmlFor="name">
                <Input id="name" name="name" placeholder="John Silva" required />
              </FieldRow>
              <FieldRow label="Email Address *" htmlFor="email">
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </FieldRow>
              <FieldRow label="Phone Number" htmlFor="phone">
                <Input id="phone" name="phone" placeholder="+94 7X XXX XXXX" />
              </FieldRow>
              <FieldRow label="NIC Number" htmlFor="nic">
                <Input id="nic" name="nic" placeholder="200012345678" />
              </FieldRow>
              <FieldRow label="Password *" htmlFor="password">
                <Input id="password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} />
              </FieldRow>
              <FieldRow label="Confirm Password *" htmlFor="password_confirmation">
                <Input id="password_confirmation" name="password_confirmation" type="password" placeholder="Repeat password" required minLength={8} />
              </FieldRow>
              <FieldRow label="Account Status" htmlFor="status">
                <Select name="status" defaultValue="active">
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>

            <FieldRow label="Address" htmlFor="address">
              <Textarea id="address" name="address" placeholder="Street, City, Province" rows={2} />
            </FieldRow>

            {/* Roles */}
            <div className="space-y-2">
              <Label>Assign Roles</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {roles.length === 0
                  ? <p className="text-sm text-slate-500 col-span-3">Loading roles…</p>
                  : roles.map((r: any) => (
                      <label key={r.id} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
                        <input type="checkbox" name={`role_${r.slug}`} className="rounded border-slate-300 text-indigo-600" />
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[r.slug] || 'bg-slate-100 text-slate-700'}`}>{r.name}</span>
                      </label>
                    ))}
              </div>
              <p className="text-xs text-slate-400">If no role selected, user will be assigned the &quot;client&quot; role by default.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT USER DIALOG ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow label="Full Name *" htmlFor="edit-name">
                  <Input id="edit-name" name="name" defaultValue={selectedUser.name} required />
                </FieldRow>
                <FieldRow label="Email *" htmlFor="edit-email">
                  <Input id="edit-email" name="email" type="email" defaultValue={selectedUser.email} required />
                </FieldRow>
                <FieldRow label="Phone" htmlFor="edit-phone">
                  <Input id="edit-phone" name="phone" defaultValue={selectedUser.phone} />
                </FieldRow>
                <FieldRow label="NIC" htmlFor="edit-nic">
                  <Input id="edit-nic" name="nic" defaultValue={selectedUser.nic} />
                </FieldRow>
                <FieldRow label="Status" htmlFor="edit-status">
                  <Select name="status" defaultValue={selectedUser.status}>
                    <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
              <FieldRow label="Address" htmlFor="edit-address">
                <Textarea id="edit-address" name="address" defaultValue={selectedUser.address} rows={2} />
              </FieldRow>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MANAGE ROLES DIALOG ── */}
      <Dialog open={rolesOpen} onOpenChange={setRolesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-700">{selectedUser.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedUser.name}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned Roles</Label>
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {roles.map((r: any) => (
                    <label key={r.id} className="flex items-center gap-3 cursor-pointer hover:bg-white rounded-lg p-1.5 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(r.slug)}
                        onChange={(e) => setSelectedRoles(e.target.checked
                          ? [...selectedRoles, r.slug]
                          : selectedRoles.filter((s) => s !== r.slug))}
                        className="rounded border-slate-300 text-indigo-600 h-4 w-4"
                      />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[r.slug] || 'bg-slate-100 text-slate-700'}`}>{r.name}</span>
                      {r.description && <span className="text-xs text-slate-500 truncate">{r.description}</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolesOpen(false)}>Cancel</Button>
            <Button
              onClick={() => rolesMutation.mutate({ id: selectedUser.id, roles: selectedRoles })}
              disabled={rolesMutation.isPending}
            >
              {rolesMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
