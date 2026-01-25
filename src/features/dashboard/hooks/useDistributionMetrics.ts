import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import type { MgmtDistributionSet, MgmtSoftwareModule } from '@/api/generated/model';

type CompletenessDatum = {
    statusKey: 'complete' | 'incomplete';
    name: string;
    value: number;
    color: string;
};

type SoftwareModuleTypeDatum = {
    name: string;
    value: number;
};

type UseDistributionMetricsParams = {
    distributionSets: MgmtDistributionSet[];
    distributionSetsCount: number;
    softwareModules: MgmtSoftwareModule[];
    softwareModulesCount: number;
    t: TFunction;
};

export const useDistributionMetrics = ({
    distributionSets,
    distributionSetsCount,
    softwareModules,
    softwareModulesCount,
    t,
}: UseDistributionMetricsParams) => {
    const completeSetsCount = useMemo(() => distributionSets.filter(ds => ds.complete).length, [distributionSets]);
    const incompleteSetsCount = useMemo(() => distributionSets.length - completeSetsCount, [distributionSets, completeSetsCount]);

    const completenessData = useMemo<CompletenessDatum[]>(() => {
        const entries: CompletenessDatum[] = [
            {
                statusKey: 'complete',
                name: t('distributions:status.complete', 'Complete'),
                value: completeSetsCount,
                color: '#10b981',
            },
            {
                statusKey: 'incomplete',
                name: t('distributions:status.incomplete', 'Incomplete'),
                value: incompleteSetsCount,
                color: '#f59e0b',
            },
        ];
        return entries.filter(item => item.value > 0);
    }, [completeSetsCount, incompleteSetsCount, t]);

    const recentDistributionSets = useMemo(() => {
        return [...distributionSets]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [distributionSets]);

    const recentSoftwareModules = useMemo(() => {
        return [...softwareModules]
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [softwareModules]);

    const softwareModuleTypeDistribution = useMemo<SoftwareModuleTypeDatum[]>(() => {
        const counts = new Map<string, number>();
        softwareModules.forEach(module => {
            const typeName = module.typeName || t('common:status.unknown', 'Unknown');
            counts.set(typeName, (counts.get(typeName) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [softwareModules, t]);

    return {
        distributionSetsCount,
        softwareModulesCount,
        completeSetsCount,
        incompleteSetsCount,
        completenessData,
        recentDistributionSets,
        recentSoftwareModules,
        softwareModuleTypeDistribution,
    };
};
