import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, theme } from 'antd';
import { isActive } from '@/entities';

import { MinimalOpsDashboard } from './components/layouts/MinimalOpsDashboard';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { DashboardHeader } from './components/widgets/DashboardHeader';
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
import { DeploymentVelocityWidget } from './components/widgets/DeploymentVelocityWidget';
import { DistributionSummaryWidget } from './components/widgets/DistributionSummaryWidget';
import { HighErrorTargetsWidget } from './components/widgets/HighErrorTargetsWidget';
import { RolloutQueueChart } from './components/widgets/RolloutQueueChart';
import RolloutCreateModal from '@/features/rollouts/RolloutCreateModal';

const { useToken } = theme;

const Dashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const metrics = useDashboardMetrics();
    const navigate = useNavigate();
    const { token } = useToken();
    const [activeTab, setActiveTab] = useState('overview');
    const [isFailureModalVisible, setIsFailureModalVisible] = useState(false);
    const [isCreateRolloutVisible, setIsCreateRolloutVisible] = useState(false);
    const [actionRequiredType, setActionRequiredType] = useState<'DELAYED' | 'APPROVAL_PENDING' | null>(null);

    const onActionRequiredClick = (type: 'DELAYED' | 'APPROVAL_PENDING') => {
        setActionRequiredType(type);
    };

    const tabItems = [
        {
            key: 'overview',
            label: t('tabs.overview', 'Overview'),
            children: (
                <MinimalOpsDashboard
                    header={null}
                    topRow={[
                        {
                            node: (
                                <HealthSummaryWidget
                                    isLoading={metrics.isLoading}
                                    totalTargets={metrics.totalDevices}
                                    updatingCount={metrics.activeActionsCount}
                                    pausedRollouts={metrics.pausedRolloutCount}
                                    errorRollouts={metrics.errorRolloutCount}
                                    errorActions1h={metrics.errorActions1hCount}
                                    onAnalysisClick={() => setIsFailureModalVisible(true)}
                                />
                            )
                        },
                        {
                            node: (
                                <KPIHealthSummary
                                    isLoading={metrics.isLoading}
                                    onlineRate={metrics.onlineRate}
                                    deploymentRate={metrics.deploymentRate}
                                    errorRate={metrics.errorRate}
                                    pendingCount={metrics.pendingCount}
                                    runningRolloutCount={metrics.runningRolloutCount}
                                    securityCoverage={metrics.securityCoverage}
                                />
                            )
                        },
                        {
                            node: (
                                <ActionRequiredWidget
                                    isLoading={metrics.isLoading}
                                    delayedActionsCount={metrics.delayedActionsCount}
                                    pendingApprovalsCount={metrics.pendingApprovalRolloutCount}
                                    onActionClick={onActionRequiredClick}
                                />
                            )
                        },
                        {
                            node: (
                                <DistributionSummaryWidget
                                    isLoading={metrics.isLoading}
                                    distributionSetsCount={metrics.distributionSetsCount}
                                    softwareModulesCount={metrics.softwareModulesCount}
                                    recentSets={metrics.recentDistributionSets}
                                />
                            )
                        },
                    ]}
                    opsLeft={[
                        {
                            flex: 1,
                            node: (
                                <ActiveRolloutsWidget
                                    isLoading={metrics.isLoading}
                                    activeRollouts={metrics.activeRollouts}
                                    isAdmin={true}
                                    onCreateClick={() => setIsCreateRolloutVisible(true)}
                                />
                            ),
                        },
                        {
                            flex: 1.4,
                            node: (
                                <InProgressUpdatesWidget
                                    isLoading={metrics.isLoading}
                                    data={metrics.recentActivities}
                                />
                            ),
                        },
                    ]}
                    opsRight={[
                        {
                            flex: 1.6,
                            node: (
                                <RecentlyFinishedActionsWidget
                                    isLoading={metrics.isLoading}
                                    recentlyFinishedItems={metrics.recentlyFinishedItems}
                                    maxItems={8}
                                />
                            ),
                        },
                        {
                            flex: 0.6,
                            node: (
                                <HighErrorTargetsWidget
                                    isLoading={metrics.isLoading}
                                    data={metrics.highErrorTargets}
                                />
                            ),
                        },
                    ]}
                />
            )
        },
        {
            key: 'connectivity',
            label: t('tabs.connectivity', 'Connectivity'),
            children: (
                <MinimalOpsDashboard
                    header={null}
                    topRow={[]}
                    opsLeft={[]}
                    opsRight={[]}
                    signals={[
                        {
                            node: (
                                <ConnectivityChart
                                    isLoading={metrics.isLoading}
                                    onlineCount={metrics.onlineCount}
                                    offlineCount={metrics.offlineCount}
                                />
                            )
                        },
                        {
                            node: (
                                <RolloutQueueChart
                                    isLoading={metrics.isLoading}
                                    pendingApprovalCount={metrics.pendingApprovalRolloutCount}
                                    pausedCount={metrics.pausedRolloutCount}
                                    scheduledReadyCount={metrics.readyRolloutCount + metrics.scheduledRolloutCount}
                                />
                            )
                        },
                        {
                            node: (
                                <FragmentationChart
                                    isLoading={metrics.isLoading}
                                    stats={metrics.fragmentationStats}
                                />
                            )
                        },
                        {
                            node: (
                                <TargetRequestDelayWidget
                                    isLoading={metrics.isLoading}
                                    averageDelay={metrics.averageDelay}
                                    topDelayedTargets={metrics.topDelayedTargets}
                                />
                            )
                        },
                    ]}
                />
            )
        },
        {
            key: 'trends',
            label: t('tabs.trends', 'Trends & Activity'),
            children: (
                <MinimalOpsDashboard
                    header={null}
                    topRow={[]}
                    opsLeft={[]}
                    opsRight={[]}
                    signals={[]}
                    trendLeft={(
                        <StatusTrendChart
                            isLoading={metrics.isLoading}
                            actions={metrics.actions}
                            rollouts={metrics.rollouts}
                            referenceTimeMs={metrics.stableNowMs}
                        />
                    )}
                    trendRight={[
                        {
                            flex: 0.7,
                            node: (
                                <DeploymentVelocityWidget
                                    isLoading={metrics.isLoading}
                                    data={metrics.velocityData.trend}
                                    currentVelocity={metrics.velocityData.currentVelocity}
                                />
                            )
                        },
                        {
                            flex: 1.3,
                            node: (
                                <ActionActivityWidget
                                    isLoading={metrics.isLoading}
                                    runningActions={metrics.actions.filter(a => isActive(a))}
                                    recentFinishedActions={metrics.actions.filter(a => ['finished', 'canceled', 'error'].includes(a.status?.toLowerCase() || ''))}
                                />
                            )
                        },
                    ]}
                />
            )
        }
    ];

    return (
        <div style={{ 
            padding: '0 24px 32px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 20,
            maxWidth: '1920px',
            margin: '0 auto',
            width: '100%'
        }}>
            <DashboardHeader
                lastUpdated={metrics.lastUpdated}
                isActivePolling={metrics.isActivePolling}
                isLoading={metrics.isLoading}
                onRefresh={metrics.refetch}
                stats={[
                    {
                        key: 'totalDevices',
                        label: t('quick.totalDevices'),
                        value: metrics.totalDevices.toLocaleString(),
                        onClick: () => navigate('/targets/list'),
                    },
                    {
                        key: 'online',
                        label: t('quick.online'),
                        value: metrics.onlineCount.toLocaleString(),
                        tone: 'good',
                    },
                    {
                        key: 'activeActions',
                        label: t('quick.activeActions'),
                        value: metrics.activeActionsCount.toLocaleString(),
                        tone: 'info',
                        onClick: () => navigate('/actions'),
                    },
                    {
                        key: 'pendingApprovals',
                        label: t('quick.pendingApprovals'),
                        value: metrics.pendingApprovalRolloutCount.toLocaleString(),
                        tone: metrics.pendingApprovalRolloutCount > 0 ? 'warn' : 'neutral',
                        onClick: () => navigate('/rollouts/list?status=waiting_for_approval'),
                    },
                    {
                        key: 'activeRollouts',
                        label: t('quick.activeRollouts'),
                        value: metrics.activeRolloutCount.toLocaleString(),
                        onClick: () => navigate('/rollouts/list?status=running'),
                    },
                ]}
            />

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                type="line"
                size="large"
                tabBarStyle={{
                    marginBottom: 20,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    padding: '0 8px',
                    background: 'transparent',
                }}
                tabBarGutter={32}
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
        </div>
    );
};

export default Dashboard;