import axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({
    baseURL: '/rest/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const axiosInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    const source = axios.CancelToken.source();
    const promise = AXIOS_INSTANCE({
        ...config,
        ...options,
        cancelToken: source.token,
    }).then(({ data }) => data);

    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

import { useAuthStore } from '@/stores/useAuthStore';

// Request Interceptor
AXIOS_INSTANCE.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Basic ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

AXIOS_INSTANCE.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            // Optional: redirect to login if not already handled by AuthGuard
        }
        return Promise.reject(error);
    }
);

