'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Users, Building2, ClipboardList, Loader2, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

function useSearch(q: string | null) {
  const users = useQuery({
    queryKey: ['admin-search-users', q],
    queryFn: () => api.get('/admin/users', { params: { search: q || '', per_page: 10 } }),
    enabled: !!q && q.length >= 2,
  });
  const services = useQuery({
    queryKey: ['admin-search-services', q],
    queryFn: () => api.get('/services', { params: { search: q || '', per_page: 10 } }),
    enabled: !!q && q.length >= 2,
  });
  const requests = useQuery({
    queryKey: ['admin-search-requests', q],
    queryFn: () => api.get('/service-requests', { params: { search: q || '', per_page: 10 } }),
    enabled: !!q && q.length >= 2,
  });
  return { users, services, requests };
}

export default function AdminSearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.trim() || '';
  const { users, services, requests } = useSearch(q);

  // Admin users use successResponse(paginator) -> list at data.data.data
  const userList = Array.isArray(users.data?.data?.data) ? users.data.data.data : [];
  // Services and service-requests use paginatedResponse -> list at data.data
  const serviceList = Array.isArray(services.data?.data) ? services.data.data : [];
  const requestList = Array.isArray(requests.data?.data) ? requests.data.data : [];

  const loading = users.isLoading || services.isLoading || requests.isLoading;
  const hasSearched = q.length >= 2;
  const hasResults = userList.length > 0 || serviceList.length > 0 || requestList.length > 0;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-slate-500">
          {q ? `Results for “${q}”` : 'Enter a search term in the header and press Enter'}
        </p>
      </div>

      {!q && (
        <div className="rounded-xl border bg-slate-50/50 p-8 text-center text-slate-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Use the search box in the top bar and press Enter to search users, services, and service requests.</p>
        </div>
      )}

      {q.length === 1 && (
        <p className="text-slate-500">Type at least 2 characters to search.</p>
      )}

      {hasSearched && (
        <>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          )}

          {!loading && !hasResults && (
            <div className="rounded-xl border bg-slate-50/50 p-8 text-center text-slate-500">
              No results found for “{q}”
            </div>
          )}

          {!loading && hasResults && (
            <div className="grid gap-8 md:grid-cols-1">
              {userList.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-500" />
                      Users
                    </h2>
                    <Link
                      href={`/admin/users?search=${encodeURIComponent(q)}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <ul className="rounded-xl border divide-y bg-white">
                    {userList.map((u: any) => (
                      <li key={u.id}>
                        <Link
                          href={`/admin/users?search=${encodeURIComponent(q)}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-slate-500">{u.email}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {serviceList.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-slate-500" />
                      Services
                    </h2>
                    <Link
                      href={`/admin/services?search=${encodeURIComponent(q)}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <ul className="rounded-xl border divide-y bg-white">
                    {serviceList.map((s: any) => (
                      <li key={s.id}>
                        <Link
                          href={`/admin/services?search=${encodeURIComponent(q)}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{s.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {requestList.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-slate-500" />
                      Service requests
                    </h2>
                    <Link
                      href={`/admin/service-requests?search=${encodeURIComponent(q)}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <ul className="rounded-xl border divide-y bg-white">
                    {requestList.map((r: any) => (
                      <li key={r.id}>
                        <Link
                          href={`/admin/service-requests?search=${encodeURIComponent(q)}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                        >
                          <div>
                            <p className="font-medium">{r.reference || `Request #${r.id}`}</p>
                            <p className="text-sm text-slate-500">{r.status}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
