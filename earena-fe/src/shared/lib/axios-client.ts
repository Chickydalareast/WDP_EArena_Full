import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { env } from '@/config/env';
import { parseApiError } from './error-parser';
import { toast } from 'sonner';

export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

interface PromiseQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: Error | AxiosError) => void;
}

let isRefreshing = false;
let failedQueue: PromiseQueueItem[] = [];

const processQueue = (error: Error | AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const NO_REFRESH_ENDPOINTS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.LOGOUT
];

axiosClient.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && data.statusCode && 'data' in data) {
      if ('meta' in data) {
        return { data: data.data, meta: data.meta };
      }
      return data.data;
    }
    return data;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isServer = typeof window === 'undefined';

    if (!error.response) return Promise.reject(parseApiError(error));

    if (error.response.status === 429 && !isServer) {
      toast.error('Hệ thống đang quá tải hoặc bạn thao tác quá nhanh. Vui lòng thử lại sau.');
      return Promise.reject(parseApiError(error));
    }

    // Handle teacher verification block (403)
    if (error.response.status === 403 && !isServer) {
      const data = error.response.data as any;
      const message = data?.message || '';
      if (
        typeof message === 'string' &&
        (message.includes('chưa được xác minh') || message.includes('chưa được phê duyệt'))
      ) {
        window.location.href = '/waiting-approval';
        return Promise.reject(parseApiError(error));
      }
    }

    const isNoRefreshEndpoint = originalRequest.url
      ? NO_REFRESH_ENDPOINTS.some(url => originalRequest.url?.includes(url))
      : false;

    if (error.response.status === 401 && originalRequest && !originalRequest._retry && !isNoRefreshEndpoint) {

      if (isServer) {
        return Promise.reject(parseApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {}, {
          withCredentials: true
        });

        processQueue(null);
        return axiosClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        
        // TODO (Phase 2): Sẽ thay thế bằng cách invalidate query cache của React Query.
        if (!isServer) {
          window.dispatchEvent(new CustomEvent('core:unauthorized'));
        }

        return Promise.reject(parseApiError(refreshError as AxiosError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(parseApiError(error));
  }
);