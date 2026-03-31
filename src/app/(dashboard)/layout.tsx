'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Users, Calendar, ClipboardList, Package, CreditCard,
  Settings, Bell, LogOut, Menu, X, Building2, FileText, AlertTriangle,
  BarChart3, UserCircle, Zap, ChevronRight, Search, Wrench, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Service Requests', href: '/admin/service-requests', icon: ClipboardList, permission: 'service_requests.view' },
      { name: 'Repair Services', href: '/admin/repairs', icon: Wrench, permission: 'repairs.view' },
      { name: 'Rentals', href: '/admin/rentals', icon: Package, permission: 'rentals.view' },
      { name: 'Services', href: '/admin/services', icon: Building2, permission: 'services.view' },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Employees', href: '/admin/employees', icon: Users, permission: 'employees.view' },
      { name: 'Attendance', href: '/admin/attendance', icon: Calendar, permission: 'attendance.view' },
      { name: 'Users', href: '/admin/users', icon: UserCircle, permission: 'users.view' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments', href: '/admin/payments', icon: CreditCard, permission: 'payments.view' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell, permission: 'dashboard.view' },
      { name: 'Risk Monitor', href: '/admin/risk-events', icon: AlertTriangle, permission: 'risk.view' },
      { name: 'Reports', href: '/admin/reports', icon: BarChart3, permission: 'reports.view' },
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText, permission: 'audit.view' },
      { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuthStore();

  const visibleGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(item.permission)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-yellow-300/20 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-yellow-300" />
          </div>
          <span className="font-bold text-white text-lg">WeForYou</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 bg-yellow-300/30 rounded-full flex items-center justify-center text-yellow-200 font-semibold text-sm flex-shrink-0">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'sidebar-link',
                      isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-4 pb-4">
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: notifData } = useQuery({
    queryKey: ['admin-notifications-header', notificationOpen],
    queryFn: () => api.get('/admin/notifications', { params: { per_page: 5 } }),
    enabled: notificationOpen,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['admin-notifications-unread'],
    queryFn: () => api.get('/admin/notifications/unread-count'),
  });

  const recentNotifications = Array.isArray(notifData?.data?.data) ? notifData.data.data : [];
  const unreadCount = unreadData?.data?.data?.count ?? 0;

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/admin/search?q=${encodeURIComponent(q)}`);
  };

  const notificationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!notificationOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  useEffect(() => {
    // Avoid hydration mismatches by only rendering the dashboard shell on the client
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const currentPage = navGroups
    .flatMap((g) => g.items)
    .find((item) => pathname === item.href || pathname.startsWith(item.href + '/'));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 gradient-brand shadow-2xl lg:hidden transform transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 xl:w-72 gradient-brand shadow-xl">
        <div className="flex flex-col w-full">
          <SidebarContent />
        </div>
      </div>

      {/* Main area */}
      <div className="lg:pl-64 xl:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">Admin</Link>
            {currentPage && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold">{currentPage.name}</span>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 w-60 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
            <input
              type="search"
              className="bg-transparent text-sm outline-none w-full text-slate-900 placeholder:text-slate-400"
              placeholder="Search users, services, requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchSubmit())}
              aria-label="Search"
            />
          </div>

          {/* Notifications – dropdown under bell (usual web app pattern) */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setNotificationOpen(!notificationOpen)}
              aria-label="Open notifications"
              aria-expanded={notificationOpen}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            {notificationOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1 w-[360px] max-h-[min(400px,70vh)] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden flex flex-col"
                role="dialog"
                aria-label="Notifications"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                  <span className="font-semibold text-sm text-slate-900">Notifications</span>
                  <Link
                    href="/admin/notifications"
                    onClick={() => setNotificationOpen(false)}
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="overflow-y-auto flex-1">
                  {!notifData ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <p className="py-6 px-4 text-center text-slate-500 text-sm">No notifications yet</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {recentNotifications.map((n: any) => (
                        <li
                          key={n.id}
                          className={cn(
                            'px-4 py-3 text-left',
                            !n.read_at && 'bg-blue-50/50'
                          )}
                        >
                          <p className="font-medium text-sm text-slate-900 truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 gradient-brand rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
            {user?.name?.[0] ?? 'U'}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
