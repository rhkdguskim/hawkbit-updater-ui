import { useEffect } from 'react';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useTranslation } from 'react-i18next';
import { POLLING_INTERVALS } from '@/constants/config';

export const NotificationMonitor: React.FC = () => {
    const { t } = useTranslation(['common']);
    const { lastCheckTimestamp, updateLastCheck, addNotification } = useNotificationStore();

    // Query for recently failed rollouts
    // Note: We don't use sort parameter as it may not be supported by the API
    // Instead, we rely on the API's default ordering or sort client-side if needed
    const { data } = useGetRollouts(
        {
            q: 'status==error',
            limit: 10, // Fetch more to ensure we catch recent failures, sort client-side
        },
        {
            query: {
                refetchInterval: POLLING_INTERVALS.NOTIFICATION_MONITOR,
                refetchOnWindowFocus: false,
            },
        }
    );

    useEffect(() => {
        if (!data?.content || data.content.length === 0) return;

        // Sort by lastModifiedAt descending (most recent first) on client side
        const sortedRollouts = [...data.content].sort((a, b) =>
            (b.lastModifiedAt || 0) - (a.lastModifiedAt || 0)
        );

        let maxTimestamp = lastCheckTimestamp;
        let hasNewFailures = false;

        sortedRollouts.forEach((rollout) => {
            const modifiedTime = rollout.lastModifiedAt ? new Date(rollout.lastModifiedAt).getTime() : 0;

            // If this failure happened after our last check
            if (modifiedTime > lastCheckTimestamp) {
                addNotification({
                    type: 'error',
                    title: t('notifications.rolloutFailed', 'Rollout Failed'),
                    message: t('notifications.rolloutFailedDesc', {
                        name: rollout.name,
                        defaultValue: `Rollout "${rollout.name}" has failed.`
                    }),
                    link: `/rollouts/${rollout.id}`
                });

                if (modifiedTime > maxTimestamp) {
                    maxTimestamp = modifiedTime;
                }
                hasNewFailures = true;
            }
        });

        // Update the timestamp so we don't alert on these again
        if (hasNewFailures) {
            updateLastCheck(maxTimestamp);
        } else {
            // Even if no new failures, update timestamp to now to avoid alerting on old data 
            // if user just opened the app. However, strictly updating to 'now' might miss 
            // events if the polling was delayed. Better to just track the latest event time saw.
            // But for the very first run, we might want to sync.

            // For simplicity and correctness: 
            // We only update if we saw something NEWER than what we have.
            // If we rely on stored timestamp, it persists across reloads.
        }

    }, [data, lastCheckTimestamp, updateLastCheck, addNotification, t]);

    return null; // Headless component
};
