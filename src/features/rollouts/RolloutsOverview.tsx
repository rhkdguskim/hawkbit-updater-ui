import React, { useState, useMemo } from 'react';
import { Typography, Button, Flex, Skeleton, Progress, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AppstoreOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    PauseCircleOutlined,
    RocketOutlined,
    ThunderboltOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useGetActions } from '@/api/generated/actions/actions';
import { useAuthStore } from '@/stores/useAuthStore';
import { AirportSlideList, ActiveUpdatesCard } from '@/components/common';
import type { MgmtAction, MgmtRolloutResponseBody } from '@/api/generated/model';
import { PageLayout, PageHeader } from '@/components/patterns';
import {
    OverviewScrollContent,
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
    COLORS,
} from '@/components/shared/OverviewStyles';
import RolloutCreateModal from './RolloutCreateModal';
import styled from 'styled-components';

dayjs.extend(relativeTime);

const { Text } = Typography;

const ROLLOUT_COLORS = {
    running: 'var(--ant-color-info)',
    ready: 'var(--ant-color-success)',
    paused: 'var(--ant-color-warning)',
    finished: 'var(--ant-color-success)',
    error: 'var(--ant-color-error)',
    scheduled: 'var(--ant-color-primary)',
};

const ACTION_COLORS = {
    finished: 'var(--ant-color-success)',
    running: 'var(--ant-color-info)',
    pending: 'var(--ant-color-warning)',
    error: 'var(--ant-color-error)',
    canceled: 'var(--ant-color-text-quaternary)',
};

const LegendStack = styled(Flex)`
    margin-top: var(--ant-margin-xxs, 4px);
`;

const LegendSwatch = styled.div<{ $color: string }>`
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: ${props => props.$color};
    box-shadow: 0 1px 3px ${props => `${props.$color}40`};
`;

const LegendLabel = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        color: var(--ant-color-text-secondary);
    }
`;

const LegendValue = styled(Text) <{ $color: string }>`
    && {
        font-size: var(--ant-font-size-sm);
        color: ${props => props.$color};
    }
`;

const SubtitleText = styled(Text)`
    && {
        font-size: var(--ant-font-size);
    }
`;

const UpdatedText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

/* const TinyText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`; */

const StatCaption = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        text-align: center;
    }
`;

const ProgressThin = styled(Progress)`
    && {
        width: 60px;
    }
`;

const ChartTitle = styled.span`
    font-size: var(--ant-font-size);
    font-weight: 600;
`;

const ChartSubtitle = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const ChartSkeleton = styled(Skeleton.Avatar)`
    margin: var(--ant-margin-xs, 8px) auto;
    display: block;
`;

const FlexFill = styled(Flex)`
    flex: 1;
`;

const CenteredFlex = styled(Flex)`
    flex: 1;
`;

const ActiveListContainer = styled.div`
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const ActivityRow = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

const ActivityMeta = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

const ActivityName = styled(Text)`
    && {
        font-size: var(--ant-font-size);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const ActivityTag = styled(Tag)`
    && {
        margin: 0;
        font-size: var(--ant-font-size-sm);
        border-radius: 999px;
    }
`;

const ActivityCaption = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const EmptyState = styled(Flex)`
    flex: 1;
`;

const EmptyIcon = styled(RocketOutlined)`
    font-size: 40px;
    color: var(--ant-color-text-quaternary);
