import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import i18n from '@/i18n';
import { API_CONFIG } from '@/constants/config';
import type { HawkBitErrorData } from '@/utils/typeGuards';

export const AXIOS_INSTANCE = axios.create({
    baseURL: import.meta.env.API_URL || '',
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

declare module 'axios' {
    export interface AxiosRequestConfig {
        skipGlobalError?: boolean;
    }
}

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

    // @ts-expect-error: axiosInstance returns a Promise that is augmented with a cancel method internally
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';

/**
 * Helper function to get translated error message
 */
const getTranslatedErrorMessage = (error: AxiosError<HawkBitErrorData>): string => {
    const { response } = error;

    if (!response) {
        // Network or timeout errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return i18n.t('common:apiErrors.TIMEOUT');
        }
        return i18n.t('common:apiErrors.NETWORK_ERROR', { defaultValue: 'Network request failed' });
    }

    const { status, data } = response;
    const errorCode = data?.errorCode;
    const errorMsg = data?.message;

    // Try to translate HawkBit error code
    if (errorCode) {
        const normalizedCode = errorCode.toUpperCase().replace(/\./g, '_');
        const translationKey = `common:apiErrors.${normalizedCode}`;

        if (i18n.exists(translationKey)) {
            return i18n.t(translationKey);
        }

        if (errorMsg) {
            return errorMsg;
        }
    }

    // Fallback to generic HTTP status message
    if (status) {
        const genericKey = `common:apiErrors.generic.${status}`;
        if (i18n.exists(genericKey)) {
            return i18n.t(genericKey);
        }
    }

    // Last resort
    return errorMsg || i18n.t('common:apiErrors.generic.unknown');
};

/**
 * Setup axios interceptors
 * Separated for better testability and dependency injection
 */
export const setupInterceptors = () => {
    // Request Interceptor - Add authentication token
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

    // Response Interceptor - Handle errors
    AXIOS_INSTANCE.interceptors.response.use(
        (response) => response,
        (error: AxiosError<HawkBitErrorData>) => {
            // Ignore cancelled requests
            if (axios.isCancel(error)) {
                return Promise.reject(error);
            }

            // Handle 401 - Unauthorized
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
                const message = i18n.t('common:apiErrors.UNAUTHORIZED_ACCESS');
                error.message = message;

                useNotificationStore.getState().addNotification({
                    type: 'error',
                    title: i18n.t('common:notifications.errorTitle', 'API Error'),
                    message
                });

                return Promise.reject(error);
            }

            // Get translated error message
            const displayMessage = getTranslatedErrorMessage(error);
            error.message = displayMessage;

            // Add to notification store
            const notificationTitle = error.response
                ? i18n.t('common:notifications.errorTitle', 'API Error')
                : i18n.t('common:notifications.networkError', 'Network Error');

            useNotificationStore.getState().addNotification({
                type: 'error',
                title: notificationTitle,
                message: displayMessage
            });

            return Promise.reject(error);
        }
    );
};

// Initialize interceptors
setupInterceptors();

