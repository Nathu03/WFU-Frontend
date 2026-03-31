'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Clock, CheckCircle, Play, Calendar, MapPin, Wrench,
  Loader2, LogIn, LogOut, Package, AlertCircle, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function EmployeeDashboardPage() {
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const queryClient = useQueryClient();

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['my-attendance-today'],
    queryFn: () => api.get('/attendance/today'),
  });

  const { data: assignedTasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-assigned-tasks'],
    queryFn: () => api.get('/employee/tasks'),
  });

  const { data: statsData } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => api.get('/employee/stats'),
  });

  const checkInMutation = useMutation({
    mutationFn: (data: any) => api.post('/attendance/check-in', data),
    onSuccess: () => {
      toast.success('Checked in successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-attendance-today'] });
      setCheckInDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check in');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: any) => api.post('/attendance/check-out', data),
    onSuccess: () => {
      toast.success('Checked out successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-attendance-today'] });
      setCheckOutDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to check out');
    },
  });

  const attendance = attendanceData?.data?.data;
  const tasks = assignedTasksData?.data?.data || [];
  const stats = statsData?.data?.data || {};

  const isCheckedIn = !!attendance?.check_in;
  const isCheckedOut = !!attendance?.check_out;

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          toast.error('Unable to get location. Please enable location services.');
        }
      );
    }
  };

  const handleCheckIn = () => {
    checkInMutation.mutate({
      notes,
      location,
    });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({
      notes,
      location,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your work overview.</p>
        </div>
        <div className="flex gap-2">
          {!isCheckedIn ? (
            <Button onClick={() => { getLocation(); setCheckInDialogOpen(true); }}>
              <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
              Check In
            </Button>
          ) : !isCheckedOut ? (
            <Button variant="outline" onClick={() => { getLocation(); setCheckOutDialogOpen(true); }}>
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              Check Out
            </Button>
          ) : (
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Day Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Attendance Card */}
      <div className="bg-gradient-to-r from-brand-primary to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">Today's Attendance</p>
            <p className="text-2xl font-bold mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-white/80 text-xs uppercase">Check In</p>
              <p className="text-xl font-bold">
                {attendance?.check_in
                  ? new Date(attendance.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-xs uppercase">Check Out</p>
              <p className="text-xl font-bold">
                {attendance?.check_out
                  ? new Date(attendance.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-xs uppercase">Hours</p>
              <p className="text-xl font-bold">
                {attendance?.work_minutes
                  ? `${Math.floor(attendance.work_minutes / 60)}h ${attendance.work_minutes % 60}m`
                  : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Wrench className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.assigned_tasks || 0}</p>
              <p className="text-sm text-muted-foreground">Assigned Tasks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Play className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.in_progress || 0}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed_today || 0}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.this_month || 0}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">My Assigned Tasks</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employee/tasks">View All</Link>
          </Button>
        </div>
        <div className="divide-y">
          {tasksLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No tasks assigned to you</p>
            </div>
          ) : (
            tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{task.reference_code}</span>
                      <Badge
                        className={
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="font-medium">{task.title || task.service?.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {task.scheduled_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" aria-hidden="true" />
                          {new Date(task.scheduled_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.service_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" />
                          {task.service_location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/employee/tasks/${task.id}`}>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Check In Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {location && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                Location captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes for today..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckIn} disabled={checkInMutation.isPending}>
              {checkInMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Out Dialog */}
      <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {location && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                Location captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="checkout-notes">End of day notes (optional)</Label>
              <Textarea
                id="checkout-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summary of work done today..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckOutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckOut} disabled={checkOutMutation.isPending}>
              {checkOutMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
