import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';

type UseRolloutMetricsParams = {
    rollouts: MgmtRolloutResponseBody[];
    totalDevices: number;
    inSyncCount: number;
    finishedCount: number;
    errorCount: number;
    totalActions: number;
    t: TFunction;
};

export const useRolloutMetrics = ({
    rollouts,
    totalDevices,
    inSyncCount,
    finishedCount,
    errorCount,
    totalActions,
    t,
}: UseRolloutMetricsParams) => {
    const activeRolloutCount = useMemo(() => rollouts.filter(r =>
        ['running', 'starting'].includes(r.status?.toLowerCase() || '')
    ).length, [rollouts]);
    const finishedRolloutCount = useMemo(() => rollouts.filter(r =>
        r.status?.toLowerCase() === 'finished'
    ).length, [rollouts]);
    const errorRolloutCount = useMemo(() => rollouts.filter(r =>
        ['error', 'stopped'].includes(r.status?.toLowerCase() || '')
    ).length, [rollouts]);

    const ongoingRollouts = rollouts.filter(r =>
        ['running', 'paused', 'starting', 'waiting_for_approval'].includes(r.status?.toLowerCase() || '')
    );

    const totalOngoingTargets = ongoingRollouts.reduce((sum, r) => sum + (r.totalTargets || 0), 0);
    const totalOngoingFinished = ongoingRollouts.reduce((sum, r) => {
        const stats = r.totalTargetsPerStatus || {};
        return sum + (stats.finished || stats.success || stats.SUCCESS || stats.PROCEEDED || 0);
    }, 0);

    const activeRolloutWeightedProgress = totalOngoingTargets > 0
        ? (totalOngoingFinished / totalOngoingTargets) * 100
        : 0;

    const inSyncRate = totalDevices > 0 ? Math.round((inSyncCount / totalDevices) * 100) : 0;
    const deploymentRate = ongoingRollouts.length > 0
        ? Math.round(activeRolloutWeightedProgress)
        : totalDevices > 0
            ? inSyncRate
            : totalActions > 0
                ? Math.round((finishedCount / totalActions) * 100)
                : null;

    const deploymentRateLabel = ongoingRollouts.length > 0
        ? `${totalOngoingFinished} / ${totalOngoingTargets} ${t('chart.targets', 'targets')}`
        : `${finishedCount} / ${totalActions} ${t('chart.actions', 'actions')}`;

    const activeRollouts = useMemo(() => rollouts
        .filter(r => r.status === 'running' || r.status === 'paused' || r.status === 'scheduled' || r.status === 'ready')
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 10), [rollouts]);

    const runningRolloutCount = rollouts.filter(r => r.status === 'running').length;
    const pausedRolloutCount = rollouts.filter(r => r.status === 'paused').length;
    const scheduledRolloutCount = rollouts.filter(r => r.status === 'scheduled').length;
    const readyRolloutCount = rollouts.filter(r => r.status === 'ready').length;

    const pendingApprovalRollouts = rollouts.filter(r => r.status?.toLowerCase() === 'waiting_for_approval');
    const pendingApprovalRolloutCount = pendingApprovalRollouts.length;
    const scheduledReadyRolloutCount = rollouts.filter(r =>
        ['scheduled', 'ready'].includes(r.status?.toLowerCase() || '')
    ).length;

    return {
        activeRolloutCount,
        finishedRolloutCount,
        errorRolloutCount,
        ongoingRollouts,
        totalOngoingTargets,
        totalOngoingFinished,
        deploymentRate,
        deploymentRateLabel,
        activeRollouts,
        runningRolloutCount,
        pausedRolloutCount,
        scheduledRolloutCount,
        readyRolloutCount,
        pendingApprovalRollouts,
        pendingApprovalRolloutCount,
        scheduledReadyRolloutCount,
    };
};
