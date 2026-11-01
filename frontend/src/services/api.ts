import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

let cachedCsrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export async function fetchCsrfToken(): Promise<string> {
  if (csrfPromise) return csrfPromise;
  csrfPromise = axios
    .get(`${BASE_URL}/auth/csrf-token`, { withCredentials: true })
    .then(res => {
      cachedCsrfToken = res.data?.data?.csrfToken || res.data?.csrfToken || '';
      return cachedCsrfToken!;
    })
    .finally(() => {
      csrfPromise = null;
    });
  return csrfPromise;
}

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
  async config => {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';

    const method = config.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
      const url = config.url || '';
      const isExempt =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password') ||
        url.includes('/auth/csrf-token');

      if (!isExempt) {
        if (!cachedCsrfToken) {
          try {
            await fetchCsrfToken();
          } catch {
            // Server will validate
          }
        }
        if (cachedCsrfToken) {
          config.headers['X-CSRF-Token'] = cachedCsrfToken;
        }
      }
    }

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

    if (error.response?.status === 403 && typeof error.response?.data?.message === 'string' && error.response.data.message.includes('CSRF')) {
      cachedCsrfToken = null;
    }

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
