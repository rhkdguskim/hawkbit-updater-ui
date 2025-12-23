import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetActions } from '@/api/generated/actions/actions';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import type { MgmtAction } from '@/api/generated/model';

dayjs.extend(relativeTime);

export const useDashboardMetrics = () => {
    const { t } = useTranslation(['dashboard', 'common']);

    // Queries
    const { data: targetsData, isLoading: targetsLoading, refetch: refetchTargets, dataUpdatedAt } = useGetTargets(
        { limit: 1000 },
        { query: { staleTime: 2000, refetchInterval: 2000 } }
    );
    const { data: actionsData, isLoading: actionsLoading, refetch: refetchActions } = useGetActions(
        { limit: 100 },
        { query: { staleTime: 2000, refetchInterval: 2000 } }
    );
    const { data: rolloutsData, isLoading: rolloutsLoading, refetch: refetchRollouts } = useGetRollouts(
        { limit: 100 },
        { query: { staleTime: 2000, refetchInterval: 2000 } }
    );

    const isLoading = targetsLoading || actionsLoading || rolloutsLoading;
    const refetch = () => { refetchTargets(); refetchActions(); refetchRollouts(); };
    const lastUpdated = dataUpdatedAt ? dayjs(dataUpdatedAt).fromNow() : '-';

    const targets = targetsData?.content || [];
    const totalDevices = targetsData?.total ?? 0;

    // Helper Functions
    const isOverdueByExpectedTime = (pollStatus?: { nextExpectedRequestAt?: number }) => {
        if (!pollStatus?.nextExpectedRequestAt) return false;
        return Date.now() > pollStatus.nextExpectedRequestAt;
    };

    const isActionErrored = (action: MgmtAction) => {
        const status = action.status?.toLowerCase() || '';
        const detail = action.detailStatus?.toLowerCase() || '';
        const hasErrorStatus = status === 'error' || status === 'failed';
        const hasErrorDetail = detail.includes('error') || detail.includes('failed');
        const hasErrorCode = typeof action.lastStatusCode === 'number' && action.lastStatusCode >= 400;
        return hasErrorStatus || hasErrorDetail || hasErrorCode;
    };

    // Metrics Calculation

    // 1. Device Connectivity
    const onlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined &&
        !t.pollStatus?.overdue &&
        !isOverdueByExpectedTime(t.pollStatus)
    ).length;
    const offlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined &&
        (t.pollStatus?.overdue || isOverdueByExpectedTime(t.pollStatus))
    ).length;

    // 2. Rollouts Stats
    const rollouts = rolloutsData?.content || [];
    const activeRolloutCount = rollouts.filter(r =>
        ['running', 'starting'].includes(r.status?.toLowerCase() || '')
    ).length;
    const finishedRolloutCount = rollouts.filter(r =>
        r.status?.toLowerCase() === 'finished'
    ).length;
    const errorRolloutCount = rollouts.filter(r =>
        ['error', 'stopped'].includes(r.status?.toLowerCase() || '')
    ).length;

    // 3. Actions Stats (Latest 100)
    const actions = actionsData?.content || [];
    // Use all fetched actions (limit 100) as "recent" instead of strict 24h window
    // This ensures data is valid even if the system was idle for a while.
    const recentActions = [...actions].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const pendingCount = recentActions.filter(a =>
        ['scheduled', 'pending', 'retrieving', 'running', 'waiting_for_confirmation'].includes(a.status?.toLowerCase() || '') &&
        !isActionErrored(a)
    ).length;
    const finishedCount = recentActions.filter(a => a.status?.toLowerCase() === 'finished' && !isActionErrored(a)).length;
    const errorCount = recentActions.filter(isActionErrored).length;

    // 4. Success Rate
    const successRate = finishedCount + errorCount > 0
        ? Math.round((finishedCount / (finishedCount + errorCount)) * 100)
        : null;

    // 5. Deployment Rate
    const totalRolloutTargets = rollouts.reduce((sum, r) => sum + (r.totalTargets || 0), 0);
    const finishedRolloutTargets = rollouts.reduce(
        (sum, r) => sum + (r.totalTargetsPerStatus?.finished || 0), 0
    );

    const hasRollouts = totalRolloutTargets > 0;
    const totalActions = recentActions.length;
    const finishedActions = finishedCount;

    const deploymentRate = hasRollouts
        ? Math.round((finishedRolloutTargets / totalRolloutTargets) * 100)
        : totalActions > 0
            ? Math.round((finishedActions / totalActions) * 100)
            : null;

    const deploymentRateLabel = hasRollouts
        ? `${finishedRolloutTargets} / ${totalRolloutTargets} ${t('chart.targets', 'targets')}`
        : `${finishedActions} / ${totalActions} ${t('chart.actions', 'actions')}`;

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

            // Create target object (use matched or create placeholder)
            const target = matchedTarget || {
                controllerId: targetId || `action-${action.id}`,
                name: targetId || `Action #${action.id}`,
                updateStatus: action.status,
            };

            // Use the ACTUAL detailStatus from the action - this contains real messages like
            // "Disabling service recovery", "업데이트 프로세스 시작", etc.
            return {
                target,
                action: {
                    ...action,
                    // Keep the original detailStatus from the server
                    detailStatus: action.detailStatus || action.status || 'Processing',
                }
            };
        });
    }, [actions, targets, isActionErrored]);


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

    const isActivePolling = activeRolloutCount > 0 || pendingCount > 0;

    return {
        // State
        isLoading,
        refetch,
        lastUpdated,
        isActivePolling,

        // Data
        targets,
        rollouts,
        actions: recentActions,

        // Metrics
        totalDevices,
        onlineCount,
        offlineCount,
        successRate,
        pendingCount,
        finishedCount,
        errorCount,

        // Rollout Metrics
        activeRolloutCount,
        finishedRolloutCount,
        errorRolloutCount,

        // Deployment Metrics
        deploymentRate,
        deploymentRateLabel,

        // Fragmentation Metrics
        fragmentationStats,

        // Lists
        recentDevices, // Keeping for backward compat if needed, but will likely remove usage
        recentActivities,

        // Helper
        isActionErrored,
    };
};
