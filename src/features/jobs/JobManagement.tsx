import React from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Flex, Skeleton, Table, Tag, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import {
    ThunderboltOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { useGetActions } from '@/api/generated/actions/actions';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import type { MgmtAction, MgmtRolloutResponseBody } from '@/api/generated/model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// Animations
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow: hidden;
    animation: ${fadeInUp} 0.5s ease-out;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const GradientTitle = styled(Title)`
    && {
        margin: 0;
        background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .dark-mode & {
        background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
        -webkit-background-clip: text;
        background-clip: text;
    }
`;

const StatsCard = styled(Card) <{ $accentColor?: string; $delay?: number }>`
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.1}s;
    animation-fill-mode: both;
    cursor: pointer;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: ${props => props.$accentColor || 'var(--gradient-primary)'};
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    }

    .dark-mode & {
        background: rgba(30, 41, 59, 0.9);
    }
`;

const ChartCard = styled(Card) <{ $delay?: number }>`
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.1}s;
    animation-fill-mode: both;
    
    .ant-card-head {
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    .ant-card-head-title {
        font-size: 15px;
        font-weight: 600;
        color: #334155;
    }

    .dark-mode & {
        background: rgba(30, 41, 59, 0.9);
        
        .ant-card-head {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .ant-card-head-title {
            color: #e2e8f0;
        }
    }
`;

const BigNumber = styled.div`
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
`;

const COLORS = {
    running: '#3b82f6',
    pending: '#f59e0b',
    finished: '#10b981',
    error: '#ef4444',
};

const getActionStatusColor = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'finished') return 'green';
    if (s === 'error' || s === 'failed') return 'red';
    if (s === 'running' || s === 'retrieving') return 'blue';
    if (s === 'scheduled' || s === 'pending' || s === 'waiting_for_confirmation') return 'orange';
    return 'default';
};

const getRolloutStatusColor = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'finished') return 'green';
    if (s === 'running') return 'blue';
    if (s === 'error') return 'red';
    if (s === 'waiting_for_approval' || s === 'ready') return 'orange';
    return 'default';
};

