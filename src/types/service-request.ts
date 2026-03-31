export type ServiceRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'enroute'
  | 'in_progress'
  | 'qc_check'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type ServicePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ServiceRequest {
  id: number;
  reference_code: string;
  service: {
    id: number;
    name: string;
    service_code: string;
    total_price?: number;
  };
  client: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  assigned_employee?: {
    id: number;
    name: string;
    employee_code: string;
    phone: string;
  };
  service_type: string;
  description: string | null;
  location: {
    address: string;
    details: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  schedule: {
    date: string;
    end_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    duration_minutes: number | null;
  };
  priority: {
    value: ServicePriority;
    label: string;
    color: string;
  };
  status: {
    value: ServiceRequestStatus;
    label: string;
    color: string;
    icon: string;
  };
  amounts: {
    quoted: number | null;
    final: number | null;
  };
  notes: {
    client: string | null;
    internal?: string | null;
    completion: string | null;
  };
  is_overdue: boolean;
  cancellation?: {
    reason: string;
    cancelled_at: string;
    cancelled_by: string;
  };
  feedback?: {
    rating: number;
    comment: string;
  };
  photos: {
    before: string[] | null;
    after: string[] | null;
  };
  status_logs?: StatusLog[];
  payment?: {
    id: number;
    payment_code: string;
    status: string;
    total_amount: number;
  };
  created_at: string;
  updated_at: string;
}

export interface StatusLog {
  from: string | null;
  to: string;
  changed_by: string;
  notes: string | null;
  changed_at: string;
}

export interface ServiceRequestFilters {
  search?: string;
  status?: ServiceRequestStatus;
  priority?: ServicePriority;
  client_id?: number;
  employee_id?: number;
  service_id?: number;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateServiceRequestPayload {
  service_id: number;
  location: string;
  location_details?: string;
  latitude?: number;
  longitude?: number;
  scheduled_date: string;
  scheduled_end_date?: string;
  priority?: ServicePriority;
  description?: string;
  client_notes?: string;
}

export interface ServiceRequestStatistics {
  total: number;
  pending: number;
  in_progress: number;
  completed_today: number;
  completed_this_week: number;
  overdue: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  avg_completion_time: number | null;
}
