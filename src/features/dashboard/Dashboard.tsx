import React, { useState } from 'react';
import { IntegratedDashboardGrid } from './components/layouts/DashboardGrid';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { DashboardHeader } from './components/widgets/DashboardHeader';
import { IntegratedKPICards } from './components/widgets/IntegratedKPICards';
import { ConnectivityChart } from './components/widgets/ConnectivityChart';
import { FragmentationChart } from './components/widgets/FragmentationChart';
import { RolloutStatusChart } from './components/widgets/RolloutStatusChart';
import { ActionStatusChart } from './components/widgets/ActionStatusChart';
import { ActionTrendChart } from './components/widgets/ActionTrendChart';
import { DeploymentChart } from './components/widgets/DeploymentChart';
import { DistributionCompletenessChart } from './components/widgets/DistributionCompletenessChart';
import { DelayedActionsChart } from './components/widgets/DelayedActionsChart';
import { KPIHealthSummary } from './components/widgets/KPIHealthSummary';
import { NewTargetsTrendChart } from './components/widgets/NewTargetsTrendChart';
import { ActiveRolloutsWidget } from './components/widgets/ActiveRolloutsWidget';
import { RecentActivityWidget } from './components/widgets/RecentActivityWidget';
import { DeploymentVelocityWidget } from './components/widgets/DeploymentVelocityWidget';
import { FailureAnalysisModal } from './components/widgets/FailureAnalysisModal';
import { RolloutQueueChart } from './components/widgets/RolloutQueueChart';
import { TargetTypeCoverageChart } from './components/widgets/TargetTypeCoverageChart';

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);

    const inSyncCount = metrics.fragmentationStats.inSync;
    const onlineRate = metrics.totalDevices > 0 ? Math.round((metrics.onlineCount / metrics.totalDevices) * 100) : null;
    const errorRate = metrics.successRate !== null ? Math.max(0, 100 - metrics.successRate) : null;

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
                        pendingApprovalRolloutCount={metrics.pendingApprovalRolloutCount}
                        pausedRolloutCount={metrics.pausedRolloutCount}
                        scheduledReadyRolloutCount={metrics.scheduledReadyRolloutCount}
                        delayedActionsCount={metrics.delayedActionsCount}
                        newTargets24hCount={metrics.newTargets24hCount}
                        neverConnectedCount={metrics.neverConnectedCount}
                        canceledActions24hCount={metrics.canceledActions24hCount}
                        errorActions24hCount={metrics.errorActions24hCount}
                        onErrorClick={() => setIsFailureModalVisible(true)}
                    />
                }
                kpiFooter={
                    <KPIHealthSummary
                        isLoading={metrics.isLoading}
                        onlineRate={onlineRate}
                        deploymentRate={metrics.deploymentRate}
                        errorRate={errorRate}
                        pendingCount={metrics.pendingCount}
                        runningRolloutCount={metrics.runningRolloutCount}
                    />
                }
                charts={
                    <>
                        <ConnectivityChart
                            isLoading={metrics.isLoading}
                            onlineCount={metrics.onlineCount}
                            offlineCount={metrics.offlineCount}
                        />
                        <DeploymentChart
                            isLoading={metrics.isLoading}
                            deploymentRate={metrics.deploymentRate}
                            deploymentRateLabel={metrics.deploymentRateLabel}
                        />
                        <TargetTypeCoverageChart
                            isLoading={metrics.isLoading}
                            data={metrics.targetTypeCoverageData}
                        />
                        <ActionTrendChart
                            isLoading={metrics.isLoading}
                            data={metrics.actionTrendData}
                        />
                        <RolloutStatusChart
                            isLoading={metrics.isLoading}
                            activeRolloutCount={metrics.runningRolloutCount}
                            finishedRolloutCount={metrics.finishedRolloutCount}
                            errorRolloutCount={metrics.errorRolloutCount}
                        />
                        <RolloutQueueChart
                            isLoading={metrics.isLoading}
                            pendingApprovalCount={metrics.pendingApprovalRolloutCount}
                            pausedCount={metrics.pausedRolloutCount}
                            scheduledReadyCount={metrics.scheduledReadyRolloutCount}
                        />
                        <DeploymentVelocityWidget
                            isLoading={metrics.isLoading}
                            data={metrics.velocityData.trend}
                            currentVelocity={metrics.velocityData.currentVelocity}
                        />
                        <DelayedActionsChart
                            isLoading={metrics.isLoading}
                            delayedCount={metrics.delayedActionsCount}
                            activeCount={metrics.activeActionsCount}
                        />
                        <ActionStatusChart
                            isLoading={metrics.isLoading}
                            pendingCount={metrics.pendingCount}
                            finishedCount={metrics.finishedCount}
                            errorCount={metrics.errorCount}
                        />
                        <FragmentationChart
                            isLoading={metrics.isLoading}
                            stats={metrics.fragmentationStats}
                        />
                        <NewTargetsTrendChart
                            isLoading={metrics.isLoading}
                            data={metrics.newTargetsTrendData}
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
