import { apiGet, apiPost, apiPut } from './api';
import type {
  IUser,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '@/types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiPost<ApiResponse<IUser>>('/auth/login', payload);
    const token = (res.data as any).token || (res.data as any).data?.token;
    if (token) {
      localStorage.setItem('voyage_token', token);
    }
    return {
      success: res.data.success,
      message: res.data.message,
      user: res.data.user ?? res.data.data,
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiPost<ApiResponse<IUser>>('/auth/register', payload);
    const token = (res.data as any).token || (res.data as any).data?.token;
    if (token) {
      localStorage.setItem('voyage_token', token);
    }
    return {
      success: res.data.success,
      message: res.data.message,
      user: res.data.user ?? res.data.data,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await apiPost('/auth/logout');
    } finally {
      localStorage.removeItem('voyage_token');
    }
  },

  getMe: async (): Promise<IUser> => {
    const res = await apiGet<ApiResponse<IUser>>('/auth/me');
    return (res.data.user ?? res.data.data) as IUser;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<AuthResponse> => {
    const res = await apiPost<ApiResponse<null>>('/auth/forgot-password', payload);
    return { success: res.data.success, message: res.data.message };
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<AuthResponse> => {
    const res = await apiPost<ApiResponse<null>>('/auth/reset-password', payload);
    return { success: res.data.success, message: res.data.message };
  },

  updateProfile: async (data: Partial<IUser>): Promise<IUser> => {
    const res = await apiPut<ApiResponse<IUser>>('/auth/profile', data);
    return (res.data.user ?? res.data.data) as IUser;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<AuthResponse> => {
    const res = await apiPut<ApiResponse<null>>('/auth/change-password', data);
    return { success: res.data.success, message: res.data.message };
  },

  deleteAccount: async (): Promise<void> => {
    await apiPost('/auth/delete-account');
  },
};
