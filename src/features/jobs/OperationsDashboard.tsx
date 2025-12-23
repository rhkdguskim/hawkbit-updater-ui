import React, { useMemo } from 'react';
import { Typography, Button, Flex, Skeleton, Tag, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ThunderboltOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    ReloadOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    WarningOutlined,
    RightOutlined,
    RocketOutlined,
    AimOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useGetActions } from '@/api/generated/actions/actions';
import type { MgmtAction } from '@/api/generated/model';
import {
    OverviewPageContainer,
    OverviewPageHeader,
    HeaderContent,
    GradientTitle,
    TopRow,
    BottomRow,
    KPIGridContainer,
    ChartsContainer,
    OverviewStatsCard,
    OverviewChartCard,
    OverviewListCard,
    IconBadge,
    BigNumber,
    LiveIndicator,
    ChartLegendItem,
    ActivityItem,
} from '@/components/shared/OverviewStyles';

dayjs.extend(relativeTime);

const { Text } = Typography;

// Polling Optimization: Fast when active, slow when idle
const POLLING_FAST = 5000;
const POLLING_SLOW = 30000;
const STALE_TIME = 5000;

const JOB_COLORS = {
    running: '#3b82f6',
    approval: '#8b5cf6',
    finished: '#10b981',
    error: '#ef4444',
    stopped: '#f59e0b',
};

const isActionErrored = (action: MgmtAction) => {
    const status = action.status?.toLowerCase() || '';
    const detail = action.detailStatus?.toLowerCase() || '';
    const hasErrorStatus = status === 'error' || status === 'failed';
    const hasErrorDetail = detail.includes('error') || detail.includes('failed');
    const hasErrorCode = typeof action.lastStatusCode === 'number' && action.lastStatusCode >= 400;
    return hasErrorStatus || hasErrorDetail || hasErrorCode;
};

