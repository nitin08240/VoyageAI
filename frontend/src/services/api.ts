import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─── Request Interceptor ───────────────────────────────────── */
api.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    return config;
  },
  error => Promise.reject(error)
);

/* ─── Response Interceptor ──────────────────────────────────── */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  error => {
    const url = error.config?.url || '';
    const isAuthCheck = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthCheck) {
      // Clear any stored auth state
      localStorage.removeItem('voyage-auth');
      sessionStorage.clear();

      // Redirect to login only if accessing a protected private route
      const publicPaths = [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/explore',
        '/features',
        '/how-it-works',
        '/pricing',
        '/about',
        '/blog',
        '/careers',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
        '/cookie-policy',
        '/refund-policy',
        '/privacy',
        '/terms',
        '/cookies',
        '/refund'
      ];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/shared/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Typed API methods ─────────────────────────────────────── */
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  api.get<T>(url, config);

export const apiPost = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  api.post<T>(url, data, config);

export const apiPut = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  api.put<T>(url, data, config);

export const apiPatch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  api.patch<T>(url, data, config);

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
  api.delete<T>(url, config);

export default api;
