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
    const res = await apiPost<ApiResponse<any>>('/auth/login', payload);
    const data = res.data?.data;
    const user = data?.user || res.data?.user || data;
    return {
      success: res.data.success,
      message: res.data.message,
      user,
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiPost<ApiResponse<any>>('/auth/register', payload);
    const data = res.data?.data;
    const user = data?.user || res.data?.user || data;
    return {
      success: res.data.success,
      message: res.data.message,
      user,
    };
  },

  logout: async (): Promise<void> => {
    await apiPost('/auth/logout');
  },

  getMe: async (): Promise<IUser | null> => {
    const res = await apiGet<ApiResponse<any>>('/auth/me');
    const data = res.data?.data;
    if (data && 'user' in data) {
      return (data.user || null) as IUser | null;
    }
    return (res.data?.user ?? data ?? null) as IUser | null;
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
