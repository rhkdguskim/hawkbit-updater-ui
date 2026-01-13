import React, { useState } from 'react';
import { ThreeLayerDashboardGrid } from '../layouts/ThreeLayerDashboardGrid';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { HealthSummaryWidget } from '../widgets/HealthSummaryWidget';
import { ActionRequiredWidget } from '../widgets/ActionRequiredWidget';
import { ActiveRolloutsWidget } from '../widgets/ActiveRolloutsWidget';
import { InProgressUpdatesWidget } from '../widgets/InProgressUpdatesWidget';
import { StatusTrendChart } from '../widgets/StatusTrendChart';
import { ActionActivityWidget } from '../widgets/ActionActivityWidget';
import { KPIHealthSummary } from '../widgets/KPIHealthSummary';
import { ActionRequiredDetailsModal } from '../widgets/ActionRequiredDetailsModal';
import { FailureAnalysisModal } from '../widgets/FailureAnalysisModal';
import { RecentlyFinishedActionsWidget } from '../widgets/RecentlyFinishedActionsWidget';

export const SummaryTab: React.FC = () => {
    const metrics = useDashboardMetrics();
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);
    const [actionRequiredType, setActionRequiredType] = useState<'DELAYED' | 'APPROVAL_PENDING' | null>(null);

    const onActionRequiredClick = (type: 'DELAYED' | 'APPROVAL_PENDING') => {
        setActionRequiredType(type);
    };

    return (
        <>
            <ThreeLayerDashboardGrid
                header={null} // Header is handled by the main Dashboard component
                healthSummary={
                    <HealthSummaryWidget
                        isLoading={metrics.isLoading}
                        totalTargets={metrics.totalDevices}
                        updatingCount={metrics.activeActionsCount}
                        pausedRollouts={metrics.pausedRolloutCount}
                        errorRollouts={metrics.errorRolloutCount}
                        errorActions1h={metrics.errorActions1hCount}
                        onAnalysisClick={() => setIsFailureModalVisible(true)}
                    />
                }
                actionRequired={
                    <ActionRequiredWidget
                        isLoading={metrics.isLoading}
                        delayedActionsCount={metrics.delayedActionsCount}
                        pendingApprovalsCount={metrics.pendingApprovalRolloutCount}
                        onActionClick={onActionRequiredClick}
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
                activeRollouts={
                    <ActiveRolloutsWidget
                        isLoading={metrics.isLoading}
                        activeRollouts={metrics.activeRollouts}
                        isAdmin={true}
                    />
                }
                statsRow={
                    <InProgressUpdatesWidget
                        isLoading={metrics.isLoading}
                        data={metrics.recentActivities}
                    />
                }
                statusTrend={
                    <StatusTrendChart
                        isLoading={metrics.isLoading}
                        actions={metrics.actions}
                        rollouts={metrics.rollouts}
                        referenceTimeMs={metrics.stableNowMs}
                    />
                }
                actionActivity={
                    <ActionActivityWidget
                        isLoading={metrics.isLoading}
                        runningActions={metrics.actions.filter(a => ['running', 'pending', 'scheduled'].includes(a.status?.toLowerCase() || ''))}
                        recentFinishedActions={metrics.actions.filter(a => a.status?.toLowerCase() === 'finished')}
                    />
                }
                recentlyFinishedActions={
                    <RecentlyFinishedActionsWidget
                        isLoading={metrics.isLoading}
                        recentlyFinishedItems={metrics.recentlyFinishedItems}
                    />
                }
            />
            <FailureAnalysisModal
                visible={isFailureModalVisible}
                onClose={() => setIsFailureModalVisible(false)}
                errorAnalysis={metrics.errorAnalysis}
            />
            <ActionRequiredDetailsModal
                visible={!!actionRequiredType}
                onClose={() => setActionRequiredType(null)}
                type={actionRequiredType}
                delayedActions={metrics.delayedActions}
                pendingApprovals={metrics.pendingApprovalRollouts}
            />
        </>
    );
};