const JobManagement: React.FC = () => {
    const { t } = useTranslation('jobs');
    const navigate = useNavigate();

    const { data: actionsData, isLoading: actionsLoading, refetch: refetchActions } = useGetActions({ limit: 200 });
    const { data: rolloutsData, isLoading: rolloutsLoading, refetch: refetchRollouts } = useGetRollouts({ limit: 100 });

    const isLoading = actionsLoading || rolloutsLoading;
    const refetch = () => { refetchActions(); refetchRollouts(); };

    // Actions stats
    const actions = actionsData?.content || [];
    const recentActions = actions.filter(a =>
        a.createdAt && dayjs(a.createdAt).isAfter(dayjs().subtract(24, 'hour'))
    );

    const runningCount = recentActions.filter(a =>
        ['running', 'retrieving'].includes(a.status?.toLowerCase() || '')
    ).length;
    const pendingCount = recentActions.filter(a =>
        ['scheduled', 'pending', 'waiting_for_confirmation'].includes(a.status?.toLowerCase() || '')
    ).length;
    const finishedCount = recentActions.filter(a =>
        a.status?.toLowerCase() === 'finished'
    ).length;
    const errorCount = recentActions.filter(a =>
        ['error', 'failed'].includes(a.status?.toLowerCase() || '')
    ).length;

    // Rollouts stats
    const rollouts = rolloutsData?.content || [];
    const activeRollouts = rollouts.filter(r =>
        ['running', 'waiting_for_approval', 'ready'].includes(r.status?.toLowerCase() || '')
    ).length;

    // Pie chart data for action status
    const actionStatusData = [
        { name: t('status.running', 'Running'), value: runningCount, color: COLORS.running },
        { name: t('status.pending', 'Pending'), value: pendingCount, color: COLORS.pending },
        { name: t('status.finished', 'Finished'), value: finishedCount, color: COLORS.finished },
        { name: t('status.error', 'Error'), value: errorCount, color: COLORS.error },
    ].filter(d => d.value > 0);

    // Recent actions table
    const recentActionsTable = [...recentActions]
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 6);

    // Active rollouts table
    const activeRolloutsTable = [...rollouts]
        .filter(r => ['running', 'waiting_for_approval', 'ready'].includes(r.status?.toLowerCase() || ''))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 4);

    const actionColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <Text strong>#{id}</Text>,
        },
        {
            title: t('table.target', 'Target'),
            key: 'target',
            render: (_: unknown, record: MgmtAction) => {
                const targetId = record._links?.target?.href?.split('/').pop();
                return targetId || '-';
            },
        },
        {
            title: t('table.status', 'Status'),
            key: 'status',
            width: 120,
            render: (_: unknown, record: MgmtAction) => (
                <Tag color={getActionStatusColor(record.status)}>
                    {record.status?.toUpperCase() || 'UNKNOWN'}
                </Tag>
            ),
        },
        {
            title: t('table.time', 'Time'),
            key: 'time',
            width: 100,
            render: (_: unknown, record: MgmtAction) =>
                record.createdAt ? dayjs(record.createdAt).fromNow() : '-',
        },
    ];

    const rolloutColumns = [
        {
            title: t('table.name', 'Name'),
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: t('table.status', 'Status'),
            key: 'status',
            width: 120,
            render: (_: unknown, record: MgmtRolloutResponseBody) => (
                <Tag color={getRolloutStatusColor(record.status)}>
                    {record.status?.toUpperCase() || 'UNKNOWN'}
                </Tag>
            ),
        },
        {
            title: t('table.progress', 'Progress'),
            key: 'progress',
            width: 120,
            render: (_: unknown, record: MgmtRolloutResponseBody) => {
                const total = record.totalTargets || 1;
                const finished = record.totalTargetsPerStatus?.finished || 0;
                const percent = Math.round((finished / total) * 100);
                return <Progress percent={percent} size="small" />;
            },
        },
    ];

    const totalActions = recentActions.length;

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <GradientTitle level={2}>
                        {t('title', 'Job Management')}
                    </GradientTitle>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        {t('subtitle', 'Actions and rollouts overview')}
                    </Text>
                </HeaderContent>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={refetch}
                    loading={isLoading}
                >
                    {t('actions.refresh', 'Refresh')}
                </Button>
            </PageHeader>

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        $accentColor="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                        $delay={1}
                        onClick={() => navigate('/actions')}
                    >
                        {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Flex justify="space-between" align="center">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>
                                        {t('kpi.running', 'Running')}
                                    </Text>
                                    <BigNumber style={{ color: COLORS.running }}>{runningCount}</BigNumber>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {t('kpi.actions', 'actions')}
                                    </Text>
                                </div>
                                <SyncOutlined spin={runningCount > 0} style={{ fontSize: 40, color: COLORS.running, opacity: 0.3 }} />
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        $accentColor="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                        $delay={2}
                        onClick={() => navigate('/actions')}
                    >
                        {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Flex justify="space-between" align="center">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>
                                        {t('kpi.pending', 'Pending')}
                                    </Text>
                                    <BigNumber style={{ color: COLORS.pending }}>{pendingCount}</BigNumber>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {t('kpi.awaitingAction', 'awaiting action')}
                                    </Text>
                                </div>
                                <ClockCircleOutlined style={{ fontSize: 40, color: COLORS.pending, opacity: 0.3 }} />
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        $accentColor="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                        $delay={3}
                        onClick={() => navigate('/actions')}
                    >
                        {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Flex justify="space-between" align="center">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>
                                        {t('kpi.completed', 'Completed')}
                                    </Text>
                                    <BigNumber style={{ color: COLORS.finished }}>{finishedCount}</BigNumber>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {t('kpi.last24h', 'last 24h')}
                                    </Text>
                                </div>
                                <CheckCircleOutlined style={{ fontSize: 40, color: COLORS.finished, opacity: 0.3 }} />
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard
                        $accentColor="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                        $delay={4}
                        onClick={() => navigate('/rollouts')}
                    >
                        {isLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                            <Flex justify="space-between" align="center">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>
                                        {t('kpi.activeRollouts', 'Active Rollouts')}
                                    </Text>
                                    <BigNumber style={{ color: activeRollouts > 0 ? COLORS.running : '#64748b' }}>
                                        {activeRollouts}
                                    </BigNumber>
                                    {errorCount > 0 && (
                                        <Tag color="red" icon={<ExclamationCircleOutlined />}>
                                            {errorCount} {t('kpi.errors', 'errors')}
                                        </Tag>
                                    )}
                                </div>
                                <ThunderboltOutlined style={{ fontSize: 40, color: COLORS.running, opacity: 0.3 }} />
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ flex: 1, minHeight: 0 }}>
                <Col xs={24} lg={8} style={{ display: 'flex' }}>
                    <ChartCard
                        style={{ flex: 1 }}
                        title={
                            <Flex justify="space-between" align="center">
                                <span>{t('chart.actionStatus', 'Action Status')}</span>
                                <Statistic
                                    value={totalActions}
                                    suffix={t('chart.total', 'total')}
                                    valueStyle={{ fontSize: 14, fontWeight: 600 }}
                                />
                            </Flex>
                        }
                        $delay={5}
                    >
                        {isLoading ? (
                            <Skeleton.Avatar active size={150} shape="circle" style={{ margin: '20px auto', display: 'block' }} />
                        ) : actionStatusData.length > 0 ? (
                            <div style={{ position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={actionStatusData}
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {actionStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.running }}>{totalActions}</div>
                                    <div style={{ fontSize: 10, color: '#64748b' }}>24h</div>
                                </div>
                                <Flex justify="center" wrap gap={10} style={{ marginTop: 4 }}>
                                    {actionStatusData.map((entry, index) => (
                                        <Flex key={index} align="center" gap={4}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
                                            <Text style={{ fontSize: 11 }}>{entry.name} ({entry.value})</Text>
                                        </Flex>
                                    ))}
                                </Flex>
                            </div>
                        ) : (
                            <Flex justify="center" align="center" style={{ height: 180 }}>
                                <Text type="secondary">{t('messages.noActions', 'No actions in last 24h')}</Text>
                            </Flex>
                        )}
                    </ChartCard>
                </Col>
                <Col xs={24} lg={16} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <ChartCard
                        title={t('chart.recentActions', 'Recent Actions')}
                        $delay={6}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                        bodyStyle={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}
                    >
                        <Table
                            dataSource={recentActionsTable}
                            columns={actionColumns}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            loading={isLoading}
                            locale={{ emptyText: t('messages.noActions', 'No recent actions') }}
                            onRow={(record) => ({
                                onClick: () => navigate(`/actions?q=id==${record.id}`),
                                style: { cursor: 'pointer' }
                            })}
                        />
                    </ChartCard>
                    {activeRolloutsTable.length > 0 && (
                        <ChartCard
                            title={t('chart.activeRollouts', 'Active Rollouts')}
                            $delay={7}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                            bodyStyle={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}
                        >
                            <Table
                                dataSource={activeRolloutsTable}
                                columns={rolloutColumns}
                                rowKey="id"
                                size="small"
                                pagination={false}
                                loading={isLoading}
                                onRow={(record) => ({
                                    onClick: () => navigate(`/rollouts/${record.id}`),
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </ChartCard>
                    )}
                </Col>
            </Row>
        </PageContainer>
    );
};

export default JobManagement;
