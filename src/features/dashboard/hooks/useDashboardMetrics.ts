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
import { isActionErrored, isActive } from '@/entities';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useActionMetrics } from './useActionMetrics';
import { useTargetMetrics } from './useTargetMetrics';
import { useRolloutMetrics } from './useRolloutMetrics';
import { useDistributionMetrics } from './useDistributionMetrics';

dayjs.extend(relativeTime);

export const useDashboardMetrics = () => {
    const { t } = useTranslation(['dashboard', 'common', 'distributions']);
    const isVisible = usePageVisibility();
    const { isConnected: isWebSocketConnected } = useWebSocket();
    const now = dayjs();
    const last24h = now.subtract(24, 'hour');

    const { data: targetsData, isLoading: targetsLoading, refetch: refetchTargets, dataUpdatedAt } = useGetTargets(
        { limit: 200 },
        {
            query: {
                staleTime: 10000,
                refetchInterval: isWebSocketConnected ? false : (isVisible ? 15000 : false),
            },
            request: { skipGlobalError: true },
        }
    );
    const { data: actionsData, isLoading: actionsLoading, refetch: refetchActions } = useGetActions(
        { limit: 100 },
        {
            query: {
                staleTime: 5000,
                refetchInterval: isWebSocketConnected ? false : (query) => {
                    if (!isVisible) return false;
                    const hasActive = query.state.data?.content?.some(action => isActive(action));
                    return hasActive ? 3000 : 30000;
                },
            },
            request: { skipGlobalError: true },
        }
    );
    const { data: rolloutsData, isLoading: rolloutsLoading, refetch: refetchRollouts } = useGetRollouts(
        { limit: 100 },
        {
            query: {
                staleTime: 5000,
                refetchInterval: isWebSocketConnected ? false : (query) => {
                    if (!isVisible) return false;
                    const hasActive = query.state.data?.content?.some(rollout =>
                        ['running', 'starting', 'creating', 'paused', 'waiting_for_approval', 'scheduled', 'ready']
                            .includes(rollout.status?.toLowerCase() || '')
                    );
                    return hasActive ? 3000 : 30000;
                },
            },
            request: { skipGlobalError: true },
        }
    );
    const { data: targetTypesData } = useGetTargetTypes(
        { limit: 100 },
        {
            query: { staleTime: 60000 },
            request: { skipGlobalError: true },
        }
    );
    const { data: distributionSetsData, isLoading: dsLoading, refetch: refetchDS } = useGetDistributionSets(
        { limit: 500 },
        {
            query: { staleTime: 30000, refetchInterval: 60000 },
            request: { skipGlobalError: true },
        }
    );
    const { data: softwareModulesData, isLoading: smLoading, refetch: refetchSM } = useGetSoftwareModules(
        { limit: 500 },
        {
            query: { staleTime: 30000, refetchInterval: 60000 },
            request: { skipGlobalError: true },
        }
    );

    const isLoading = targetsLoading || actionsLoading || rolloutsLoading || dsLoading || smLoading;
    const refetch = () => { refetchTargets(); refetchActions(); refetchRollouts(); refetchDS(); refetchSM(); };
    const lastUpdated = dataUpdatedAt ? dayjs(dataUpdatedAt).fromNow() : '-';

    const [stableNowMs, setStableNowMs] = useState<number | null>(null);
    useEffect(() => {
        setStableNowMs(dataUpdatedAt || Date.now());
    }, [dataUpdatedAt]);

    const targets = useMemo(() => targetsData?.content || [], [targetsData]);
    const totalDevices = targetsData?.total ?? 0;
    const actions = useMemo(() => actionsData?.content || [], [actionsData]);
    const rollouts = useMemo(() => rolloutsData?.content || [], [rolloutsData]);
    const distributionSets = useMemo(() => distributionSetsData?.content || [], [distributionSetsData]);
    const distributionSetsCount = distributionSetsData?.total ?? 0;
    const softwareModules = useMemo(() => softwareModulesData?.content || [], [softwareModulesData]);
    const softwareModulesCount = softwareModulesData?.total ?? 0;

    const targetMetrics = useTargetMetrics({ targets, targetTypesData, last24h, stableNowMs, t });
    const actionMetrics = useActionMetrics({ actions, targets, now, last24h, stableNowMs, t });
    const rolloutMetrics = useRolloutMetrics({
        rollouts,
        totalDevices,
        inSyncCount: targetMetrics.fragmentationStats.inSync,
        finishedCount: actionMetrics.finishedCount,
        errorCount: actionMetrics.errorCount,
        totalActions: actionMetrics.recentActions.length,
        t,
    });
    const distributionMetrics = useDistributionMetrics({
        distributionSets,
        distributionSetsCount,
        softwareModules,
        softwareModulesCount,
        t,
    });

    const onlineRate = totalDevices > 0 ? Math.round((targetMetrics.onlineCount / totalDevices) * 100) : 0;
    const errorRateAccuracy = actionMetrics.finishedCount + actionMetrics.errorCount > 0
        ? Math.round((actionMetrics.errorCount / (actionMetrics.finishedCount + actionMetrics.errorCount)) * 100)
        : 0;
    const securityCoverage = totalDevices > 0
        ? Math.round((targetMetrics.securityTokenCount / totalDevices) * 100)
        : 0;

    const isActivePolling = rolloutMetrics.activeRolloutCount > 0 || actionMetrics.pendingCount > 0;

    return {
        isLoading,
        refetch,
        lastUpdated,
        isActivePolling,
        stableNowMs,

        targets,
        rollouts,
        actions: actionMetrics.recentActions,
        distributionSets,

        totalDevices,
        onlineCount: targetMetrics.onlineCount,
        offlineCount: targetMetrics.offlineCount,
        successRate: actionMetrics.successRate,
        pendingCount: actionMetrics.pendingCount,
        finishedCount: actionMetrics.finishedCount,
        errorCount: actionMetrics.errorCount,
        activeActionsCount: actionMetrics.activeActionsCount,

        activeRolloutCount: rolloutMetrics.activeRolloutCount,
        runningRolloutCount: rolloutMetrics.runningRolloutCount,
        pausedRolloutCount: rolloutMetrics.pausedRolloutCount,
        scheduledRolloutCount: rolloutMetrics.scheduledRolloutCount,
        readyRolloutCount: rolloutMetrics.readyRolloutCount,
        finishedRolloutCount: rolloutMetrics.finishedRolloutCount,
        errorRolloutCount: rolloutMetrics.errorRolloutCount,

        distributionSetsCount: distributionMetrics.distributionSetsCount,
        softwareModulesCount: distributionMetrics.softwareModulesCount,
        completeSetsCount: distributionMetrics.completeSetsCount,
        incompleteSetsCount: distributionMetrics.incompleteSetsCount,
        completenessData: distributionMetrics.completenessData,

        deploymentRate: rolloutMetrics.deploymentRate,
        onlineRate,
        errorRate: errorRateAccuracy,
        deploymentRateLabel: rolloutMetrics.deploymentRateLabel,
        velocityData: actionMetrics.velocityData,
        actionTrendData: actionMetrics.actionTrendData,
        errorAnalysis: actionMetrics.errorAnalysis,

        pendingApprovalRolloutCount: rolloutMetrics.pendingApprovalRolloutCount,
        scheduledReadyRolloutCount: rolloutMetrics.scheduledReadyRolloutCount,
        delayedActionsCount: actionMetrics.delayedActionsCount,
        delayedActions24hCount: actionMetrics.delayedActions24hCount,
        orphanTargetsCount: targetMetrics.orphanTargetsCount,
        criticalOfflineCount: targetMetrics.criticalOfflineCount,
        newTargets24hCount: targetMetrics.newTargets24hCount,
        neverConnectedCount: targetMetrics.neverConnectedCount,
        canceledActions24hCount: actionMetrics.canceledActions24hCount,
        errorActions24hCount: actionMetrics.errorActions24hCount,
        errorActions1hCount: actionMetrics.errorActions1hCount,
        newTargetsTrendData: targetMetrics.newTargetsTrendData,
        targetTypeCoverageData: targetMetrics.targetTypeCoverageData,

        topDelayedTargets: targetMetrics.topDelayedTargets,
        averageDelay: targetMetrics.averageDelay,

        securityCoverage,
        securityTokenCount: targetMetrics.securityTokenCount,

        fragmentationStats: targetMetrics.fragmentationStats,

        softwareModuleTypeDistribution: distributionMetrics.softwareModuleTypeDistribution,
        highErrorTargets: actionMetrics.highErrorTargets,

        recentDevices: targetMetrics.recentDevices,
        recentActivities: actionMetrics.recentActivities,
        recentDistributionSets: distributionMetrics.recentDistributionSets,
        recentSoftwareModules: distributionMetrics.recentSoftwareModules,
        activeRollouts: rolloutMetrics.activeRollouts,
        delayedActions: actionMetrics.delayedActions,
        pendingApprovalRollouts: rolloutMetrics.pendingApprovalRollouts,
        recentlyFinishedItems: actionMetrics.recentlyFinishedItems,

        targetTypeColorMap: targetMetrics.targetTypeColorMap,

        isActionErrored,
        isActionFinished: (action: { status?: string }) => action.status?.toLowerCase() === 'finished',
    };
};
