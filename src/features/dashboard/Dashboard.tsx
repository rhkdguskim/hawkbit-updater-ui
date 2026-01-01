import React, { useState } from 'react';
import { ThreeLayerDashboardGrid } from './components/layouts/ThreeLayerDashboardGrid';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { DashboardHeader } from './components/widgets/DashboardHeader';
import { HealthSummaryWidget } from './components/widgets/HealthSummaryWidget';
import { ActionRequiredWidget } from './components/widgets/ActionRequiredWidget';
import { ActiveRolloutsWidget } from './components/widgets/ActiveRolloutsWidget';
import { InProgressUpdatesWidget } from './components/widgets/InProgressUpdatesWidget';
import { StatusTrendChartEnhanced } from './components/widgets/StatusTrendChartEnhanced';
import { ActionActivityWidget } from './components/widgets/ActionActivityWidgetEnhanced';
import { KPIHealthSummary } from './components/widgets/KPIHealthSummary';
import { FailureAnalysisModal } from './components/widgets/FailureAnalysisModal';

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);

    return (
        <>
            <ThreeLayerDashboardGrid
                header={
                    <DashboardHeader
                        lastUpdated={metrics.lastUpdated}
                        isActivePolling={metrics.isActivePolling}
                        isLoading={metrics.isLoading}
                        onRefresh={metrics.refetch}
                    />
                }
                // Decision Layer
                healthSummary={
                    <HealthSummaryWidget
                        isLoading={metrics.isLoading}
                        totalTargets={metrics.totalDevices}
                        updatingCount={metrics.activeActionsCount}
                        pausedRollouts={metrics.pausedRolloutCount}
                        errorRollouts={metrics.errorRolloutCount}
                        errorActions1h={metrics.errorActions1hCount}
                    />
                }
                actionRequired={
                    <ActionRequiredWidget
                        isLoading={metrics.isLoading}
                        delayedActionsCount={metrics.delayedActionsCount}
                        pendingApprovalsCount={metrics.pendingApprovalRolloutCount}
                    />
                }
                extraDecision={
                    <KPIHealthSummary
                        isLoading={metrics.isLoading}
                        onlineRate={metrics.onlineRate}
                        deploymentRate={metrics.deploymentRate}
                        errorRate={metrics.errorRate}
                        pendingCount={metrics.pendingCount}
                        runningRolloutCount={metrics.runningRolloutCount}
                    />
                }
                // Control Layer
                activeRollouts={
                    <ActiveRolloutsWidget
                        isLoading={metrics.isLoading}
                        activeRollouts={metrics.activeRollouts}
                        isAdmin={true} // In a real app, this would come from an auth store
                    />
                }
                inProgressUpdates={
                    <InProgressUpdatesWidget
                        isLoading={metrics.isLoading}
                        data={metrics.recentActivities}
                    />
                }
                // Monitoring Layer
                statusTrend={
                    <StatusTrendChartEnhanced
                        isLoading={metrics.isLoading}
                        actions={metrics.actions}
                        rollouts={metrics.rollouts}
                    />
                }
                actionActivity={
                    <ActionActivityWidget
                        isLoading={metrics.isLoading}
                        runningActions={metrics.actions.filter(a => ['running', 'pending', 'scheduled'].includes(a.status?.toLowerCase() || ''))}
                        recentFinishedActions={metrics.actions.filter(a => a.status?.toLowerCase() === 'finished')}
                    />
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
