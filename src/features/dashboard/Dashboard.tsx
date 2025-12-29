import React from 'react';
import { IntegratedDashboardGrid } from './components/layouts/DashboardGrid';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { DashboardHeader } from './components/widgets/DashboardHeader';
import { IntegratedKPICards } from './components/widgets/IntegratedKPICards';
import { ConnectivityChart } from './components/widgets/ConnectivityChart';
import { FragmentationChart } from './components/widgets/FragmentationChart';
import { RolloutStatusChart } from './components/widgets/RolloutStatusChart';
import { ActiveRolloutsWidget } from './components/widgets/ActiveRolloutsWidget';
import { RecentActivityWidget } from './components/widgets/RecentActivityWidget';
import { DeploymentVelocityWidget } from './components/widgets/DeploymentVelocityWidget';
import { FailureAnalysisModal } from './components/widgets/FailureAnalysisModal';
import DeviceCardGrid from './components/DeviceCardGrid';
import { useState } from 'react';

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);

    // Calculate in-sync count from fragmentation stats
    const inSyncCount = metrics.fragmentationStats.inSync;

    return (
        <>
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
                        runningRolloutCount={metrics.runningRolloutCount}
                        successRate={metrics.successRate}
                        currentVelocity={metrics.velocityData.currentVelocity}
                        onErrorClick={() => setIsFailureModalVisible(true)}
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
                        <DeploymentVelocityWidget
                            isLoading={metrics.isLoading}
                            data={metrics.velocityData.trend}
                            currentVelocity={metrics.velocityData.currentVelocity}
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
            <FailureAnalysisModal
                visible={isFailureModalVisible}
                onClose={() => setIsFailureModalVisible(false)}
                errorAnalysis={metrics.errorAnalysis}
            />
        </>
    );
};

export default Dashboard;
