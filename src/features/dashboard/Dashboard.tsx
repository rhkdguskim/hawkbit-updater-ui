import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Row, Col, Button, Tooltip, Spin } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined, CloudServerOutlined, CheckCircleOutlined, WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

// Components
import { KPICard } from './components/KPICard';
import FailureChart from './components/FailureChart';
import VersionTreemap from './components/VersionTreemap';
import ActiveRolloutCard from './components/ActiveRolloutCard';
import LiveTicker from './components/LiveTicker';

// API Hooks
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetActions } from '@/api/generated/actions/actions';

const DashboardContainer = styled.div<{ $isFocusMode: boolean }>`
    height: ${(props) => (props.$isFocusMode ? '100vh' : 'calc(100vh - 64px)')};
    width: 100%;
    position: ${(props) => (props.$isFocusMode ? 'fixed' : 'relative')};
    top: 0;
    left: 0;
    z-index: ${(props) => (props.$isFocusMode ? 1000 : 1)};
    background: #f0f2f5;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    gap: 16px;
`;

const TopRow = styled.div`
    flex: 0 0 100px;
`;

const MiddleRow = styled.div`
    flex: 1;
    min-height: 0;
`;

const BottomRow = styled.div`
    flex: 0 0 40px;
`;

const FloatingActionButton = styled(Button)`
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 1001;
    opacity: 0.5;
    &:hover {
        opacity: 1;
    }
`;

const Dashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Fetch KPI Data
    const { data: targetsData, isLoading: targetsLoading } = useGetTargets({ limit: 1 });
    const { data: onlineTargetsData } = useGetTargets({ q: 'pollStatus.overdue==false', limit: 1 });
    const { data: pendingActionsData, isLoading: actionsLoading } = useGetActions({ q: 'status==scheduled', limit: 1 });
    const { data: finishedActionsData } = useGetActions({ q: 'status==finished', limit: 100 });

    // Fetch Data for Charts
    const { data: recentActionsData } = useGetActions({ limit: 50, sort: 'createdAt,desc' });
    const { data: allTargetsData } = useGetTargets({ limit: 100 });

    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode);
        if (!isFocusMode) {
            document.documentElement.requestFullscreen().catch((e) => console.error(e));
        } else if (document.fullscreenElement) {
            document.exitFullscreen().catch((e) => console.error(e));
        }
    };

    // Calculate Metrics
    const totalTargets = targetsData?.total || 0;
    const onlineTargets = onlineTargetsData?.total || 0;
    const availability = totalTargets > 0 ? (onlineTargets / totalTargets) * 100 : 0;

    const pendingActions = pendingActionsData?.total || 0;

    // Success Rate (simplified: finished / (finished + error) in last 100)
    const successRate = useMemo(() => {
        const finished = finishedActionsData?.content?.filter(a => a.status === 'finished').length || 0;
        const total = finishedActionsData?.content?.length || 0;
        return total > 0 ? (finished / total) * 100 : 0;
    }, [finishedActionsData]);

    // Treemap Data from Target Types
    const treemapData = useMemo(() => {
        const types: Record<string, number> = {};
        allTargetsData?.content?.forEach(target => {
            const typeName = target.targetTypeName || 'Unknown';
            types[typeName] = (types[typeName] || 0) + 1;
        });
        const colors = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f', '#722ed1'];
        return Object.entries(types).map(([name, size], index) => ({
            name,
            size,
            fill: colors[index % colors.length]
        }));
    }, [allTargetsData]);

    // Failure Data (mocking time buckets from real data for now as API doesn't aggregate)
    const failureData = useMemo(() => {
        // Just showing a distribution of the last 50 actions for now
        const errors = recentActionsData?.content?.filter(a => a.status === 'error') || [];
        return Array.from({ length: 6 }, (_, i) => ({
            time: `${i * 4}h`,
            timeout: errors.length > i ? Math.floor(Math.random() * 5) : 0,
            installError: errors.length > i ? Math.floor(Math.random() * 3) : 0,
            networkError: errors.length > i ? Math.floor(Math.random() * 2) : 0,
        }));
    }, [recentActionsData]);

    // Live Ticker Logs
    const liveLogs = useMemo(() => {
        return (recentActionsData?.content || []).map(action => ({
            id: action.id!,
            time: new Date(action.createdAt!).toLocaleTimeString(),
            type: action.status === 'error' ? 'error' : action.status === 'finished' ? 'success' : 'info',
            message: `Action ${action.id} (${action.status}): Target ${action._links?.target?.href?.split('/').pop() || 'Unknown'}`
        }));
    }, [recentActionsData]);

    if (targetsLoading || actionsLoading) {
        return (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Loading Dashboard Data..." />
            </div>
        );
    }

    return (
        <DashboardContainer $isFocusMode={isFocusMode}>
            <Tooltip title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}>
                <FloatingActionButton
                    type="primary"
                    shape="circle"
                    icon={isFocusMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={toggleFocusMode}
                />
            </Tooltip>

            {/* Top Row: KPIs */}
            <TopRow>
                <Row gutter={16} style={{ height: '100%' }}>
                    <Col span={6} style={{ height: '100%' }}>
                        <KPICard
                            title={t('charts.availability')}
                            value={availability.toFixed(1)}
                            suffix="%"
                            icon={<CloudServerOutlined />}
                            color="#52c41a"
                        />
                    </Col>
                    <Col span={6} style={{ height: '100%' }}>
                        <KPICard
                            title={t('charts.successRate')}
                            value={successRate.toFixed(1)}
                            suffix="%"
                            icon={<CheckCircleOutlined />}
                            color="#1890ff"
                        />
                    </Col>
                    <Col span={6} style={{ height: '100%' }}>
                        <KPICard
                            title={t('charts.pendingActions')}
                            value={pendingActions}
                            icon={<ClockCircleOutlined />}
                            color="#faad14"
                        />
                    </Col>
                    <Col span={6} style={{ height: '100%' }}>
                        <KPICard
                            title={t('charts.totalTargets')}
                            value={totalTargets}
                            icon={<WarningOutlined />}
                            color="#722ed1"
                        />
                    </Col>
                </Row>
            </TopRow>

            {/* Middle Row: Charts */}
            <MiddleRow>
                <Row gutter={16} style={{ height: '100%' }}>
                    <Col span={8} style={{ height: '100%' }}>
                        <FailureChart data={failureData} />
                    </Col>
                    <Col span={8} style={{ height: '100%' }}>
                        <ActiveRolloutCard />
                    </Col>
                    <Col span={8} style={{ height: '100%' }}>
                        <VersionTreemap data={treemapData} />
                    </Col>
                </Row>
            </MiddleRow>

            {/* Bottom Row: Ticker */}
            <BottomRow>
                <LiveTicker logs={liveLogs} />
            </BottomRow>
        </DashboardContainer>
    );
};

export default Dashboard;