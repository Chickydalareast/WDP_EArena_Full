import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { env } from '@/config/env';
import { parseApiError } from './error-parser';

export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  withCredentials: true, 
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null) => {
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
    return (data && data.statusCode && 'data' in data) ? data.data : data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) return Promise.reject(parseApiError(error));

    const isNoRefreshEndpoint = NO_REFRESH_ENDPOINTS.some(url => originalRequest.url?.includes(url));

    if (error.response.status === 401 && originalRequest && !originalRequest._retry && !isNoRefreshEndpoint) {
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
        await axios.post(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('core:unauthorized'));
        }
        return Promise.reject(parseApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(parseApiError(error));
  }
);