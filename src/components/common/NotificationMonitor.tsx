import { useEffect } from 'react';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useTranslation } from 'react-i18next';
import { POLLING_INTERVALS } from '@/constants/config';

export const NotificationMonitor: React.FC = () => {
    const { t } = useTranslation(['common']);
    const { lastCheckTimestamp, updateLastCheck, addNotification } = useNotificationStore();

    // Query for recently failed rollouts
    // We sort by lastModifiedAt descending to get the most recent failures
    const { data } = useGetRollouts(
        {
            q: 'status==error',
            sort: 'createdAt:DESC',
            limit: 5, // Check last 5 to be safe, though 1 is usually enough if polled frequently
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

        let maxTimestamp = lastCheckTimestamp;
        let hasNewFailures = false;

        data.content.forEach((rollout) => {
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
