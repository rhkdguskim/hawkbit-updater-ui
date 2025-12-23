import React from 'react';
import { DashboardGrid } from './components/layouts/DashboardGrid';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { KPICards } from './components/widgets/KPICards';
import { DashboardHeader } from './components/widgets/DashboardHeader';
import { ConnectivityChart } from './components/widgets/ConnectivityChart';
import { RolloutStatusChart } from './components/widgets/RolloutStatusChart';
import { ActionStatusChart } from './components/widgets/ActionStatusChart';
import { RecentActivityWidget } from './components/widgets/RecentActivityWidget';
import { FragmentationChart } from './components/widgets/FragmentationChart';
import DeviceCardGrid from './components/DeviceCardGrid'; // Keep existing component

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();

    return (
        <DashboardGrid
            header={
                <DashboardHeader
                    lastUpdated={metrics.lastUpdated}
                    isActivePolling={metrics.isActivePolling}
                    isLoading={metrics.isLoading}
                    onRefresh={metrics.refetch}
                />
            }
            kpiCards={
                <KPICards
                    isLoading={metrics.isLoading}
                    onlineCount={metrics.onlineCount}
                    totalDevices={metrics.totalDevices}
                    successRate={metrics.successRate}
                    pendingCount={metrics.pendingCount}
                    errorCount={metrics.errorCount}
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
                        activeRolloutCount={metrics.activeRolloutCount}
                        finishedRolloutCount={metrics.finishedRolloutCount}
                        errorRolloutCount={metrics.errorRolloutCount}
                    />
                    <ActionStatusChart
                        isLoading={metrics.isLoading}
                        pendingCount={metrics.pendingCount}
                        finishedCount={metrics.finishedCount}
                        errorCount={metrics.errorCount}
                    />
                </>
            }
            bottomWidgets={
                <>
                    <RecentActivityWidget
                        isLoading={metrics.isLoading}
                        data={metrics.recentActivities}
                    />
                    {/* Reusing existing DeviceCardGrid if compatible, or just leave as is for now */}
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
