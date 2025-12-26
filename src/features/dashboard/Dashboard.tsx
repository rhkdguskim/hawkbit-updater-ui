import React from 'react';
import { IntegratedDashboardGrid } from './components/layouts/DashboardGrid';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { DashboardHeader } from './components/widgets/DashboardHeader';
import { IntegratedKPICards } from './components/widgets/IntegratedKPICards';
import { ConnectivityChart } from './components/widgets/ConnectivityChart';
import { FragmentationChart } from './components/widgets/FragmentationChart';
import { RolloutStatusChart } from './components/widgets/RolloutStatusChart';
import { DistributionCompletenessChart } from './components/widgets/DistributionCompletenessChart';
import { ActiveRolloutsWidget } from './components/widgets/ActiveRolloutsWidget';
import { RecentActivityWidget } from './components/widgets/RecentActivityWidget';
import DeviceCardGrid from './components/DeviceCardGrid';

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();

    // Calculate in-sync count from fragmentation stats
    const inSyncCount = metrics.fragmentationStats.inSync;

    return (
        <IntegratedDashboardGrid
            header={
                <DashboardHeader
                    lastUpdated={metrics.lastUpdated}
                    isActivePolling={metrics.isActivePolling}
                    isLoading={metrics.isLoading}
                    onRefresh={metrics.refetch}
                />
            }
            kpiCards={
                <IntegratedKPICards
                    isLoading={metrics.isLoading}
                    totalDevices={metrics.totalDevices}
                    onlineCount={metrics.onlineCount}
                    inSyncCount={inSyncCount}
                    pendingCount={metrics.pendingCount}
                    errorCount={metrics.errorCount}
                    distributionSetsCount={metrics.distributionSetsCount}
                    runningRolloutCount={metrics.runningRolloutCount}
                    successRate={metrics.successRate}
                />
            }
            charts={
                <>
                    <ConnectivityChart
                        isLoading={metrics.isLoading}
                        onlineCount={metrics.onlineCount}
                        offlineCount={metrics.offlineCount}
                    />
                    <FragmentationChart
                        isLoading={metrics.isLoading}
                        stats={metrics.fragmentationStats}
                    />
                    <RolloutStatusChart
                        isLoading={metrics.isLoading}
                        activeRolloutCount={metrics.runningRolloutCount}
                        finishedRolloutCount={metrics.finishedRolloutCount}
                        errorRolloutCount={metrics.errorRolloutCount}
                    />
                    <DistributionCompletenessChart
                        isLoading={metrics.isLoading}
                        completenessData={metrics.completenessData}
                        totalCount={metrics.distributionSetsCount}
                    />
                </>
            }
            bottomWidgets={
                <>
                    <ActiveRolloutsWidget
                        isLoading={metrics.isLoading}
                        activeRollouts={metrics.activeRollouts}
                    />
                    <RecentActivityWidget
                        isLoading={metrics.isLoading}
                        data={metrics.recentActivities}
                    />
                    <DeviceCardGrid
                        targets={metrics.targets}
                        actions={metrics.actions}
                        targetTypeColorMap={metrics.targetTypeColorMap}
                    />
                </>
            }
        />
    );
};

export default Dashboard;
