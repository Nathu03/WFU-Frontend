'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@/components/ui/dialog';
import {
  Search, Download, Calendar, Eye, Shield, Activity,
  Loader2, Clock, User, FileText,
} from 'lucide-react';
import { api } from '@/lib/api';

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  login: 'bg-purple-100 text-purple-800',
  logout: 'bg-gray-100 text-gray-800',
  payment_submitted: 'bg-yellow-100 text-yellow-800',
  payment_verified: 'bg-cyan-100 text-cyan-800',
  payment_approved: 'bg-green-100 text-green-800',
  payment_rejected: 'bg-red-100 text-red-800',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, actionFilter, dateFrom, dateTo],
    queryFn: () => api.get('/admin/audit-logs', {
      params: {
        page,
        search: search || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        per_page: 20,
      },
    }),
  });

  const rawLogs = data?.data?.data;
  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const meta = data?.data?.meta;

  const formatChanges = (oldValue: any, newValue: any) => {
    const changes: { field: string; old: any; new: any }[] = [];
    
    if (!oldValue && !newValue) return changes;
    
    const allKeys = new Set([
      ...Object.keys(oldValue || {}),
      ...Object.keys(newValue || {}),
    ]);

    allKeys.forEach((key) => {
      const oldVal = oldValue?.[key];
      const newVal = newValue?.[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, old: oldVal, new: newVal });
      }
    });

    return changes;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-slate-500">Track all system activities and changes</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" aria-hidden="true" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{meta?.total || 0}</p>
              <p className="text-sm text-slate-500">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter((l: any) => l.action_type === 'create').length}</p>
              <p className="text-sm text-slate-500">Creates</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter((l: any) => l.action_type?.includes('payment')).length}</p>
              <p className="text-sm text-slate-500">Payment Actions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter((l: any) => l.action_type === 'login').length}</p>
              <p className="text-sm text-slate-500">Logins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="payment_submitted">Payment Submitted</SelectItem>
            <SelectItem value="payment_verified">Payment Verified</SelectItem>
            <SelectItem value="payment_approved">Payment Approved</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-auto"
          />
          <span className="text-slate-500">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action_type] || 'bg-gray-100'}>
                      {log.action_type?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {log.performer?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{log.performer?.name || 'System'}</p>
                        <p className="text-xs text-slate-500">{log.performer?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{log.target_type}</p>
                      <p className="text-xs text-slate-500">ID: {log.target_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{log.ip_address || '-'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-slate-500">
              Showing {meta.from} to {meta.to} of {meta.total} results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Action</p>
                  <Badge className={actionColors[selectedLog.action_type] || 'bg-gray-100'}>
                    {selectedLog.action_type?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Timestamp</p>
                  <p className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Performed By</p>
                  <p className="font-medium">{selectedLog.performer?.name || 'System'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">IP Address</p>
                  <p className="font-mono">{selectedLog.ip_address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Target</p>
                  <p className="font-medium">{selectedLog.target_type} (ID: {selectedLog.target_id})</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">User Agent</p>
                  <p className="text-xs truncate">{selectedLog.user_agent || '-'}</p>
                </div>
              </div>

              {(selectedLog.previous_value || selectedLog.new_value) && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Changes</p>
                  <div className="bg-slate-100 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                    {formatChanges(selectedLog.previous_value, selectedLog.new_value).map((change, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{change.field}:</span>
                        <span className="text-red-600 line-through mx-2">
                          {JSON.stringify(change.old) || 'null'}
                        </span>
                        <span className="text-green-600">
                          {JSON.stringify(change.new) || 'null'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
