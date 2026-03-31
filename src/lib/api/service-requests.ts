import { apiClient, type ApiResponse, type PaginatedResponse } from './client';
import type {
  ServiceRequest,
  ServiceRequestFilters,
  CreateServiceRequestPayload,
  ServiceRequestStatistics,
  StatusLog,
} from '@/types/service-request';

export const serviceRequestsApi = {
  getAll: async (filters?: ServiceRequestFilters): Promise<PaginatedResponse<ServiceRequest>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get(`/service-requests?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.get(`/service-requests/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceRequestPayload): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.post('/service-requests', data);
    return response.data;
  },

  assign: async (id: number, employeeId: number, notes?: string): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.post(`/service-requests/${id}/assign`, {
      employee_id: employeeId,
      notes,
    });
    return response.data;
  },

  updateStatus: async (
    id: number,
    status: string,
    notes?: string,
    latitude?: number,
    longitude?: number
  ): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.post(`/service-requests/${id}/status`, {
      status,
      notes,
      latitude,
      longitude,
    });
    return response.data;
  },

  cancel: async (id: number, reason: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(`/service-requests/${id}/cancel`, { reason });
    return response.data;
  },

  getStatusHistory: async (id: number): Promise<ApiResponse<StatusLog[]>> => {
    const response = await apiClient.get(`/service-requests/${id}/status-history`);
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse<ServiceRequestStatistics>> => {
    const response = await apiClient.get('/service-requests/statistics');
    return response.data;
  },

  getUpcoming: async (limit?: number): Promise<ApiResponse<ServiceRequest[]>> => {
    const response = await apiClient.get(`/service-requests/upcoming?limit=${limit || 10}`);
    return response.data;
  },

  getOverdue: async (): Promise<ApiResponse<ServiceRequest[]>> => {
    const response = await apiClient.get('/service-requests/overdue');
    return response.data;
  },

  track: async (reference: string): Promise<ApiResponse<ServiceRequest>> => {
    const response = await apiClient.get(`/track/${reference}`);
    return response.data;
  },
};
