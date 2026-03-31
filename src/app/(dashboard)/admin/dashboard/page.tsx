'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useServiceRequestStatistics,
  useUpcomingServiceRequests,
  useOverdueServiceRequests,
} from '@/hooks/use-service-requests';
import { formatCurrency, formatDateTime, getStatusColor, getPriorityColor } from '@/lib/utils';
import {
  Activity, Clock, AlertTriangle, TrendingUp, Loader2, ArrowRight,
  CheckCircle2, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight,
  ClipboardList, Wrench, Package, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue, color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data: statsData, isLoading: statsLoading } = useServiceRequestStatistics();
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingServiceRequests(5);
  const { data: overdueData, isLoading: overdueLoading } = useOverdueServiceRequests();

  const stats = statsData?.data;
  const upcoming = upcomingData?.data || [];
  const overdue = overdueData?.data || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="text-sm text-indigo-600 font-medium mb-1">{greeting} 👋</p>
          <h1 className="section-title text-3xl">{user?.name ?? 'Admin'}</h1>
          <p className="section-subtitle">
            Here&apos;s what&apos;s happening with your operations today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reports">
              <Activity className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/service-requests/create">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/service-requests', icon: ClipboardList, label: 'Service Requests', iconBg: 'bg-blue-500' },
          { href: '/admin/employees', icon: Users, label: 'Employees', iconBg: 'bg-indigo-500' },
          { href: '/admin/rentals', icon: Package, label: 'Rentals', iconBg: 'bg-purple-500' },
          { href: '/admin/payments', icon: DollarSign, label: 'Payments', iconBg: 'bg-green-500' },
        ].map(({ href, icon: Icon, label, iconBg }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{label}</p>
              <p className="text-xs text-slate-500">Manage →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={statsLoading ? '—' : stats?.total ?? 0}
          subtitle={`${stats?.pending ?? 0} pending · ${stats?.in_progress ?? 0} in progress`}
          icon={Activity}
          color="bg-blue-100 text-blue-600"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Completed Today"
          value={statsLoading ? '—' : stats?.completed_today ?? 0}
          subtitle={`${stats?.completed_this_week ?? 0} completed this week`}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
          trend="up"
          trendValue="+5%"
        />
        <StatCard
          title="Overdue"
          value={statsLoading ? '—' : stats?.overdue ?? 0}
          subtitle="Requires immediate attention"
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
          trend={(stats?.overdue ?? 0) > 0 ? 'down' : undefined}
          trendValue="-2"
        />
        <StatCard
          title="Avg. Completion"
          value={statsLoading ? '—' : stats?.avg_completion_time ? `${Math.round(stats.avg_completion_time)}m` : 'N/A'}
          subtitle="Average time per request"
          icon={Clock}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Overview - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Status Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Service requests by status</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/service-requests" className="text-xs">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats?.by_status || {}).map(([status, count]) => {
                const pct = Math.round(((count as number) / (stats?.total || 1)) * 100);
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="w-28 flex-shrink-0">
                      <Badge className={`${getStatusColor(status)} text-xs capitalize`}>
                        {status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-16 flex items-center justify-end gap-1.5">
                      <span className="text-sm font-semibold">{count as number}</span>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority Distribution - 1/3 width */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">Priority Split</h2>
            <p className="text-xs text-slate-500 mt-0.5">Active requests by priority</p>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats?.by_priority || {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      priority === 'urgent' ? 'bg-red-500' :
                      priority === 'high' ? 'bg-orange-500' :
                      priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <Badge className={`${getPriorityColor(priority)} capitalize text-xs`}>
                      {priority}
                    </Badge>
                  </div>
                  <span className="text-xl font-bold">{count as number}</span>
                </div>
              ))}
              {Object.keys(stats?.by_priority || {}).length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">No data available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming & Overdue */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Upcoming Services
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Scheduled for the next few days</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/service-requests?filter=upcoming" className="text-xs">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="h-10 w-10 text-slate-500/30 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming services</p>
              </div>
            ) : (
              upcoming.map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/service-requests/${request.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{request.reference_code}</p>
                    <p className="text-xs text-slate-500">{request.service?.name}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <Badge className={`${getStatusColor(request.status.value)} text-xs`}>
                      {request.status.label}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(request.schedule.date)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Overdue Services</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Requires immediate attention</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/service-requests?filter=overdue" className="text-xs">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {overdueLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : overdue.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-600">All services on track!</p>
                <p className="text-xs text-slate-500 mt-1">No overdue requests</p>
              </div>
            ) : (
              overdue.slice(0, 5).map((request) => (
                <Link
                  key={request.id}
                  href={`/admin/service-requests/${request.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-red-50/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{request.reference_code}</p>
                    <p className="text-xs text-slate-500">{request.client?.name}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <Badge className={`${getPriorityColor(request.priority.value)} text-xs`}>
                      {request.priority.label}
                    </Badge>
                    <p className="text-xs text-red-500 font-medium">
                      Due: {formatDateTime(request.schedule.date)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