const OperationsDashboard: React.FC = () => {
    const { t } = useTranslation(['jobs', 'common']);
    const navigate = useNavigate();

    // Adaptive Polling
    const { data: rolloutsData, isLoading: rolloutsLoading, refetch: refetchRollouts, dataUpdatedAt } = useGetRollouts(
        { limit: 100 },
        {
            query: {
                staleTime: STALE_TIME,
                refetchOnWindowFocus: true,
                refetchInterval: (query) => {
                    const rollouts = query.state.data?.content || [];
                    const hasActiveRollouts = rollouts.some(r =>
                        ['running', 'starting', 'waiting_for_approval'].includes(r.status?.toLowerCase() || '')
                    );
                    return hasActiveRollouts ? POLLING_FAST : POLLING_SLOW;
                },
            },
        }
    );

    const { data: actionsData, isLoading: actionsLoading, refetch: refetchActions } = useGetActions(
        { limit: 100 },
        {
            query: {
                staleTime: STALE_TIME,
                refetchOnWindowFocus: true,
                refetchInterval: (query) => {
                    const actions = query.state.data?.content || [];
                    const hasActiveActions = actions.some(a =>
                        ['running', 'retrieving', 'pending'].includes(a.status?.toLowerCase() || '')
                    );
                    return hasActiveActions ? POLLING_FAST : POLLING_SLOW;
                },
            },
        }
    );

    const isLoading = rolloutsLoading || actionsLoading;
    const refetch = () => { refetchRollouts(); refetchActions(); };
    const lastUpdated = dataUpdatedAt ? dayjs(dataUpdatedAt).fromNow() : '-';

    // Rollouts stats
    const rollouts = rolloutsData?.content || [];
    const activeRolloutCount = rollouts.filter(r =>
        ['running', 'starting'].includes(r.status?.toLowerCase() || '')
    ).length;
    const waitingApprovalCount = rollouts.filter(r =>
        r.status?.toLowerCase() === 'waiting_for_approval'
    ).length;
    const criticalAlertCount = rollouts.filter(r =>
        ['error', 'stopped'].includes(r.status?.toLowerCase() || '')
    ).length;
    const finishedRolloutCount = rollouts.filter(r =>
        r.status?.toLowerCase() === 'finished'
    ).length;

    // Actions stats
    const actions = actionsData?.content || [];
    const recentActions = actions.filter(a =>
        a.createdAt && dayjs(a.createdAt).isAfter(dayjs().subtract(24, 'hour'))
    );
    const runningActionsCount = recentActions.filter(a =>
        ['running', 'retrieving'].includes(a.status?.toLowerCase() || '') && !isActionErrored(a)
    ).length;
    const errorActionsCount = recentActions.filter(isActionErrored).length;
    const finishedActionsCount = recentActions.filter(a =>
        a.status?.toLowerCase() === 'finished' && !isActionErrored(a)
    ).length;

    // Success Rate
    const totalRolloutTargets = rollouts.reduce((sum, r) => sum + (r.totalTargets || 0), 0);
    const finishedRolloutTargets = rollouts.reduce(
        (sum, r) => sum + (r.totalTargetsPerStatus?.finished || 0), 0
    );
    const successRate = totalRolloutTargets > 0
        ? Math.round((finishedRolloutTargets / totalRolloutTargets) * 100)
        : null;

    // Pie chart data
    const rolloutStatusData = useMemo(() => [
        { name: t('common:status.running', 'Running'), value: activeRolloutCount, color: JOB_COLORS.running },
        { name: t('common:status.waiting_for_approval', 'Waiting'), value: waitingApprovalCount, color: JOB_COLORS.approval },
        { name: t('common:status.finished', 'Finished'), value: finishedRolloutCount, color: JOB_COLORS.finished },
        { name: t('common:status.error', 'Error/Stopped'), value: criticalAlertCount, color: JOB_COLORS.error },
    ].filter(d => d.value > 0), [activeRolloutCount, waitingApprovalCount, finishedRolloutCount, criticalAlertCount, t]);

    const isActivePolling = activeRolloutCount > 0 || waitingApprovalCount > 0 || runningActionsCount > 0;

    const renderCustomLegend = (data: { name: string; value: number; color: string }[]) => (
        <Flex vertical gap={4} style={{ marginTop: 4 }}>
            {data.map(entry => (
                <ChartLegendItem key={entry.name}>
                    <Flex align="center" gap={6}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, boxShadow: `0 1px 3px ${entry.color}40` }} />
                        <Text style={{ fontSize: 11, color: '#475569' }}>{entry.name}</Text>
                    </Flex>
                    <Text strong style={{ fontSize: 12, color: entry.color }}>{entry.value}</Text>
                </ChartLegendItem>
            ))}
        </Flex>
    );

    return (
        <OverviewPageContainer>
            <OverviewPageHeader>
                <HeaderContent>
                    <GradientTitle level={3} $theme="rollouts">
                        {t('operationsTitle', 'Operations Dashboard')}
                    </GradientTitle>
                    <Flex align="center" gap={12}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {t('operationsSubtitle', 'Rollout monitoring & control center')}
                        </Text>
                        <LiveIndicator $active={isActivePolling} $color={isActivePolling ? JOB_COLORS.running : '#94a3b8'}>
                            {isActivePolling ? t('polling.fast', 'Live (5s)') : t('polling.slow', 'Idle (30s)')}
                        </LiveIndicator>
                    </Flex>
                </HeaderContent>
                <Flex align="center" gap={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {t('common:updated', 'Updated')}: {lastUpdated}
                    </Text>
                    <Button icon={<ReloadOutlined />} onClick={refetch} loading={isLoading} size="small">
                        {t('common:actions.refresh', 'Refresh')}
                    </Button>
                </Flex>
            </OverviewPageHeader>

            {/* Top Row: KPI Cards + Charts */}
            <TopRow>
                <KPIGridContainer>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                        $delay={1}
                        $pulse={activeRolloutCount > 0}
                        onClick={() => navigate('/rollouts/list?status=running')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)">
                                    <PlayCircleOutlined />
                                </IconBadge>
                                <BigNumber $color={JOB_COLORS.running}>{activeRolloutCount}</BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('kpi.activeRollouts', 'Active Rollouts')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)"
                        $delay={2}
                        $pulse={waitingApprovalCount > 0}
                        onClick={() => navigate('/rollouts/list?status=waiting_for_approval')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)">
                                    <PauseCircleOutlined />
                                </IconBadge>
                                <BigNumber $color={JOB_COLORS.approval}>{waitingApprovalCount}</BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('kpi.waitingApproval', 'Waiting Approval')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor={criticalAlertCount > 0
                            ? "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                            : "linear-gradient(135deg, #10b981 0%, #34d399 100%)"}
                        $delay={3}
                        $pulse={criticalAlertCount > 0}
                        onClick={() => navigate('/rollouts/list?status=error,stopped')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color={criticalAlertCount > 0
                                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)"}>
                                    {criticalAlertCount > 0 ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                                </IconBadge>
                                <BigNumber $color={criticalAlertCount > 0 ? JOB_COLORS.error : JOB_COLORS.finished}>
                                    {criticalAlertCount}
                                </BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('kpi.criticalAlerts', 'Critical Alerts')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                        $delay={4}
                        onClick={() => navigate('/rollouts')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                                    <ThunderboltOutlined />
                                </IconBadge>
                                <BigNumber $color={JOB_COLORS.finished}>
                                    {successRate !== null ? `${successRate}%` : '-'}
                                </BigNumber>
                                <Progress
                                    percent={successRate ?? 0}
                                    size="small"
                                    strokeColor={JOB_COLORS.finished}
                                    showInfo={false}
                                    style={{ width: 50 }}
                                />
                            </Flex>
                        )}
                    </OverviewStatsCard>
                </KPIGridContainer>

                <ChartsContainer>
                    <OverviewChartCard
                        $theme="rollouts"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $theme="rollouts">
                                    <RocketOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.rolloutStatus', 'Rollout Status')}</span>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t('chart.totalCount', { count: rollouts.length })}</Text>
                                </Flex>
                            </Flex>
                        }
                        $delay={5}
                    >
                        {isLoading ? (
                            <Skeleton.Avatar active size={60} shape="circle" style={{ margin: '8px auto', display: 'block' }} />
                        ) : rolloutStatusData.length > 0 ? (
                            <Flex vertical style={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={rolloutStatusData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {rolloutStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {renderCustomLegend(rolloutStatusData)}
                            </Flex>
                        ) : (
                            <Flex justify="center" align="center" style={{ flex: 1 }}>
                                <Text type="secondary">{t('messages.noRollouts', 'No rollouts')}</Text>
                            </Flex>
                        )}
                    </OverviewChartCard>

                    <OverviewChartCard
                        $theme="actions"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $theme="actions">
                                    <AimOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.actionSummary', 'Actions (24h)')}</span>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t('chart.recentCount', { count: recentActions.length })}</Text>
                                </Flex>
                            </Flex>
                        }
                        $delay={6}
                    >
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 3 }} />
                        ) : (
                            <Flex vertical gap={8} style={{ flex: 1 }}>
                                <Flex align="center" justify="space-between" style={{ padding: '8px 12px', background: `${JOB_COLORS.running}10`, borderRadius: 8 }}>
                                    <Flex align="center" gap={8}>
                                        <SyncOutlined spin style={{ color: JOB_COLORS.running }} />
                                        <Text style={{ fontSize: 12 }}>{t('status.running', 'Running')}</Text>
                                    </Flex>
                                    <Text strong style={{ fontSize: 16, color: JOB_COLORS.running }}>{runningActionsCount}</Text>
                                </Flex>
                                <Flex align="center" justify="space-between" style={{ padding: '8px 12px', background: `${JOB_COLORS.finished}10`, borderRadius: 8 }}>
                                    <Flex align="center" gap={8}>
                                        <CheckCircleOutlined style={{ color: JOB_COLORS.finished }} />
                                        <Text style={{ fontSize: 12 }}>{t('status.finished', 'Finished')}</Text>
                                    </Flex>
                                    <Text strong style={{ fontSize: 16, color: JOB_COLORS.finished }}>{finishedActionsCount}</Text>
                                </Flex>
                                <Flex align="center" justify="space-between" style={{ padding: '8px 12px', background: errorActionsCount > 0 ? `${JOB_COLORS.error}10` : 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                                    <Flex align="center" gap={8}>
                                        <WarningOutlined style={{ color: errorActionsCount > 0 ? JOB_COLORS.error : '#94a3b8' }} />
                                        <Text style={{ fontSize: 12 }}>{t('status.error', 'Errors')}</Text>
                                    </Flex>
                                    <Text strong style={{ fontSize: 16, color: errorActionsCount > 0 ? JOB_COLORS.error : '#94a3b8' }}>{errorActionsCount}</Text>
                                </Flex>
                            </Flex>
                        )}
                    </OverviewChartCard>
                </ChartsContainer>
            </TopRow>

            {/* Bottom Row: Quick Access */}
            <BottomRow>
                <OverviewListCard
                    $theme="rollouts"
                    title={
                        <Flex align="center" gap={10}>
                            <IconBadge $theme="rollouts">
                                <RocketOutlined />
                            </IconBadge>
                            <Flex vertical gap={0}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{t('quickAccess.rollouts', 'Rollouts')}</span>
                                <Text type="secondary" style={{ fontSize: 11 }}>{t('quickAccess.rolloutsDesc', 'Manage rollout deployments')}</Text>
                            </Flex>
                        </Flex>
                    }
                    extra={
                        <Button type="link" size="small" onClick={() => navigate('/rollouts')}>
                            {t('quickAccess.viewAll', 'View All')} <RightOutlined />
                        </Button>
                    }
                    $delay={7}
                >
                    <Flex vertical gap={12} style={{ flex: 1 }}>
                        <ActivityItem onClick={() => navigate('/rollouts/list?status=running')}>
                            <Flex align="center" gap={10}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <PlayCircleOutlined style={{ fontSize: 18, color: JOB_COLORS.running }} />
                                </div>
                                <Flex vertical gap={0}>
                                    <Text strong style={{ fontSize: 13 }}>{t('status.running', 'Running')}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t('kpi.activeRollouts', 'Active rollouts')}</Text>
                                </Flex>
                            </Flex>
                            <Tag color="blue" style={{ margin: 0, borderRadius: 999 }}>{activeRolloutCount}</Tag>
                        </ActivityItem>
                        <ActivityItem onClick={() => navigate('/rollouts/list?status=waiting_for_approval')}>
                            <Flex align="center" gap={10}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <ClockCircleOutlined style={{ fontSize: 18, color: JOB_COLORS.approval }} />
                                </div>
                                <Flex vertical gap={0}>
                                    <Text strong style={{ fontSize: 13 }}>{t('status.waiting_for_approval', 'Waiting Approval')}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t('kpi.requiresReview', 'Requires review')}</Text>
                                </Flex>
                            </Flex>
                            <Tag color="purple" style={{ margin: 0, borderRadius: 999 }}>{waitingApprovalCount}</Tag>
                        </ActivityItem>
                        <ActivityItem onClick={() => navigate('/rollouts/list?status=finished')}>
                            <Flex align="center" gap={10}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.1) 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <CheckCircleOutlined style={{ fontSize: 18, color: JOB_COLORS.finished }} />
                                </div>
                                <Flex vertical gap={0}>
                                    <Text strong style={{ fontSize: 13 }}>{t('status.finished', 'Finished')}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t('quickAccess.completedRollouts', 'Completed')}</Text>
                                </Flex>
                            </Flex>
                            <Tag color="green" style={{ margin: 0, borderRadius: 999 }}>{finishedRolloutCount}</Tag>
                        </ActivityItem>
                    </Flex>
                </OverviewListCard>

                <OverviewListCard
                    $theme="actions"
                    title={
                        <Flex align="center" gap={10}>
                            <IconBadge $theme="actions">
                                <AimOutlined />
                            </IconBadge>
                            <Flex vertical gap={0}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{t('quickAccess.actions', 'Actions')}</span>
                                <Text type="secondary" style={{ fontSize: 11 }}>{t('quickAccess.actionsDesc', 'Track device actions')}</Text>
                            </Flex>
                        </Flex>
                    }
                    extra={
                        <Button type="link" size="small" onClick={() => navigate('/actions')}>
                            {t('quickAccess.viewAll', 'View All')} <RightOutlined />
                        </Button>
                    }
                    $delay={8}
                >
                    <Flex vertical gap={12} style={{ flex: 1, justifyContent: 'center' }}>
                        <Flex justify="space-around" align="center" style={{ flex: 1 }}>
                            <Flex vertical align="center" gap={4}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: `${JOB_COLORS.running}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <SyncOutlined spin style={{ fontSize: 24, color: JOB_COLORS.running }} />
                                </div>
                                <Text style={{ fontSize: 20, fontWeight: 700, color: JOB_COLORS.running }}>{runningActionsCount}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>{t('status.running', 'Running')}</Text>
                            </Flex>
                            <Flex vertical align="center" gap={4}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: `${JOB_COLORS.finished}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <CheckCircleOutlined style={{ fontSize: 24, color: JOB_COLORS.finished }} />
                                </div>
                                <Text style={{ fontSize: 20, fontWeight: 700, color: JOB_COLORS.finished }}>{finishedActionsCount}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>{t('status.finished', 'Finished')}</Text>
                            </Flex>
                            <Flex vertical align="center" gap={4}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: errorActionsCount > 0 ? `${JOB_COLORS.error}15` : 'rgba(0,0,0,0.03)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <WarningOutlined style={{ fontSize: 24, color: errorActionsCount > 0 ? JOB_COLORS.error : '#94a3b8' }} />
                                </div>
                                <Text style={{ fontSize: 20, fontWeight: 700, color: errorActionsCount > 0 ? JOB_COLORS.error : '#94a3b8' }}>{errorActionsCount}</Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>{t('status.error', 'Errors')}</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </OverviewListCard>
            </BottomRow>
        </OverviewPageContainer>
    );
};

export default OperationsDashboard;
