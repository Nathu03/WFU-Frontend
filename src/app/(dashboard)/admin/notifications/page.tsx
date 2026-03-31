'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bell, Check, CheckCheck, Trash2, Loader2, Package,
  Clock, AlertCircle, Info, CheckCircle, Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const typeIcons: Record<string, any> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
  service_update: Package,
  payment: Mail,
};

const typeColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  service_update: 'bg-purple-100 text-purple-600',
  payment: 'bg-cyan-100 text-cyan-600',
};

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', filter],
    queryFn: () => api.get('/admin/notifications', {
      params: { filter: filter === 'unread' ? 'unread' : undefined, per_page: 50 },
    }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.post('/admin/notifications/read-all'),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread'] });
    },
  });

  const notifications = Array.isArray(data?.data?.data) ? data.data.data : [];
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
              Mark all read
            </Button>
          )}
          <div className="flex rounded-lg border p-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md ${filter === 'all' ? 'bg-slate-100 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-md ${filter === 'unread' ? 'bg-slate-100 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p>{filter === 'unread' ? "You've read all your notifications" : "You don't have any notifications yet"}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification: any) => {
              const Icon = typeIcons[notification.type] || Bell;
              const iconColor = typeColors[notification.type] || 'bg-gray-100 text-gray-600';
              return (
                <li
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-4 p-4 hover:bg-slate-50/50',
                    !notification.read_at && 'bg-blue-50/30'
                  )}
                >
                  <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 w-9 h-9 flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className={cn(
                      'font-medium text-sm leading-tight',
                      !notification.read_at ? 'text-slate-900' : 'text-slate-600'
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-500 leading-snug line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">
                        {getRelativeTime(notification.created_at)}
                      </span>
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs -mr-2"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <Check className="w-3 h-3 mr-1" aria-hidden="true" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
