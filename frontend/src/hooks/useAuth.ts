import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import type {
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  IUser,
} from '@/types/auth.types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleLogin = useCallback(
    async (email: string, password: string, remember?: boolean) => {
      setError(null);
      setActionLoading(true);
      try {
        await login(email, password, remember);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
        setError(message);
        toast.error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [login, navigate]
  );

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      setError(null);
      setActionLoading(true);
      try {
        const response = await authService.register(payload);
        if (response.success && response.user) {
          useAuthStore.getState().setUser(response.user);
          toast.success('Account created successfully!');
          navigate('/dashboard');
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        toast.error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  }, [logout, navigate]);

  const handleForgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    setError(null);
    setActionLoading(true);
    try {
      const response = await authService.forgotPassword(payload);
      if (response.success) {
        toast.success('Reset link sent! Check your email.');
        return true;
      }
      throw new Error(response.message || 'Failed to send reset email');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleResetPassword = useCallback(
    async (payload: ResetPasswordPayload) => {
      setError(null);
      setActionLoading(true);
      try {
        const response = await authService.resetPassword(payload);
        if (response.success) {
          toast.success('Password reset successfully!');
          navigate('/login');
          return true;
        }
        throw new Error(response.message || 'Failed to reset password');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to reset password';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [navigate]
  );

  const handleUpdateProfile = useCallback(async (data: Partial<IUser>) => {
    setActionLoading(true);
    try {
      const updated = await authService.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [updateUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    actionLoading,
    error,
    setError,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    checkAuth,
  };
}
