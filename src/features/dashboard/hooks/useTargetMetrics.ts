import { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import type { TFunction } from 'i18next';
import type { MgmtTarget, PagedListMgmtTargetType } from '@/api/generated/model';
import { isTargetOnline } from '@/entities';
import { COLORS } from '@/components/shared/OverviewStyles';

type TargetTypeCoverageDatum = {
    name: string;
    value: number;
    color: string;
};

type NewTargetsTrendDatum = {
    time: string;
    count: number;
};

type TargetDelayItem = {
    controllerId: string;
    name: string;
    lastRequestAt: number;
    delay: number;
};

type UseTargetMetricsParams = {
    targets: MgmtTarget[];
    targetTypesData?: PagedListMgmtTargetType;
    last24h: Dayjs;
    stableNowMs: number | null;
    t: TFunction;
};

export const useTargetMetrics = ({
    targets,
    targetTypesData,
    last24h,
    stableNowMs,
    t,
}: UseTargetMetricsParams) => {
    const targetTypeColorMap = useMemo(() => {
        const map = new Map<string, string>();
        targetTypesData?.content?.forEach(tt => {
            if (tt.name && tt.colour) {
                map.set(tt.name, tt.colour);
            }
        });
        return map;
    }, [targetTypesData]);

    const onlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined && isTargetOnline(t)
    ).length;
    const offlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined && !isTargetOnline(t)
    ).length;

    const fragmentationStats = {
        inSync: targets.filter(t => t.updateStatus?.toUpperCase() === 'IN_SYNC').length,
        pending: targets.filter(t => t.updateStatus?.toUpperCase() === 'PENDING').length,
        unknown: targets.filter(t => t.updateStatus?.toUpperCase() === 'UNKNOWN').length,
        error: targets.filter(t => t.updateStatus?.toUpperCase() === 'ERROR').length,
        registered: targets.filter(t => t.updateStatus?.toUpperCase() === 'REGISTERED').length,
    };

    const recentDevices = useMemo(() => {
        return [...targets]
            .filter(t => t.pollStatus?.lastRequestAt)
            .sort((a, b) => (b.pollStatus?.lastRequestAt || 0) - (a.pollStatus?.lastRequestAt || 0))
            .slice(0, 10);
    }, [targets]);

    const targetTypeCoverageData = useMemo<TargetTypeCoverageDatum[]>(() => {
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

    const newTargets24hCount = targets.filter(t =>
        t.createdAt && dayjs(t.createdAt).isAfter(last24h)
    ).length;

    const newTargetsTrendData = useMemo<NewTargetsTrendDatum[]>(() => {
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
                count,
            };
        });
    }, [targets]);

    const orphanTargetsCount = targets.filter(t => !t._links?.assignedDS).length;
    const criticalOfflineCount = targets.filter(t =>
        !isTargetOnline(t) &&
        ['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(t.updateStatus?.toLowerCase() || '')
    ).length;
    const neverConnectedCount = targets.filter(t => t.pollStatus?.lastRequestAt === undefined).length;

    const targetsWithLastRequest = targets.filter(t => t.pollStatus?.lastRequestAt);
    const nowMs = stableNowMs || Date.now();

    const topDelayedTargets: TargetDelayItem[] = [...targetsWithLastRequest]
        .map(t => ({
            controllerId: t.controllerId,
            name: t.name || t.controllerId,
            lastRequestAt: t.pollStatus?.lastRequestAt || 0,
            delay: nowMs - (t.pollStatus?.lastRequestAt || 0),
        }))
        .sort((a, b) => b.delay - a.delay)
        .slice(0, 5);

    const totalDelay = targetsWithLastRequest.reduce((sum, t) => sum + (nowMs - (t.pollStatus?.lastRequestAt || 0)), 0);
    const averageDelay = targetsWithLastRequest.length > 0 ? Math.round(totalDelay / targetsWithLastRequest.length) : 0;

    const securityTokenCount = targets.filter(t => t.securityToken && t.securityToken.length > 0).length;

    return {
        targetTypeColorMap,
        onlineCount,
        offlineCount,
        fragmentationStats,
        recentDevices,
        targetTypeCoverageData,
        newTargets24hCount,
        newTargetsTrendData,
        orphanTargetsCount,
        criticalOfflineCount,
        neverConnectedCount,
        topDelayedTargets,
        averageDelay,
        securityTokenCount,
    };
};
