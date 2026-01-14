import React, { useState } from 'react';
import { Flex } from 'antd';
import { isActive } from '@/entities';

import { ThreeLayerDashboardGrid } from './components/layouts/ThreeLayerDashboardGrid';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { HealthSummaryWidget } from './components/widgets/HealthSummaryWidget';
import { ActionRequiredWidget } from './components/widgets/ActionRequiredWidget';
import { ActiveRolloutsWidget } from './components/widgets/ActiveRolloutsWidget';
import { InProgressUpdatesWidget } from './components/widgets/InProgressUpdatesWidget';
import { ActionActivityWidget } from './components/widgets/ActionActivityWidget';
import { StatusTrendChart } from './components/widgets/StatusTrendChart';
import { KPIHealthSummary } from './components/widgets/KPIHealthSummary';
import { ActionRequiredDetailsModal } from './components/widgets/ActionRequiredDetailsModal';
import { FailureAnalysisModal } from './components/widgets/FailureAnalysisModal';
import { RecentlyFinishedActionsWidget } from './components/widgets/RecentlyFinishedActionsWidget';
import { ConnectivityChart } from './components/widgets/ConnectivityChart';
import { TargetRequestDelayWidget } from './components/widgets/TargetRequestDelayWidget';
import { FragmentationChart } from './components/widgets/FragmentationChart';
import { TargetTypeCoverageChart } from './components/widgets/TargetTypeCoverageChart';
import { DeploymentVelocityWidget } from './components/widgets/DeploymentVelocityWidget';
import { NewTargetsTrendChart } from './components/widgets/NewTargetsTrendChart';
import { DistributionSummaryWidget } from './components/widgets/DistributionSummaryWidget';
import { ModuleTypeCoverageChart } from './components/widgets/ModuleTypeCoverageChart';
import { HighErrorTargetsWidget } from './components/widgets/HighErrorTargetsWidget';
import { DistributionCompletenessChart } from './components/widgets/DistributionCompletenessChart';
import { RolloutStatusChart } from './components/widgets/RolloutStatusChart';
import { RolloutQueueChart } from './components/widgets/RolloutQueueChart';
import RolloutCreateModal from '@/features/rollouts/RolloutCreateModal';

const Dashboard: React.FC = () => {
    const metrics = useDashboardMetrics();
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);
    const [isCreateRolloutVisible, setIsCreateRolloutVisible] = useState(false);
    const [actionRequiredType, setActionRequiredType] = useState<'DELAYED' | 'APPROVAL_PENDING' | null>(null);

    const onActionRequiredClick = (type: 'DELAYED' | 'APPROVAL_PENDING') => {
        setActionRequiredType(type);
    };

    return (
        <>
            <ThreeLayerDashboardGrid
                header={null}
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
                extraDecision={
                    <KPIHealthSummary
                        isLoading={metrics.isLoading}
                        onlineRate={metrics.onlineRate}
                        deploymentRate={metrics.deploymentRate}
                        errorRate={metrics.errorRate}
                        pendingCount={metrics.pendingCount}
                        runningRolloutCount={metrics.runningRolloutCount}
                        securityCoverage={metrics.securityCoverage}
                    />
                }
                overviewItem4={
                    <DistributionSummaryWidget
                        isLoading={metrics.isLoading}
                        distributionSetsCount={metrics.distributionSetsCount}
                        softwareModulesCount={metrics.softwareModulesCount}
                        recentSets={metrics.recentDistributionSets}
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
                        <RolloutStatusChart
                            isLoading={metrics.isLoading}
                            activeRolloutCount={metrics.activeRolloutCount}
                            finishedRolloutCount={metrics.finishedRolloutCount}
                            errorRolloutCount={metrics.errorRolloutCount}
                        />
                        <RolloutQueueChart
                            isLoading={metrics.isLoading}
                            pendingApprovalCount={metrics.pendingApprovalRolloutCount}
                            pausedCount={metrics.pausedRolloutCount}
                            scheduledReadyCount={metrics.readyRolloutCount + metrics.scheduledRolloutCount}
                        />
                        <TargetTypeCoverageChart
                            isLoading={metrics.isLoading}
                            data={metrics.targetTypeCoverageData}
                        />
                        <ModuleTypeCoverageChart
                            isLoading={metrics.isLoading}
                            data={metrics.softwareModuleTypeDistribution}
                        />
                        <DistributionCompletenessChart
                            isLoading={metrics.isLoading}
                            data={metrics.completenessData}
                        />
                        <TargetRequestDelayWidget
                            isLoading={metrics.isLoading}
                            averageDelay={metrics.averageDelay}
                            topDelayedTargets={metrics.topDelayedTargets}
                        />
                    </>
                }
                showLayerLabels={true}
                // Monitoring Layer (Bottom)
                statusTrend={
                    <StatusTrendChart
                        isLoading={metrics.isLoading}
                        actions={metrics.actions}
                        rollouts={metrics.rollouts}
                        referenceTimeMs={metrics.stableNowMs}
                    />
                }
                actionActivity={
                    <Flex vertical gap={12} style={{ height: '100%' }}>
                        <div style={{ flex: 1 }}>
                            <DeploymentVelocityWidget
                                isLoading={metrics.isLoading}
                                data={metrics.velocityData.trend}
                                currentVelocity={metrics.velocityData.currentVelocity}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <HighErrorTargetsWidget
                                isLoading={metrics.isLoading}
                                data={metrics.highErrorTargets}
                            />
                        </div>
                    </Flex>
                }
                recentlyFinishedActions={
                    <Flex vertical gap={12} style={{ height: '100%' }}>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <RecentlyFinishedActionsWidget
                                isLoading={metrics.isLoading}
                                recentlyFinishedItems={metrics.recentlyFinishedItems}
                                maxItems={3}
                            />
                        </div>
                        <div style={{ height: 'auto' }}>
                            <ActionActivityWidget
                                isLoading={metrics.isLoading}
                                runningActions={metrics.actions.filter(a => isActive(a))}
                                recentFinishedActions={metrics.actions.filter(a => ['finished', 'canceled', 'error'].includes(a.status?.toLowerCase() || ''))}
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
