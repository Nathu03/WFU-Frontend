export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: 'active' | 'inactive' | 'suspended';
  roles: string[];
  permissions: string[];
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface OtpPayload {
  identifier: string;
  type: 'sms' | 'whatsapp' | 'email';
  purpose?: 'login' | 'registration' | 'password_reset' | 'verification';
}
