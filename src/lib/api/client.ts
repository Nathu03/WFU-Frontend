import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
  withCredentials: true,
});

export const fetchCsrfToken = async (): Promise<void> => {
  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
};

const getCsrfTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshingCsrf = false;
let csrfRefreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshingCsrf) {
        isRefreshingCsrf = true;
        csrfRefreshPromise = fetchCsrfToken().finally(() => {
          isRefreshingCsrf = false;
          csrfRefreshPromise = null;
        });
      }

      await csrfRefreshPromise;

      const newCsrfToken = getCsrfTokenFromCookie();
      if (newCsrfToken) {
        originalRequest.headers['X-XSRF-TOKEN'] = newCsrfToken;
      }

      return apiClient(originalRequest);
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export type ApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  status: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
};

export type ApiError = {
  status: boolean;
  message: string;
  errors: Record<string, string[]>;
};
