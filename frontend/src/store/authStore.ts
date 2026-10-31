import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser, IAuthState } from '@/types/auth.types';
import { authService } from '@/services/authService';

interface AuthStore extends IAuthState {
  setUser: (user: IUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<IUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password, remember = false) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password, remember });
          if (response.success && response.user) {
            set({ user: response.user, isAuthenticated: true, isLoading: false });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user: user || null, isAuthenticated: !!user, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },
    }),
    {
      name: 'voyage-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
