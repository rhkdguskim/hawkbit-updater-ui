import React, { useState } from 'react';
import { Flex } from 'antd';

import { ThreeLayerDashboardGrid } from './components/layouts/ThreeLayerDashboardGrid';
import { DashboardHeader } from './components/widgets/DashboardHeader';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { HealthSummaryWidget } from './components/widgets/HealthSummaryWidget';
import { ActionRequiredWidget } from './components/widgets/ActionRequiredWidget';
import { ActiveRolloutsWidget } from './components/widgets/ActiveRolloutsWidget';
import { InProgressUpdatesWidget } from './components/widgets/InProgressUpdatesWidget';
import { StatusTrendChartEnhanced } from './components/widgets/StatusTrendChartEnhanced';
import { ActionActivityWidget } from './components/widgets/ActionActivityWidgetEnhanced';
import { KPIHealthSummary } from './components/widgets/KPIHealthSummary';
import { ActionRequiredDetailsModal } from './components/widgets/ActionRequiredDetailsModal';
import { FailureAnalysisModal } from './components/widgets/FailureAnalysisModal';
import { RecentlyFinishedActionsWidget } from './components/widgets/RecentlyFinishedActionsWidget';
import { ConnectivityChart } from './components/widgets/ConnectivityChart';
import { DistributionCompletenessChart } from './components/widgets/DistributionCompletenessChart';
import { FragmentationChart } from './components/widgets/FragmentationChart';
import { TargetTypeCoverageChart } from './components/widgets/TargetTypeCoverageChart';
import { DeploymentVelocityWidget } from './components/widgets/DeploymentVelocityWidget';
import { NewTargetsTrendChart } from './components/widgets/NewTargetsTrendChart';
import { DistributionSummaryWidget } from './components/widgets/DistributionSummaryWidget';
import RolloutCreateModal from '@/features/rollouts/RolloutCreateModal';

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);
    const [isCreateRolloutVisible, setIsCreateRolloutVisible] = useState(false);
    const [actionRequiredType, setActionRequiredType] = useState<'DELAYED' | 'APPROVAL_PENDING' | null>(null);

    const onActionRequiredClick = (type: 'DELAYED' | 'APPROVAL_PENDING') => {
        setActionRequiredType(type);
    };

    const completenessData = metrics.completenessData;

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
                // Decision Layer (Top)
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
                overviewItem4={
                    <DistributionSummaryWidget
                        isLoading={metrics.isLoading}
                        distributionSetsCount={metrics.distributionSetsCount}
                        softwareModulesCount={metrics.softwareModulesCount}
                        completenessData={metrics.completenessData}
                    />
                }
                // Stats Layer (New)
                statsRow={
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
                        <DistributionCompletenessChart
                            isLoading={metrics.isLoading}
                            completenessData={completenessData}
                            totalCount={metrics.distributionSetsCount}
                        />
                        <TargetTypeCoverageChart
                            isLoading={metrics.isLoading}
                            data={metrics.targetTypeCoverageData}
                        />
                    </>
                }
                // Control Layer (Middle)
                activeRollouts={
                    <ActiveRolloutsWidget
                        isLoading={metrics.isLoading}
                        activeRollouts={metrics.activeRollouts}
                        isAdmin={true}
                    />
                }
                inProgressUpdates={
                    <InProgressUpdatesWidget
                        isLoading={metrics.isLoading}
                        data={metrics.recentActivities}
                    />
                }
                // Monitoring Layer (Bottom)
                statusTrend={
                    <StatusTrendChartEnhanced
                        isLoading={metrics.isLoading}
                        actions={metrics.actions}
                        rollouts={metrics.rollouts}
                        referenceTimeMs={metrics.stableNowMs}
                    />
                }
                actionActivity={
                    <Flex vertical gap={16} style={{ height: '100%' }}>
                        <div style={{ flex: 1 }}>
                            <DeploymentVelocityWidget
                                isLoading={metrics.isLoading}
                                data={metrics.velocityData.trend}
                                currentVelocity={metrics.velocityData.currentVelocity}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <NewTargetsTrendChart
                                isLoading={metrics.isLoading}
                                data={metrics.newTargetsTrendData}
                            />
                        </div>
                    </Flex>
                }
                recentlyFinishedActions={
                    <Flex vertical gap={16} style={{ height: '100%' }}>
                        <div style={{ height: 'auto' }}>
                            <ActionActivityWidget
                                isLoading={metrics.isLoading}
                                runningActions={metrics.actions.filter(a => ['running', 'pending', 'scheduled'].includes(a.status?.toLowerCase() || ''))}
                                recentFinishedActions={metrics.actions.filter(a => a.status?.toLowerCase() === 'finished')}
                            />
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <RecentlyFinishedActionsWidget
                                isLoading={metrics.isLoading}
                                recentlyFinishedItems={metrics.recentlyFinishedItems}
                            />
                        </div>
                    </Flex>
                }
            />

            {/* Modals */}
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
            <RolloutCreateModal
                open={isCreateRolloutVisible}
                onClose={() => setIsCreateRolloutVisible(false)}
                onSuccess={() => {
                    setIsCreateRolloutVisible(false);
                    metrics.refetch();
                }}
            />
        </>
    );
};

export default Dashboard;
