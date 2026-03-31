import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestsApi } from '@/lib/api/service-requests';
import type { ServiceRequestFilters, CreateServiceRequestPayload } from '@/types/service-request';
import { toast } from 'sonner';

export const serviceRequestKeys = {
  all: ['service-requests'] as const,
  lists: () => [...serviceRequestKeys.all, 'list'] as const,
  list: (filters: ServiceRequestFilters) => [...serviceRequestKeys.lists(), filters] as const,
  details: () => [...serviceRequestKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceRequestKeys.details(), id] as const,
  statistics: () => [...serviceRequestKeys.all, 'statistics'] as const,
  upcoming: () => [...serviceRequestKeys.all, 'upcoming'] as const,
  overdue: () => [...serviceRequestKeys.all, 'overdue'] as const,
};

export function useServiceRequests(filters?: ServiceRequestFilters) {
  return useQuery({
    queryKey: serviceRequestKeys.list(filters || {}),
    queryFn: () => serviceRequestsApi.getAll(filters),
    staleTime: 30 * 1000,
  });
}

export function useServiceRequest(id: number) {
  return useQuery({
    queryKey: serviceRequestKeys.detail(id),
    queryFn: () => serviceRequestsApi.getById(id),
    enabled: !!id,
  });
}

export function useServiceRequestStatistics() {
  return useQuery({
    queryKey: serviceRequestKeys.statistics(),
    queryFn: () => serviceRequestsApi.getStatistics(),
    staleTime: 60 * 1000,
  });
}

export function useUpcomingServiceRequests(limit?: number) {
  return useQuery({
    queryKey: serviceRequestKeys.upcoming(),
    queryFn: () => serviceRequestsApi.getUpcoming(limit),
    staleTime: 60 * 1000,
  });
}

export function useOverdueServiceRequests() {
  return useQuery({
    queryKey: serviceRequestKeys.overdue(),
    queryFn: () => serviceRequestsApi.getOverdue(),
    staleTime: 60 * 1000,
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequestPayload) => serviceRequestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.statistics() });
      toast.success('Service request created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create service request');
    },
  });
}

export function useAssignEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, employeeId, notes }: { id: number; employeeId: number; notes?: string }) =>
      serviceRequestsApi.assign(id, employeeId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
      toast.success('Employee assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign employee');
    },
  });
}

export function useUpdateServiceRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
      latitude,
      longitude,
    }: {
      id: number;
      status: string;
      notes?: string;
      latitude?: number;
      longitude?: number;
    }) => serviceRequestsApi.updateStatus(id, status, notes, latitude, longitude),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.statistics() });
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useCancelServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      serviceRequestsApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.statistics() });
      toast.success('Service request cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel service request');
    },
  });
}

export function useTrackServiceRequest(reference: string) {
  return useQuery({
    queryKey: ['track', reference],
    queryFn: () => serviceRequestsApi.track(reference),
    enabled: !!reference,
    retry: 1,
  });
}