`;

const StatusIconWrap = styled.div<{ $status?: string }>`
    width: var(--ant-control-height-lg, 40px);
    height: var(--ant-control-height-lg, 40px);
    border-radius: var(--ant-border-radius, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${props => {
        switch (props.$status) {
            case 'running':
                return 'linear-gradient(135deg, rgba(var(--ant-color-info-rgb), 0.15) 0%, rgba(var(--ant-color-info-rgb), 0.1) 100%)';
            case 'paused':
                return 'linear-gradient(135deg, rgba(var(--ant-color-warning-rgb), 0.15) 0%, rgba(var(--ant-color-warning-rgb), 0.1) 100%)';
            default:
                return 'linear-gradient(135deg, rgba(var(--ant-color-primary-rgb), 0.15) 0%, rgba(var(--ant-color-primary-rgb), 0.1) 100%)';
        }
    }};
`;

const StatusIcon = styled.span<{ $color: string }>`
    display: inline-flex;
    font-size: 18px;
    color: ${props => props.$color};
`;

const statusColorMap: Record<string, string> = {
    running: 'blue',
    ready: 'cyan',
    paused: 'orange',
    finished: 'green',
    error: 'red',
    scheduled: 'purple',
    creating: 'default',
    starting: 'processing',
    stopped: 'default',
    waiting_for_approval: 'gold',
    pending: 'orange',
    canceled: 'default',
};

const RolloutsOverview: React.FC = () => {
    const { t } = useTranslation(['rollouts', 'actions', 'common']);
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // Fetch rollouts and actions
    const { data: allRollouts, isLoading: isRolloutsLoading, refetch: refetchRollouts, dataUpdatedAt } = useGetRollouts(
        { limit: 100 },
        { query: { staleTime: 2000, refetchInterval: 5000 } }
    );
    const { data: allActions, isLoading: isActionsLoading, refetch: refetchActions } = useGetActions(
        { limit: 200 },
        { query: { staleTime: 2000, refetchInterval: 3000 } }
    );

    const lastUpdated = dataUpdatedAt ? dayjs(dataUpdatedAt).fromNow() : '-';
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const isLoading = isRolloutsLoading || isActionsLoading;

    // Rollout stats
    const rollouts = useMemo(() => allRollouts?.content || [], [allRollouts?.content]);
    const totalRollouts = rollouts.length;
    const runningRollouts = rollouts.filter((r: MgmtRolloutResponseBody) => r.status === 'running').length;
    const finishedRollouts = rollouts.filter((r: MgmtRolloutResponseBody) => r.status === 'finished').length;
    const pausedRollouts = rollouts.filter((r: MgmtRolloutResponseBody) => r.status === 'paused').length;
    const errorRollouts = rollouts.filter((r: MgmtRolloutResponseBody) => r.status === 'error' || r.status === 'stopped').length;
    const scheduledRollouts = rollouts.filter((r: MgmtRolloutResponseBody) => r.status === 'scheduled' || r.status === 'ready').length;

    // Action stats
    const actions = useMemo(() => allActions?.content || [], [allActions?.content]);
    const totalActions = allActions?.total ?? actions.length;
    const runningActions = actions.filter((a: MgmtAction) => a.status === 'running').length;
    const finishedActions = actions.filter((a: MgmtAction) => a.status === 'finished').length;
    const pendingActions = actions.filter((a: MgmtAction) => a.status === 'pending' || a.status === 'scheduled').length;
    const errorActions = actions.filter((a: MgmtAction) => a.status === 'error').length;

    // Success rate
    const completedActions = finishedActions + errorActions;
    const successRate = completedActions > 0 ? Math.round((finishedActions / completedActions) * 100) : null;

    // Active rollouts for list
    const activeRollouts = React.useMemo(() => {
        return rollouts
            .filter((r: MgmtRolloutResponseBody) => r.status === 'running' || r.status === 'paused' || r.status === 'scheduled' || r.status === 'ready')
            .sort((a: MgmtRolloutResponseBody, b: MgmtRolloutResponseBody) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [rollouts]);

    // Active actions for list
    const activeActions = React.useMemo(() => {
        return actions
            .filter((a: MgmtAction) => a.status === 'running' || a.status === 'pending' || a.status === 'scheduled')
            .sort((a: MgmtAction, b: MgmtAction) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 10);
    }, [actions]);

    // Rollout pie data
    const rolloutPieData = [
        { name: t('common:status.running', 'Running'), value: runningRollouts, color: ROLLOUT_COLORS.running },
        { name: t('common:status.finished', 'Finished'), value: finishedRollouts, color: ROLLOUT_COLORS.finished },
        { name: t('common:status.paused', 'Paused'), value: pausedRollouts, color: ROLLOUT_COLORS.paused },
        { name: t('common:status.error', 'Error'), value: errorRollouts, color: ROLLOUT_COLORS.error },
        { name: t('common:status.scheduled', 'Scheduled'), value: scheduledRollouts, color: ROLLOUT_COLORS.scheduled },
    ].filter(d => d.value > 0);

    // Action pie data
    const actionPieData = [
        { name: t('common:status.running', 'Running'), value: runningActions, color: ACTION_COLORS.running },
        { name: t('common:status.finished', 'Finished'), value: finishedActions, color: ACTION_COLORS.finished },
        { name: t('common:status.pending', 'Pending'), value: pendingActions, color: ACTION_COLORS.pending },
        { name: t('common:status.error', 'Error'), value: errorActions, color: ACTION_COLORS.error },
    ].filter(d => d.value > 0);

    const getStatusLabel = (status?: string) => {
        if (!status) return t('common:status.unknown', { defaultValue: 'UNKNOWN' });
        const key = status.toLowerCase();
        return t(`common:status.${key}`, { defaultValue: status.replace(/_/g, ' ').toUpperCase() });
    };

    const getRolloutProgress = (rollout: MgmtRolloutResponseBody) => {
        if (rollout.status === 'finished') return 100;
        const total = rollout.totalTargets || 0;
        const finished = rollout.totalTargetsPerStatus?.finished || 0;
        if (!total) return 0;
        return Math.round((finished / total) * 100);
    };

    const getTargetId = (action: MgmtAction) => {
        let targetId = action._links?.target?.href?.split('/').pop();
        if (!targetId && action._links?.self?.href) {
            const match = action._links.self.href.match(/targets\/([^/]+)\/actions/);
            if (match) targetId = match[1];
        }
        return targetId || `#${action.id}`;
    };

    const renderCustomLegend = (data: { name: string; value: number; color: string }[]) => (
        <LegendStack vertical gap="small">
            {data.map(entry => (
                <ChartLegendItem key={entry.name}>
                    <Flex align="center" gap={6}>
                        <LegendSwatch $color={entry.color} />
                        <LegendLabel>{entry.name}</LegendLabel>
                    </Flex>
                    <LegendValue strong $color={entry.color}>{entry.value}</LegendValue>
                </ChartLegendItem>
            ))}
        </LegendStack>
    );

    const totalActive = runningRollouts + runningActions;

    return (
        <PageLayout>
            <PageHeader
                title={t('overview.title', 'Rollout Management')}
                description={
                    <Flex align="center" gap={12}>
                        <SubtitleText type="secondary">
                            {t('overview.subtitle', 'Deployment rollout overview and monitoring')}
                        </SubtitleText>
                        <LiveIndicator $active={totalActive > 0} $color={COLORS.rollouts}>
                            {totalActive > 0 ? `${totalActive} ${t('common:status.active', 'Active')}` : t('common:status.idle', 'Idle')}
                        </LiveIndicator>
                    </Flex>
                }
                actions={
                    <Flex align="center" gap={8}>
                        <UpdatedText type="secondary">
                            {t('common:updated', 'Updated')}: {lastUpdated}
                        </UpdatedText>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => { refetchRollouts(); refetchActions(); }}
                            loading={isLoading}
                            size="small"
                        >
                            {t('common:actions.refresh', 'Refresh')}
                        </Button>
                        {isAdmin && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsCreateModalOpen(true)}
                                size="small"
                            >
                                {t('overview.createRollout', 'Create')}
                            </Button>
                        )}
                    </Flex>
                }
            />

            <OverviewScrollContent>
                {/* Top Row: 2x2 KPI Grid + 2 Pie Charts */}
                <TopRow>
                    <KPIGridContainer>
                        {/* Total Rollouts */}
                        <OverviewStatsCard
                            $accentColor="var(--gradient-warning)"
                            $delay={1}
                            onClick={() => navigate('/rollouts/list')}
                        >
                            {isLoading ? <Skeleton.Avatar active size={40} /> : (
                                <Flex vertical align="center" gap={4}>
                                    <IconBadge $theme="rollouts">
                                        <AppstoreOutlined />
                                    </IconBadge>
                                    <BigNumber $color={COLORS.rollouts}>{totalRollouts}</BigNumber>
                                    <StatCaption type="secondary">
                                        {t('overview.totalRollouts', 'Rollouts')}
                                    </StatCaption>
                                </Flex>
                            )}
                        </OverviewStatsCard>

                        {/* Active Rollouts */}
                        <OverviewStatsCard
                            $accentColor="var(--gradient-info)"
                            $delay={2}
                            $pulse={runningRollouts > 0}
                            onClick={() => navigate('/rollouts/list?status=running')}
                        >
                            {isLoading ? <Skeleton.Avatar active size={40} /> : (
                                <Flex vertical align="center" gap={4}>
                                    <IconBadge $color="linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)">
                                        <RocketOutlined />
                                    </IconBadge>
                                    <BigNumber $color={ROLLOUT_COLORS.running}>{runningRollouts}</BigNumber>
                                    <StatCaption type="secondary">
                                        {t('actions:status.running', 'Running')}
                                    </StatCaption>
                                </Flex>
                            )}
                        </OverviewStatsCard>

                        {/* Total Actions */}
                        <OverviewStatsCard
                            $accentColor="var(--gradient-primary)"
                            $delay={3}
                            onClick={() => navigate('/actions')}
                        >
                            {isLoading ? <Skeleton.Avatar active size={40} /> : (
                                <Flex vertical align="center" gap={4}>
                                    <IconBadge $color="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)">
                                        <ThunderboltOutlined />
                                    </IconBadge>
                                    <BigNumber $color="var(--ant-color-primary)">{totalActions}</BigNumber>
                                    <StatCaption type="secondary">
                                        {t('common:nav.actions', 'Actions')}
                                    </StatCaption>
                                </Flex>
                            )}
                        </OverviewStatsCard>

                        {/* Success Rate */}
                        <OverviewStatsCard
                            $accentColor="var(--gradient-success)"
                            $delay={4}
                            onClick={() => navigate('/actions')}
                        >
                            {isLoading ? <Skeleton.Avatar active size={40} /> : (
                                <Flex vertical align="center" gap={4}>
                                    <IconBadge $color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                                        <CheckCircleOutlined />
                                    </IconBadge>
                                    <BigNumber $color={ACTION_COLORS.finished}>
                                        {successRate !== null ? `${successRate}%` : '-'}
                                    </BigNumber>
                                    <ProgressThin
                                        percent={successRate ?? 0}
                                        size="small"
                                        strokeColor={ACTION_COLORS.finished}
                                        showInfo={false}
                                    />
                                </Flex>
                            )}
                        </OverviewStatsCard>
                    </KPIGridContainer>

                    <ChartsContainer>
                        {/* Rollout Status Distribution */}
                        <OverviewChartCard
                            $theme="rollouts"
                            title={
                                <Flex align="center" gap={10}>
                                    <IconBadge $theme="rollouts">
                                        <PlayCircleOutlined />
                                    </IconBadge>
                                    <Flex vertical gap={0}>
                                        <ChartTitle>{t('overview.statusDistribution', 'Rollout Status')}</ChartTitle>
                                        <ChartSubtitle type="secondary">{totalRollouts} total</ChartSubtitle>
                                    </Flex>
                                </Flex>
                            }
                            $delay={5}
                        >
                            {isLoading ? (
                                <ChartSkeleton active size={60} shape="circle" />
                            ) : rolloutPieData.length > 0 ? (
                                <FlexFill vertical>
                                    <ResponsiveContainer width="100%" height={100}>
                                        <PieChart>
                                            <Pie data={rolloutPieData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                                {rolloutPieData.map((entry, index) => (
                                                    <Cell
                                                        key={`rollout-cell-${index}`}
                                                        fill={entry.color}
                                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {renderCustomLegend(rolloutPieData.slice(0, 4))}
                                </FlexFill>
                            ) : (
                                <CenteredFlex justify="center" align="center">
                                    <Text type="secondary">{t('overview.noRollouts', 'No rollouts')}</Text>
                                </CenteredFlex>
                            )}
                        </OverviewChartCard>

                        {/* Action Status Distribution */}
                        <OverviewChartCard
                            $theme="actions"
                            title={
                                <Flex align="center" gap={10}>
                                    <IconBadge $color="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)">
                                        <ThunderboltOutlined />
                                    </IconBadge>
                                    <Flex vertical gap={0}>
                                        <ChartTitle>{t('actions:overview.statusDistribution', 'Action Status')}</ChartTitle>
                                        <ChartSubtitle type="secondary">{totalActions} total</ChartSubtitle>
                                    </Flex>
                                </Flex>
                            }
                            $delay={6}
                        >
                            {isLoading ? (
                                <ChartSkeleton active size={60} shape="circle" />
                            ) : actionPieData.length > 0 ? (
                                <FlexFill vertical>
                                    <ResponsiveContainer width="100%" height={100}>
                                        <PieChart>
                                            <Pie data={actionPieData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                                {actionPieData.map((entry, index) => (
                                                    <Cell
                                                        key={`action-cell-${index}`}
                                                        fill={entry.color}
                                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {renderCustomLegend(actionPieData.slice(0, 4))}
                                </FlexFill>
                            ) : (
                                <CenteredFlex justify="center" align="center">
                                    <Text type="secondary">{t('actions:empty', 'No actions')}</Text>
                                </CenteredFlex>
                            )}
                        </OverviewChartCard>
                    </ChartsContainer>
                </TopRow>

                {/* Bottom Row: Active Rollouts + Active Actions */}
                <BottomRow>
                    {/* Active Rollouts List */}
                    <OverviewListCard
                        $theme="rollouts"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $theme="rollouts">
                                    <RocketOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <ChartTitle>{t('overview.activeRollouts', 'Active Rollouts')}</ChartTitle>
                                    <ChartSubtitle type="secondary">{activeRollouts.length} active</ChartSubtitle>
                                </Flex>
                            </Flex>
                        }
                        extra={
                            <Button type="link" size="small" onClick={() => navigate('/rollouts/list')}>
                                {t('overview.viewAll', 'View All')}
                            </Button>
                        }
                        $delay={7}
                    >
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 5 }} />
                        ) : activeRollouts.length > 0 ? (
                            <ActiveListContainer>
                                <AirportSlideList
                                    items={activeRollouts}
                                    itemHeight={56}
                                    visibleCount={5}
                                    fullHeight={true}
                                    renderItem={(rollout: MgmtRolloutResponseBody) => (
                                        <ActivityItem
                                            key={rollout.id}
                                            onClick={() => navigate(`/rollouts/${rollout.id}`)}
                                        >
                                            <ActivityRow align="center" gap={12}>
                                                <StatusIconWrap $status={rollout.status}>
                                                    {rollout.status === 'running' ? (
                                                        <StatusIcon $color={ROLLOUT_COLORS.running}><SyncOutlined spin /></StatusIcon>
                                                    ) : rollout.status === 'paused' ? (
                                                        <StatusIcon $color={ROLLOUT_COLORS.paused}><PauseCircleOutlined /></StatusIcon>
                                                    ) : (
                                                        <StatusIcon $color={ROLLOUT_COLORS.scheduled}><ClockCircleOutlined /></StatusIcon>
                                                    )}
                                                </StatusIconWrap>
                                                <ActivityMeta vertical gap={0}>
                                                    <Flex align="center" gap={8}>
                                                        <ActivityName strong>
                                                            {rollout.name}
                                                        </ActivityName>
                                                        <ActivityTag color={statusColorMap[rollout.status || ''] || 'default'}>
                                                            {getStatusLabel(rollout.status)}
                                                        </ActivityTag>
                                                    </Flex>
                                                    <ActivityCaption type="secondary">
                                                        {rollout.totalTargets || 0} targets
                                                    </ActivityCaption>
                                                </ActivityMeta>
                                            </ActivityRow>
                                            <Progress
                                                type="circle"
                                                percent={getRolloutProgress(rollout)}
                                                size={40}
                                                strokeColor={
                                                    rollout.status === 'running' ? ROLLOUT_COLORS.running :
                                                        rollout.status === 'paused' ? ROLLOUT_COLORS.paused :
                                                            '#cbd5e1'
                                                }
                                                strokeWidth={8}
                                            />
                                        </ActivityItem>
                                    )}
                                />
                            </ActiveListContainer>
                        ) : (
                            <EmptyState vertical justify="center" align="center" gap={12}>
                                <EmptyIcon />
                                <Text type="secondary">{t('overview.noActiveRollouts', 'No active rollouts')}</Text>
                                {isAdmin && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        {t('overview.createRollout', 'Create Rollout')}
                                    </Button>
                                )}
                            </EmptyState>
                        )}
                    </OverviewListCard>

                    {/* Active Actions List */}
                    <OverviewListCard
                        $theme="actions"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $color="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)">
                                    <ThunderboltOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <ChartTitle>{t('actions:overview.activeActions', 'Active Actions')}</ChartTitle>
                                    <ChartSubtitle type="secondary">{activeActions.length} active</ChartSubtitle>
                                </Flex>
                            </Flex>
                        }
                        extra={
                            <Button type="link" size="small" onClick={() => navigate('/actions')}>
                                {t('overview.viewAll', 'View All')}
                            </Button>
                        }
                        $delay={8}
                    >
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 5 }} />
                        ) : activeActions.length > 0 ? (
                            <ActiveListContainer>
                                <ActiveUpdatesCard
                                    items={activeActions.map((action: MgmtAction) => ({
                                        action,
                                        controllerId: getTargetId(action),
                                    }))}
                                    isLoading={false}
                                    showHistory={true}
                                    emptyText={t('actions:overview.noActiveActions', 'No active actions')}
                                />
                            </ActiveListContainer>
                        ) : (
                            <CenteredFlex justify="center" align="center">
                                <Text type="secondary">{t('actions:overview.noActiveActions', 'No active actions')}</Text>
                            </CenteredFlex>
                        )}
                    </OverviewListCard>
                </BottomRow>
            </OverviewScrollContent>
            <RolloutCreateModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(id) => {
                    setIsCreateModalOpen(false);
                    navigate(`/rollouts/${id}`);
                }}
            />
        </PageLayout>
    );
};

export default RolloutsOverview;
