import { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import type { TFunction } from 'i18next';
import type { MgmtAction, MgmtTarget } from '@/api/generated/model';
import { isActionErrored, isActive } from '@/entities';

type VelocityTrendDatum = {
    time: string;
    rate: number;
    count: number;
};

type VelocityData = {
    currentVelocity: number;
    trend: VelocityTrendDatum[];
};

type ActionTrendDatum = {
    time: string;
    total: number;
    error: number;
    finished: number;
    errorRate: number;
};

type RecentActivityItem = {
    target: MgmtTarget;
    action: MgmtAction & { detailStatus: string };
    delayLevel: 'normal' | 'warning' | 'critical';
    delayMs: number;
};

type RecentlyFinishedItem = {
    target: MgmtTarget;
    action: MgmtAction;
};

type HighErrorTargetItem = {
    id: string;
    count: number;
    name: string;
};

type ErrorAnalysisItem = {
    cause: string;
    count: number;
    percentage: number;
    actions: MgmtAction[];
};

type UseActionMetricsParams = {
    actions: MgmtAction[];
    targets: MgmtTarget[];
    now: Dayjs;
    last24h: Dayjs;
    stableNowMs: number | null;
    t: TFunction;
};

export const useActionMetrics = ({
    actions,
    targets,
    now,
    last24h,
    stableNowMs,
    t,
}: UseActionMetricsParams) => {
    const recentActions = useMemo(() => {
        return [...actions].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [actions]);

    const pendingCount = recentActions.filter(a =>
        ['scheduled', 'pending', 'retrieving', 'running', 'waiting_for_confirmation'].includes(a.status?.toLowerCase() || '') &&
        !isActionErrored(a)
    ).length;
    const activeActionsCount = recentActions.filter(a => isActive(a)).length;
    const finishedCount = recentActions.filter(a => a.status?.toLowerCase() === 'finished' && !isActionErrored(a)).length;
    const errorCount = recentActions.filter(a => isActionErrored(a)).length;
    const successRate = finishedCount + errorCount > 0
        ? Math.round((finishedCount / (finishedCount + errorCount)) * 100)
        : null;

    const recentActivities = useMemo<RecentActivityItem[]>(() => {
        const activeStatuses = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading', 'wait_for_confirmation', 'waiting_for_confirmation'];

        const activeActions = [...actions]
            .filter(a => {
                const status = a.status?.toLowerCase() || '';
                const type = a.type?.toLowerCase() || '';
                const isCanceled = status.includes('cancel') || type === 'cancel';
                const isActiveStatus = activeStatuses.includes(status) && !isCanceled;
                const isRecentlyErrored = isActionErrored(a) && (a.lastModifiedAt || a.createdAt || 0) > now.subtract(10, 'minute').valueOf();
                return isActiveStatus || isRecentlyErrored;
            })
            .sort((a, b) => (b.lastModifiedAt || b.createdAt || 0) - (a.lastModifiedAt || a.createdAt || 0));

        const delayWarningMs = 60 * 60 * 1000;
        const delayCriticalMs = 24 * 60 * 60 * 1000;
        const nowMs = stableNowMs || 0;

        return activeActions.map(action => {
            let targetId = action._links?.target?.href?.split('/').pop();
            if (!targetId && action._links?.self?.href) {
                const match = action._links.self.href.match(/targets\/([^/]+)\/actions/);
                if (match) targetId = match[1];
            }

            const matchedTarget = targets.find(t => t.controllerId === targetId);
            const target = matchedTarget || {
                controllerId: targetId || `action-${action.id}`,
                name: targetId || `Action #${action.id}`,
                updateStatus: action.status,
            };

            const startTime = action.createdAt || 0;
            const elapsed = (startTime > 0 && nowMs > 0) ? nowMs - startTime : 0;
            let delayLevel: 'normal' | 'warning' | 'critical' = 'normal';
            if (elapsed >= delayCriticalMs) delayLevel = 'critical';
            else if (elapsed >= delayWarningMs) delayLevel = 'warning';

            return {
                target,
                action: {
                    ...action,
                    detailStatus: action.detailStatus || action.status || 'Processing',
                },
                delayLevel,
                delayMs: elapsed,
            };
        });
    }, [actions, now, stableNowMs, targets]);

    const recentlyFinishedItems = useMemo<RecentlyFinishedItem[]>(() => {
        const finishedStatuses = ['finished', 'canceled', 'error'];

        const finishedActions = [...actions]
            .filter(a => {
                const status = a.status?.toLowerCase() || '';
                return finishedStatuses.includes(status) || isActionErrored(a);
            })
            .sort((a, b) => (b.lastModifiedAt || b.createdAt || 0) - (a.lastModifiedAt || a.createdAt || 0))
            .slice(0, 5);

        return finishedActions.map(action => {
            let targetId = action._links?.target?.href?.split('/').pop();
            if (!targetId && action._links?.self?.href) {
                const match = action._links.self.href.match(/targets\/([^/]+)\/actions/);
                if (match) targetId = match[1];
            }

            const matchedTarget = targets.find(t => t.controllerId === targetId);
            const target = matchedTarget || {
                controllerId: targetId || `action-${action.id}`,
                name: targetId || `Action #${action.id}`,
                updateStatus: action.status,
            };

            return { target, action };
        });
    }, [actions, targets]);

    const velocityData = useMemo<VelocityData>(() => {
        const sixtyMinutesAgo = dayjs().subtract(60, 'minute');
        const finishedInLastHour = actions.filter(a => {
            if (a.status?.toLowerCase() !== 'finished' || !a.lastModifiedAt) return false;
            return dayjs(a.lastModifiedAt).isAfter(sixtyMinutesAgo);
        });

        const fiveMinutesAgo = dayjs().subtract(5, 'minute');
        const finishedInLast5 = finishedInLastHour.filter(a =>
            dayjs(a.lastModifiedAt).isAfter(fiveMinutesAgo)
        ).length;

        const currentVelocity = parseFloat((finishedInLast5 / 5).toFixed(1));

        const slots = 6;
        const interval = 10;
        const trend = Array.from({ length: slots }).map((_, i) => {
            const end = dayjs().subtract((slots - 1 - i) * interval, 'minute');
            const start = end.subtract(interval, 'minute');
            const count = finishedInLastHour.filter(a => {
                const finishedAt = dayjs(a.lastModifiedAt);
                return (finishedAt.isAfter(start) || finishedAt.isSame(start)) && finishedAt.isBefore(end);
            }).length;

            return {
                time: end.format('HH:mm'),
                rate: parseFloat((count / interval).toFixed(1)),
                count,
            };
        });

        return { currentVelocity, trend };
    }, [actions]);

    const actionTrendData = useMemo<ActionTrendDatum[]>(() => {
        const bucketCount = 6;
        const bucketHours = 4;
        const buckets = Array.from({ length: bucketCount }).map((_, index) => {
            const end = dayjs().subtract((bucketCount - 1 - index) * bucketHours, 'hour');
            const start = end.subtract(bucketHours, 'hour');
            return { start, end, label: end.format('HH:mm') };
        });

        return buckets.map(bucket => {
            const inBucket = actions.filter(action => {
                if (!action.createdAt) return false;
                const createdAt = dayjs(action.createdAt);
                return (createdAt.isAfter(bucket.start) || createdAt.isSame(bucket.start)) && createdAt.isBefore(bucket.end);
            });
            const total = inBucket.length;
            const error = inBucket.filter(action => isActionErrored(action)).length;
            const finished = inBucket.filter(action => action.status?.toLowerCase() === 'finished' && !isActionErrored(action)).length;
            const errorRate = total > 0 ? Math.round((error / total) * 100) : 0;

            return {
                time: bucket.label,
                total,
                error,
                finished,
                errorRate,
            };
        });
    }, [actions]);

    const errorAnalysis = useMemo<ErrorAnalysisItem[]>(() => {
        const errorActions = actions.filter(a => isActionErrored(a) || a.status?.toLowerCase() === 'canceled');
        const groups: Record<string, { count: number; actions: MgmtAction[] }> = {};

        errorActions.forEach(a => {
            let cause = a.detailStatus;
            if (!cause || cause.toLowerCase() === 'error') {
                if (a.status?.toLowerCase() === 'canceled') cause = t('common:status.canceled');
                else if (a.lastStatusCode) cause = `${t('common:status.error')} (Code: ${a.lastStatusCode})`;
                else cause = t('common:status.error');
            }

            if (!groups[cause]) {
                groups[cause] = { count: 0, actions: [] };
            }
            groups[cause].count++;
            groups[cause].actions.push(a);
        });

        return Object.entries(groups)
            .map(([cause, data]) => ({
                cause,
                count: data.count,
                percentage: errorActions.length > 0 ? Math.round((data.count / errorActions.length) * 100) : 0,
                actions: data.actions,
            }))
            .sort((a, b) => b.count - a.count);
    }, [actions, t]);

    const delayedActions = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        const type = a.type?.toLowerCase() || '';
        if (!isActive(a) || ['canceled', 'canceling', 'cancelled', 'cancelling'].includes(status) || type === 'cancel') return false;
        const time = a.lastModifiedAt || a.createdAt || 0;
        return time > 0 && dayjs(time).isBefore(now.subtract(10, 'minute'));
    });
    const delayedActionsCount = delayedActions.length;
    const delayedActions24hCount = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        const type = a.type?.toLowerCase() || '';
        if (!isActive(a) || ['canceled', 'canceling', 'cancelled', 'cancelling'].includes(status) || type === 'cancel') return false;
        const time = a.lastModifiedAt || a.createdAt || 0;
        return time > 0 && dayjs(time).isBefore(now.subtract(24, 'hour'));
    }).length;

    const canceledActions24hCount = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        if (!['canceled', 'canceling'].includes(status)) return false;
        const createdAt = a.createdAt || 0;
        return createdAt > 0 && dayjs(createdAt).isAfter(last24h);
    }).length;

    const errorActions24hCountArray = actions.filter(a => {
        if (!isActionErrored(a)) return false;
        const createdAt = a.createdAt || 0;
        return createdAt > 0 && dayjs(createdAt).isAfter(last24h);
    });
    const errorActions24hCount = errorActions24hCountArray.length;

    const errorActions1hCount = actions.filter(a => {
        if (!isActionErrored(a) && a.status?.toLowerCase() !== 'canceled') return false;
        const createdAt = a.createdAt || 0;
        return createdAt > 0 && dayjs(createdAt).isAfter(now.subtract(1, 'hour'));
    }).length;

    const highErrorTargets = useMemo<HighErrorTargetItem[]>(() => {
        const counts = new Map<string, { count: number; name: string }>();
        actions.forEach(a => {
            if (isActionErrored(a)) {
                const targetId = a._links?.target?.href?.split('/').pop() || 'unknown';
                const current = counts.get(targetId) || { count: 0, name: targetId };

                if (current.name === 'unknown' || current.name === targetId) {
                    const target = targets.find(t => t.controllerId === targetId);
                    if (target?.name) current.name = target.name;
                }

                current.count++;
                counts.set(targetId, current);
            }
        });
        return Array.from(counts.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [actions, targets]);

    return {
        recentActions,
        pendingCount,
        activeActionsCount,
        finishedCount,
        errorCount,
        successRate,
        recentActivities,
        recentlyFinishedItems,
        velocityData,
        actionTrendData,
        errorAnalysis,
        delayedActions,
        delayedActionsCount,
        delayedActions24hCount,
        canceledActions24hCount,
        errorActions24hCount,
        errorActions1hCount,
        highErrorTargets,
    };
};
