import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetActions } from '@/api/generated/actions/actions';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetSoftwareModules } from '@/api/generated/software-modules/software-modules';
import type { MgmtDistributionSet, MgmtSoftwareModule, MgmtRolloutResponseBody, MgmtAction } from '@/api/generated/model';

import { isTargetOnline, isActionErrored } from '@/entities';
import { COLORS } from '@/components/shared/OverviewStyles';

dayjs.extend(relativeTime);

export const useDashboardMetrics = () => {
    const { t } = useTranslation(['dashboard', 'common']);

    // Queries with differentiated polling intervals
    const { data: targetsData, isLoading: targetsLoading, refetch: refetchTargets, dataUpdatedAt } = useGetTargets(
        { limit: 1000 },
        {
            query: { staleTime: 0, refetchInterval: 3000 },
            request: { skipGlobalError: true }
        }
    );
    const { data: actionsData, isLoading: actionsLoading, refetch: refetchActions } = useGetActions(
        { limit: 100 },
        {
            query: {
                staleTime: 0,
                refetchInterval: (query) => {
                    const hasActive = query.state.data?.content?.some(a =>
                        ['running', 'pending', 'scheduled', 'retrieving', 'downloading', 'retrieved'].includes(a.status?.toLowerCase() || '')
                    );
                    return hasActive ? 1000 : 10000;
                }
            },
            request: { skipGlobalError: true }
        }
    );
    const { data: rolloutsData, isLoading: rolloutsLoading, refetch: refetchRollouts } = useGetRollouts(
        { limit: 100 },
        {
            query: {
                staleTime: 0,
                refetchInterval: (query) => {
                    const hasActive = query.state.data?.content?.some(r =>
                        ['running', 'starting', 'creating', 'paused', 'waiting_for_approval', 'scheduled', 'ready'].includes(r.status?.toLowerCase() || '')
                    );
                    return hasActive ? 1000 : 10000;
                }
            },
            request: { skipGlobalError: true }
        }
    );
    const { data: targetTypesData } = useGetTargetTypes(
        { limit: 100 },
        {
            query: { staleTime: 60000 },
            request: { skipGlobalError: true }
        }
    );
    const { data: distributionSetsData, isLoading: dsLoading, refetch: refetchDS } = useGetDistributionSets(
        { limit: 500 },
        {
            query: { staleTime: 30000, refetchInterval: 60000 },
            request: { skipGlobalError: true }
        }
    );
    const { data: softwareModulesData, isLoading: smLoading, refetch: refetchSM } = useGetSoftwareModules(
        { limit: 500 },
        {
            query: { staleTime: 30000, refetchInterval: 60000 },
            request: { skipGlobalError: true }
        }
    );

    const isLoading = targetsLoading || actionsLoading || rolloutsLoading || dsLoading || smLoading;
    const refetch = () => { refetchTargets(); refetchActions(); refetchRollouts(); refetchDS(); refetchSM(); };
    const lastUpdated = dataUpdatedAt ? dayjs(dataUpdatedAt).fromNow() : '-';

    // Stable reference for "now" to satisfy React Compiler purity rules
    const [stableNowMs, setStableNowMs] = useState<number | null>(null);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStableNowMs(dataUpdatedAt || Date.now());
    }, [dataUpdatedAt]);

    const targets = useMemo(() => targetsData?.content || [], [targetsData]);
    const totalDevices = targetsData?.total ?? 0;

    // Build target type name to color map
    const targetTypeColorMap = useMemo(() => {
        const map = new Map<string, string>();
        targetTypesData?.content?.forEach(tt => {
            if (tt.name && tt.colour) {
                map.set(tt.name, tt.colour);
            }
        });
        return map;
    }, [targetTypesData]);


    // Metrics Calculation

    // 1. Device Connectivity
    const onlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined &&
        isTargetOnline(t)
    ).length;
    const offlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined &&
        !isTargetOnline(t)
    ).length;

    // 2. Rollouts Stats
    const rollouts = useMemo(() => rolloutsData?.content || [], [rolloutsData]);
    const activeRolloutCount = useMemo(() => rollouts.filter(r =>
        ['running', 'starting'].includes(r.status?.toLowerCase() || '')
    ).length, [rollouts]);
    const finishedRolloutCount = useMemo(() => rollouts.filter(r =>
        r.status?.toLowerCase() === 'finished'
    ).length, [rollouts]);
    const errorRolloutCount = useMemo(() => rollouts.filter(r =>
        ['error', 'stopped'].includes(r.status?.toLowerCase() || '')
    ).length, [rollouts]);

    // 3. Actions Stats (Latest 100)
    const actions = useMemo(() => actionsData?.content || [], [actionsData]);
    // Use all fetched actions (limit 100) as "recent" instead of strict 24h window
    // This ensures data is valid even if the system was idle for a while.
    const recentActions = [...actions].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const pendingCount = recentActions.filter(a =>
        ['scheduled', 'pending', 'retrieving', 'running', 'waiting_for_confirmation'].includes(a.status?.toLowerCase() || '') &&
        !isActionErrored(a)
    ).length;
    const activeActionsCount = recentActions.filter(a =>
        ['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(a.status?.toLowerCase() || '') &&
        !isActionErrored(a)
    ).length;
    const finishedCount = recentActions.filter(a => a.status?.toLowerCase() === 'finished' && !isActionErrored(a)).length;
    const errorCount = recentActions.filter(a => isActionErrored(a)).length;

    // 4. Success Rate
    const successRate = finishedCount + errorCount > 0
        ? Math.round((finishedCount / (finishedCount + errorCount)) * 100)
        : null;


    // 6. Recent Activity Lists - Show ACTIVE actions with real detailStatus from server
    // Use actual actions data which contains real detailStatus messages from targets
    const recentActivities = useMemo(() => {
        // Filter for actions that are currently active (not finished/canceled)
        // Ensure 'retrieved' is included so actions in this state show up and don't fall back to synthetic target data
        const activeStatuses = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading'];

        const activeActions = [...actions]
            .filter(a => {
                const status = a.status?.toLowerCase() || '';
                return activeStatuses.includes(status) && !isActionErrored(a);
            })
            .sort((a, b) => (b.lastModifiedAt || b.createdAt || 0) - (a.lastModifiedAt || a.createdAt || 0))
            .slice(0, 10);

        const DELAY_WARNING_MS = 60 * 60 * 1000; // 1 hour
        const DELAY_CRITICAL_MS = 24 * 60 * 60 * 1000; // 24 hours
        const nowMs = stableNowMs || 0;

        // Match actions to targets
        return activeActions.map(action => {
            // Extract target ID from action links
            let targetId = action._links?.target?.href?.split('/').pop();
            if (!targetId && action._links?.self?.href) {
                const match = action._links.self.href.match(/targets\/([^/]+)\/actions/);
                if (match) targetId = match[1];
            }

            // Find matching target
            const matchedTarget = targets.find(t => t.controllerId === targetId);

            // Create target object
            const target = matchedTarget || {
                controllerId: targetId || `action-${action.id}`,
                name: targetId || `Action #${action.id}`,
                updateStatus: action.status,
            };

            const startTime = action.createdAt || 0;
            const elapsed = (startTime > 0 && nowMs > 0) ? nowMs - startTime : 0;
            let delayLevel: 'normal' | 'warning' | 'critical' = 'normal';
            if (elapsed >= DELAY_CRITICAL_MS) delayLevel = 'critical';
            else if (elapsed >= DELAY_WARNING_MS) delayLevel = 'warning';

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
    }, [actions, targets, stableNowMs]);


    // 7. Recent Devices (Original List for fallback)
    const recentDevices = useMemo(() => {
        return [...targets]
            .filter(t => t.pollStatus?.lastRequestAt)
            .sort((a, b) => (b.pollStatus?.lastRequestAt || 0) - (a.pollStatus?.lastRequestAt || 0))
            .slice(0, 10);
    }, [targets]);

    // 8. Fragmentation Index (Update Status)
    const fragmentationStats = {
        inSync: targets.filter(t => t.updateStatus?.toUpperCase() === 'IN_SYNC').length,
        pending: targets.filter(t => t.updateStatus?.toUpperCase() === 'PENDING').length,
        unknown: targets.filter(t => t.updateStatus?.toUpperCase() === 'UNKNOWN').length,
        error: targets.filter(t => t.updateStatus?.toUpperCase() === 'ERROR').length,
        registered: targets.filter(t => t.updateStatus?.toUpperCase() === 'REGISTERED').length,
    };

    // 5. Deployment Rate & General Progress
    const ongoingRollouts = rollouts.filter(r =>
        ['running', 'paused', 'starting'].includes(r.status?.toLowerCase() || '')
    );

    const totalOngoingTargets = ongoingRollouts.reduce((sum, r) => sum + (r.totalTargets || 0), 0);
    const totalOngoingFinished = ongoingRollouts.reduce((sum, r) => {
        const stats = r.totalTargetsPerStatus || {};
        return sum + (stats.finished || stats.success || stats.SUCCESS || stats.PROCEEDED || 0);
    }, 0);

    const activeRolloutWeightedProgress = totalOngoingTargets > 0
        ? (totalOngoingFinished / totalOngoingTargets) * 100
        : 0;

    const onlineRate = totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 100) : 0;
    const errorRateAccuracy = finishedCount + errorCount > 0 ? Math.round((errorCount / (finishedCount + errorCount)) * 100) : 0;

    // Use fleet-wide In Sync rate as the primary source of truth for "Deployment Progress"
    // unless the active rollouts specifically provide higher/more recent progress stats.
    const inSyncRate = totalDevices > 0 ? Math.round((fragmentationStats.inSync / totalDevices) * 100) : 0;

    const totalActions = recentActions.length;
    const finishedActions = finishedCount;

    const deploymentRate = ongoingRollouts.length > 0
        ? Math.round(activeRolloutWeightedProgress)
        : totalDevices > 0
            ? inSyncRate
            : totalActions > 0
                ? Math.round((finishedActions / totalActions) * 100)
                : null;

    const deploymentRateLabel = ongoingRollouts.length > 0
        ? `${totalOngoingFinished} / ${totalOngoingTargets} ${t('chart.targets', 'targets')}`
        : `${finishedActions} / ${totalActions} ${t('chart.actions', 'actions')}`;

    // 9. Distribution Sets Metrics
    const distributionSets = useMemo(() => distributionSetsData?.content || [], [distributionSetsData]);
    const distributionSetsCount = distributionSetsData?.total ?? 0;
    const softwareModulesCount = softwareModulesData?.total ?? 0;
    const completeSetsCount = useMemo(() => distributionSets.filter(ds => ds.complete).length, [distributionSets]);
    const incompleteSetsCount = useMemo(() => distributionSets.length - completeSetsCount, [distributionSets, completeSetsCount]);

    const completenessData = useMemo(() => [
        { name: 'Complete', value: completeSetsCount, color: '#10b981' },
        { name: 'Incomplete', value: incompleteSetsCount, color: '#f59e0b' },
    ].filter(d => d.value > 0), [completeSetsCount, incompleteSetsCount]);

    const recentDistributionSets: MgmtDistributionSet[] = useMemo(() => {
        return [...distributionSets]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [distributionSets]);

    const recentSoftwareModules: MgmtSoftwareModule[] = useMemo(() => {
        return [...(softwareModulesData?.content || [])]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [softwareModulesData]);

    // 10. Active Rollouts List
    const activeRollouts: MgmtRolloutResponseBody[] = useMemo(() => {
        return rollouts
            .filter(r => r.status === 'running' || r.status === 'paused' || r.status === 'scheduled' || r.status === 'ready')
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [rollouts]);

    // 11. Rollout running count for KPI
    const runningRolloutCount = rollouts.filter(r => r.status === 'running').length;
    const pausedRolloutCount = rollouts.filter(r => r.status === 'paused').length;
    const scheduledRolloutCount = rollouts.filter(r => r.status === 'scheduled' || r.status === 'ready').length;

    const isActivePolling = activeRolloutCount > 0 || pendingCount > 0;

    // 12. Deployment Velocity Calculation
    const velocityData = useMemo(() => {
        const now = dayjs();
        const sixtyMinutesAgo = now.subtract(60, 'minute');

        // Filter actions that finished in the last hour
        // We only have the last 100 actions from the server, 
        // which is a limitation but we work with what we have.
        const finishedInLastHour = actions.filter(a => {
            if (a.status?.toLowerCase() !== 'finished' || !a.lastModifiedAt) return false;
            return dayjs(a.lastModifiedAt).isAfter(sixtyMinutesAgo);
        });

        // Current velocity (last 5 minutes average)
        const fiveMinutesAgo = now.subtract(5, 'minute');
        const finishedInLast5 = finishedInLastHour.filter(a =>
            dayjs(a.lastModifiedAt).isAfter(fiveMinutesAgo)
        ).length;

        const currentVelocity = parseFloat((finishedInLast5 / 5).toFixed(1));

        // Trend data (6 slots of 10 minutes)
        const slots = 6;
        const interval = 10;
        const trend = Array.from({ length: slots }).map((_, i) => {
            const end = now.subtract((slots - 1 - i) * interval, 'minute');
            const start = end.subtract(interval, 'minute');
            const count = finishedInLastHour.filter(a => {
                const finishedAt = dayjs(a.lastModifiedAt);
                return (finishedAt.isAfter(start) || finishedAt.isSame(start)) && finishedAt.isBefore(end);
            }).length;

            return {
                time: end.format('HH:mm'),
                rate: parseFloat((count / interval).toFixed(1)),
                count
            };
        });

        return { currentVelocity, trend };
    }, [actions]);

    // 13. Action Trend (Last 24h, 4h buckets)
    const actionTrendData = useMemo(() => {
        const now = dayjs();
        const bucketCount = 6;
        const bucketHours = 4;
        const buckets = Array.from({ length: bucketCount }).map((_, index) => {
            const end = now.subtract((bucketCount - 1 - index) * bucketHours, 'hour');
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
                errorRate
            };
        });
    }, [actions]);

    // 14. Additional KPI Metrics
    const now = dayjs();
    const last24h = now.subtract(24, 'hour');

    const pendingApprovalRolloutCount = rollouts.filter(r =>
        r.status?.toLowerCase() === 'waiting_for_approval'
    ).length;
    const scheduledReadyRolloutCount = rollouts.filter(r =>
        ['scheduled', 'ready'].includes(r.status?.toLowerCase() || '')
    ).length;

    const delayedActionsCount = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        if (!['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(status)) return false;
        const time = a.lastModifiedAt || a.createdAt || 0;
        return time > 0 && dayjs(time).isBefore(now.subtract(10, 'minute'));
    }).length;

    const delayedActions24hCount = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        if (!['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(status)) return false;
        const time = a.lastModifiedAt || a.createdAt || 0;
        return time > 0 && dayjs(time).isBefore(now.subtract(24, 'hour'));
    }).length;

    const newTargets24hCount = targets.filter(t =>
        t.createdAt && dayjs(t.createdAt).isAfter(last24h)
    ).length;

    const orphanTargetsCount = targets.filter(t => !t._links?.assignedDS).length;

    const criticalOfflineCount = targets.filter(t =>
        !isTargetOnline(t) &&
        ['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(t.updateStatus?.toLowerCase() || '')
    ).length;

    const neverConnectedCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt === undefined
    ).length;

    const canceledActions24hCount = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        if (!['canceled', 'canceling'].includes(status)) return false;
        const createdAt = a.createdAt || 0;
        return createdAt > 0 && dayjs(createdAt).isAfter(last24h);
    }).length;

    const newTargetsTrendData = useMemo(() => {
        const now = dayjs();
        const bucketCount = 6;
        const bucketHours = 4;
        const buckets = Array.from({ length: bucketCount }).map((_, index) => {
            const end = now.subtract((bucketCount - 1 - index) * bucketHours, 'hour');
            const start = end.subtract(bucketHours, 'hour');
            return { start, end, label: end.format('HH:mm') };
        });

        return buckets.map(bucket => {
            const count = targets.filter(target => {
                if (!target.createdAt) return false;
                const createdAt = dayjs(target.createdAt);
                return (createdAt.isAfter(bucket.start) || createdAt.isSame(bucket.start)) && createdAt.isBefore(bucket.end);
            }).length;

            return {
                time: bucket.label,
                count
            };
        });
    }, [targets]);

    const errorActions24hCountArray = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        if (!['error', 'warning'].includes(status)) return false;
        const createdAt = a.createdAt || 0;
        return createdAt > 0 && dayjs(createdAt).isAfter(last24h);
    });
    const errorActions24hCount = errorActions24hCountArray.length;

    const errorActions1hCount = actions.filter(a => {
        const status = a.status?.toLowerCase() || '';
        if (!['error', 'warning', 'canceled'].includes(status)) return false;
        const createdAt = a.createdAt || 0;
        return createdAt > 0 && dayjs(createdAt).isAfter(now.subtract(1, 'hour'));
    }).length;

    const targetTypeCoverageData = useMemo(() => {
        const counts = new Map<string, number>();
        targets.forEach(target => {
            const typeName = target.targetTypeName || t('common:status.unknown', 'Unknown');
            counts.set(typeName, (counts.get(typeName) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([name, value]) => ({
            name,
            value,
            color: targetTypeColorMap.get(name) || COLORS.unknown,
        }));
    }, [targets, targetTypeColorMap, t]);

    // 15. Error Analysis Calculation
    const errorAnalysis = useMemo(() => {
        const errorActions = actions.filter(a =>
            a.status?.toLowerCase() === 'error' ||
            a.status?.toLowerCase() === 'canceled' ||
            a.status?.toLowerCase() === 'warning'
        );

        const groups: Record<string, { count: number; actions: MgmtAction[] }> = {};

        errorActions.forEach(a => {
            const cause = a.detailStatus || 'Unknown Error';
            if (!groups[cause]) {
                groups[cause] = { count: 0, actions: [] };
            }
            groups[cause].count++;
            groups[cause].actions.push(a);
        });

        return Object.entries(groups).map(([cause, data]) => ({
            cause,
            count: data.count,
            percentage: errorActions.length > 0 ? Math.round((data.count / errorActions.length) * 100) : 0,
            actions: data.actions
        })).sort((a, b) => b.count - a.count);
    }, [actions]);

    return {
        // State
        isLoading,
        refetch,
        lastUpdated,
        isActivePolling,
        stableNowMs,

        // Data
        targets,
        rollouts,
        actions: recentActions,
        distributionSets,

        // Metrics
        totalDevices,
        onlineCount,
        offlineCount,
        successRate,
        pendingCount,
        finishedCount,
        errorCount,
        activeActionsCount,

        // Rollout Metrics
        activeRolloutCount,
        runningRolloutCount,
        pausedRolloutCount,
        scheduledRolloutCount,
        finishedRolloutCount,
        errorRolloutCount,

        // Distribution Metrics
        distributionSetsCount,
        softwareModulesCount,
        completeSetsCount,
        incompleteSetsCount,
        completenessData,

        // Deployment Metrics
        deploymentRate,
        onlineRate,
        errorRate: errorRateAccuracy,
        deploymentRateLabel,
        velocityData,
        actionTrendData,
        errorAnalysis,

        // Additional KPI Metrics
        pendingApprovalRolloutCount,
        scheduledReadyRolloutCount,
        delayedActionsCount,
        delayedActions24hCount,
        orphanTargetsCount,
        criticalOfflineCount,
        newTargets24hCount,
        neverConnectedCount,
        canceledActions24hCount,
        errorActions24hCount,
        errorActions1hCount,
        newTargetsTrendData,
        targetTypeCoverageData,

        // Fragmentation Metrics
        fragmentationStats,

        // Lists
        recentDevices,
        recentActivities,
        recentDistributionSets,
        recentSoftwareModules,
        activeRollouts,

        // Target Type Colors
        targetTypeColorMap,

        // Helper
        isActionErrored,
        isActionFinished: (a: { status?: string }) => a.status?.toLowerCase() === 'finished',
    };
};
