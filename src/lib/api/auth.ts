import { apiClient, fetchCsrfToken, type ApiResponse } from './client';
import type { User, LoginPayload, RegisterPayload, AuthResponse, OtpPayload } from '@/types/user';

export const authApi = {
  login: async (data: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    await fetchCsrfToken();
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    await fetchCsrfToken();
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  sendOtp: async (data: OtpPayload): Promise<ApiResponse<{ expires_in: number }>> => {
    await fetchCsrfToken();
    const response = await apiClient.post('/auth/otp/send', data);
    return response.data;
  },

  verifyOtp: async (data: { phone: string; otp: string }): Promise<ApiResponse<AuthResponse>> => {
    await fetchCsrfToken();
    const response = await apiClient.post('/auth/otp/verify', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    await fetchCsrfToken();
    const response = await apiClient.post('/auth/password/forgot', { email });
    return response.data;
  },

  resetPassword: async (data: { email: string; token: string; password: string; password_confirmation: string }): Promise<ApiResponse<null>> => {
    await fetchCsrfToken();
    const response = await apiClient.post('/auth/password/reset', data);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { current_password: string; password: string; password_confirmation: string }): Promise<ApiResponse<null>> => {
    const response = await apiClient.put('/auth/password', data);
    return response.data;
  },

  socialRedirect: (provider: 'google' | 'facebook'): string => {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/social/${provider}`;
  },
};
