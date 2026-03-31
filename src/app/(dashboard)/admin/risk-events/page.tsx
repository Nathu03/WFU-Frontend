'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  Loader2,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

const severityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function RiskEventsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const { data: listData, isLoading } = useQuery({
    queryKey: ['risk-events', page, statusFilter, riskLevelFilter],
    queryFn: () =>
      api.get('/admin/risk-events', {
        params: {
          page,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          risk_level: riskLevelFilter !== 'all' ? riskLevelFilter : undefined,
          per_page: 20,
        },
      }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['risk-events-statistics'],
    queryFn: () => api.get('/admin/risk-events/statistics'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      api.post(`/admin/risk-events/${id}/resolve`, { resolution_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-events'] });
      queryClient.invalidateQueries({ queryKey: ['risk-events-statistics'] });
      setResolvingId(null);
      setResolveNotes('');
      setSelectedEvent(null);
    },
    onError: () => setResolvingId(null),
  });

  const events = Array.isArray(listData?.data?.data) ? listData.data.data : [];
  const meta = listData?.data?.meta;
  const stats = statsData?.data?.data ?? {};
  const byLevel = Array.isArray(stats.by_level) ? stats.by_level : [];

  const handleResolve = (event: any) => {
    if (!resolveNotes.trim()) return;
    setResolvingId(event.id);
    resolveMutation.mutate({ id: event.id, notes: resolveNotes.trim() });
  };

  const openResolveDialog = (event: any) => {
    setSelectedEvent(event);
    setResolveNotes('');
    setResolvingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Risk Monitor</h1>
          <p className="text-slate-500">View and resolve risk events</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total ?? 0}</p>
              <p className="text-sm text-slate-500">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.open ?? 0}</p>
              <p className="text-sm text-slate-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.resolved ?? 0}</p>
              <p className="text-sm text-slate-500">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {byLevel.find((x: any) => x.risk_level === 'critical')?.count ?? 0}
              </p>
              <p className="text-sm text-slate-500">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Risk level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Code / Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported by</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No risk events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
                      {event.created_at
                        ? new Date(event.created_at).toLocaleString()
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{event.event_code || '-'}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {event.title || event.description || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{event.category || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        severityColors[event.severity] || 'bg-gray-100 text-gray-800'
                      }
                    >
                      {event.severity || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.is_resolved ? (
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">Open</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {event.reported_by_user?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="text-sm">
                        {event.reported_by_user?.name || 'System'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                        aria-label="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!event.is_resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResolveDialog(event)}
                          aria-label="Resolve"
                        >
                          Resolve
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
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-slate-500">
              Showing {meta.from} to {meta.to} of {meta.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === meta.last_page}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail / Resolve Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => {
        setSelectedEvent(null);
        setResolveNotes('');
        setResolvingId(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {resolvingId !== null ? 'Resolve risk event' : 'Risk event details'}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Event code</p>
                  <p className="font-medium">{selectedEvent.event_code || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="font-medium">{selectedEvent.category || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Severity</p>
                  <Badge
                    className={
                      severityColors[selectedEvent.severity] ||
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {selectedEvent.severity || '-'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  {selectedEvent.is_resolved ? (
                    <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">Open</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reported by</p>
                  <p className="font-medium">
                    {selectedEvent.reported_by_user?.name || 'System'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">
                    {selectedEvent.created_at
                      ? new Date(selectedEvent.created_at).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Title</p>
                <p className="font-medium">{selectedEvent.title || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Description</p>
                <p className="text-sm">{selectedEvent.description || '-'}</p>
              </div>
              {selectedEvent.resolution_notes && (
                <div>
                  <p className="text-sm text-slate-500">Resolution notes</p>
                  <p className="text-sm">{selectedEvent.resolution_notes}</p>
                </div>
              )}

              {resolvingId !== null && (
                <div className="space-y-2">
                  <Label htmlFor="resolve-notes">Resolution notes (required)</Label>
                  <Textarea
                    id="resolve-notes"
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Enter resolution notes..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {resolvingId === null && selectedEvent && !selectedEvent.is_resolved && (
              <Button onClick={() => setResolvingId(selectedEvent.id)}>
                Resolve this event
              </Button>
            )}
            {resolvingId !== null && selectedEvent && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResolvingId(null);
                    setResolveNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleResolve(selectedEvent)}
                  disabled={!resolveNotes.trim() || resolveMutation.isPending}
                >
                  {resolveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit resolution'
                  )}
                </Button>
              </>
            )}
            {selectedEvent?.is_resolved && (
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
