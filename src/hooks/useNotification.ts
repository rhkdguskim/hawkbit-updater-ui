import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { getErrorMessage, isHawkBitError, isAxiosError } from '@/utils/typeGuards';

/**
 * Hook for displaying notifications with i18n support
 */
export const useNotification = () => {
  const { t, i18n } = useTranslation();

  /**
   * Display success message
   * @param key - Translation key or direct message
   * @param params - Translation parameters
   */
  const success = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      const translatedMessage = i18n.exists(key) ? t(key, params) : key;
      message.success(translatedMessage);
    },
    [t, i18n]
  );

  /**
   * Display error message
   * Supports translation keys, direct messages, and Error objects
   * @param keyOrError - Translation key, message string, or Error object
   * @param params - Translation parameters (only used if first param is a key)
   */
  const error = useCallback(
    (keyOrError: string | Error | unknown, params?: Record<string, unknown>) => {
      let errorMessage: string;

      // If it's a string, try to translate it
      if (typeof keyOrError === 'string') {
        errorMessage = i18n.exists(keyOrError) ? t(keyOrError, params) : keyOrError;
      } else {
        // Extract error message from Error object or unknown error
        errorMessage = getErrorMessage(keyOrError, t('common:messages.error'));
      }

      message.error(errorMessage);
    },
    [t, i18n]
  );

  /**
   * Display info message
   * @param key - Translation key or direct message
   * @param params - Translation parameters
   */
  const info = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      const translatedMessage = i18n.exists(key) ? t(key, params) : key;
      message.info(translatedMessage);
    },
    [t, i18n]
  );

  /**
   * Display warning message
   * @param key - Translation key or direct message
   * @param params - Translation parameters
   */
  const warning = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      const translatedMessage = i18n.exists(key) ? t(key, params) : key;
      message.warning(translatedMessage);
    },
    [t, i18n]
  );

  /**
   * Display loading message
   * @param key - Translation key or direct message
   * @param params - Translation parameters
   * @returns Function to close the loading message
   */
  const loading = useCallback(
    (key: string, params?: Record<string, unknown>) => {
      const translatedMessage = i18n.exists(key) ? t(key, params) : key;
      return message.loading(translatedMessage);
    },
    [t, i18n]
  );

  /**
   * Display error with HawkBit-specific handling
   * Automatically translates HawkBit error codes
   */
  const apiError = useCallback(
    (err: unknown) => {
      let displayMessage: string;

      if (isHawkBitError(err)) {
        const errorCode = err.response?.data.errorCode;
        const errorMsg = err.response?.data.message;

        if (errorCode) {
          // Normalize error code: hawkbit.server.error -> HAWKBIT_SERVER_ERROR
          const normalizedCode = errorCode.toUpperCase().replace(/\./g, '_');
          const translationKey = `common:apiErrors.${normalizedCode}`;

          if (i18n.exists(translationKey)) {
            displayMessage = t(translationKey);
          } else if (errorMsg) {
            displayMessage = errorMsg;
          } else {
            displayMessage = t('common:apiErrors.generic.unknown');
          }
        } else if (errorMsg) {
          displayMessage = errorMsg;
        } else {
          displayMessage = t('common:apiErrors.generic.unknown');
        }
      } else if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status) {
          const genericKey = `common:apiErrors.generic.${status}`;
          displayMessage = i18n.exists(genericKey)
            ? t(genericKey)
            : t('common:apiErrors.generic.unknown');
        } else {
          displayMessage = getErrorMessage(err, t('common:apiErrors.generic.unknown'));
        }
      } else {
        displayMessage = getErrorMessage(err, t('common:apiErrors.generic.unknown'));
      }

      message.error(displayMessage);
      return displayMessage;
    },
    [t, i18n]
  );

  return {
    success,
    error,
    info,
    warning,
    loading,
    apiError,
  };
};
