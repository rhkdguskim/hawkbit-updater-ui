import React from 'react';
import { Row, Col } from 'antd';
import {
    DesktopOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetActions } from '@/api/generated/actions/actions';
import { useAuthStore } from '@/stores/useAuthStore';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrendData } from './hooks/useTrendData';

// Components
import { KPICard } from './components/KPICard';
import { ActiveRolloutCard } from './components/ActiveRolloutCard';
import { FailureChart } from './components/FailureChart';
import { VersionTreemap } from './components/VersionTreemap';
import { DeviceStatusChart } from './components/DeviceStatusChart';
import { RolloutStatusCard } from './components/RolloutStatusCard';
import { ActionFunnelChart } from './components/ActionFunnelChart';
import { DelayedActionTable } from './components/DelayedActionTable';
import { PendingApprovalList } from './components/PendingApprovalList';
import { TargetTypeCoverage } from './components/TargetTypeCoverage';

const Dashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const { role } = useAuthStore();

    // Redirect if not authenticated
    if (!role) {
        return <Navigate to="/login" replace />;
    }

    // Fetch All Targets (client-side calc for now) - 10s polling
    const { data: targetsData, isLoading: targetsLoading } = useGetTargets(
        { limit: 100 },
        { query: { refetchInterval: 10000 } }
    );

    // Fetch Actions for Success Rate, FailureChart, and Funnel
    const { data: actionsData, isLoading: actionsLoading } = useGetActions(
        { limit: 100 },
        { query: { refetchInterval: 10000 } }
    );

    // KPI Calculations
    const totalTargets = targetsData?.total || 0;
    const onlineCount = targetsData?.content?.filter((t) => t.pollStatus?.overdue === false).length || 0;
    const offlineCount = targetsData?.content?.filter((t) => t.pollStatus?.overdue === true).length || 0;

    // Calculate Success Rate
    const calculateSuccessRate = () => {
        if (!actionsData?.content || actionsData.content.length === 0) return 0;
        const actions = actionsData.content;
        const finished = actions.filter((a) => a.status === 'finished').length;
        const error = actions.filter((a) => a.status === 'error').length;
        if (finished + error === 0) return 0;
        return Math.round((finished / (finished + error)) * 100);
    };

    const successRate = calculateSuccessRate();
    const successColor = successRate >= 90 ? '#52c41a' : successRate >= 80 ? '#faad14' : '#ff4d4f';

    // Real Trend Data (Client-side persistence)
    const trends = useTrendData({
        totalTargets,
        onlineCount,
        offlineCount,
        successRate
    }, targetsLoading || actionsLoading);

    return (
        <div style={{ padding: '24px', width: '100%', height: '100%' }}>

            {/* Row 1: KPI Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title={t('kpi.totalTargets')}
                        value={totalTargets}
                        loading={targetsLoading}
                        trend={trends.totalTargets ?? undefined}
                        prefixIcon={<DesktopOutlined />}
                        color="#1890ff"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title={t('kpi.onlineTargets')}
                        value={onlineCount}
                        loading={targetsLoading}
                        trend={trends.onlineCount ?? undefined}
                        prefixIcon={<CheckCircleOutlined />}
                        color="#52c41a"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title={t('kpi.offlineTargets')}
                        value={offlineCount}
                        loading={targetsLoading}
                        trend={trends.offlineCount ?? undefined}
                        prefixIcon={<CloseCircleOutlined />}
                        color="#ff4d4f"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title={t('kpi.successRate')}
                        value={successRate}
                        suffix="%"
                        loading={actionsLoading}
                        trend={trends.successRate ?? undefined}
                        prefixIcon={<RiseOutlined />}
                        color={successColor}
                    />
                </Col>
            </Row>

            {/* Row 2: Status & Overview */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={8}>
                    <DeviceStatusChart
                        total={totalTargets}
                        onlineCount={onlineCount}
                        offlineCount={offlineCount}
                        loading={targetsLoading}
                    />
                </Col>
                <Col xs={24} lg={16}>
                    <RolloutStatusCard />
                </Col>
            </Row>

            {/* Row 3: Active Operations */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <ActiveRolloutCard />
                </Col>
                <Col xs={24} lg={12}>
                    <ActionFunnelChart
                        actions={actionsData?.content || []}
                        loading={actionsLoading}
                    />
                </Col>
            </Row>

            {/* Row 4: Analysis & History */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={14}>
                    <FailureChart
                        actions={actionsData?.content || []}
                        loading={actionsLoading}
                    />
                </Col>
                <Col xs={24} lg={10}>
                    <VersionTreemap
                        targets={targetsData?.content || []}
                        loading={targetsLoading}
                    />
                </Col>
            </Row>

            {/* Row 5: Action Monitoring (Phase 2) */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={14}>
                    <DelayedActionTable />
                </Col>
                <Col xs={24} lg={10}>
                    <PendingApprovalList />
                </Col>
            </Row>

            {/* Row 6: Advanced Analytics (Phase 3) */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <TargetTypeCoverage />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
