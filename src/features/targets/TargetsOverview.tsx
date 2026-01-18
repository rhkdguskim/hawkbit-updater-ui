import React, { useMemo } from 'react';
import { Typography, Button, Flex, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ReloadOutlined,
    SyncOutlined,
    ApiOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    AppstoreOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isTargetOnline } from '@/entities';

import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetActions } from '@/api/generated/actions/actions';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import DeviceCardGrid from '@/features/dashboard/components/DeviceCardGrid';
import { PageLayout, PageHeader } from '@/components/patterns';
import {
    OverviewScrollContent,
    TopRow,
    BottomRow,
    KPIGridContainer,
    ChartsContainer,
    OverviewStatsCard,
    OverviewChartCard,
    IconBadge,
    BigNumber,
    LiveIndicator,
    ChartLegendItem,
    COLORS,
} from '@/components/shared/OverviewStyles';
import styled from 'styled-components';

dayjs.extend(relativeTime);

const { Text } = Typography;

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

const StatCaption = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        text-align: center;
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

const FullWidthBottomRow = styled(BottomRow)`
    display: block;
`;

interface TargetsOverviewProps {
    standalone?: boolean;
}

const TargetsOverview: React.FC<TargetsOverviewProps> = ({ standalone = true }) => {
    const { t } = useTranslation('targets');
    const navigate = useNavigate();

    const { data: allTargets, isLoading: targetsLoading, refetch: refetchTargets, dataUpdatedAt } = useGetTargets(
        { limit: 500 },
        {
            query: {
                staleTime: 10000,
                refetchInterval: 10000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        }
    );
    const { data: actionsData, isLoading: actionsLoading, refetch: refetchActions } = useGetActions(
        { limit: 100 },
        {
            query: {
                staleTime: 10000,
                refetchInterval: 10000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        }
    );
    const { data: targetTypesData } = useGetTargetTypes(
        { limit: 100 },
        { query: { staleTime: 30000 } }
    );

    const targets = useMemo(() => allTargets?.content || [], [allTargets?.content]);
    const actions = useMemo(() => actionsData?.content || [], [actionsData?.content]);
    const totalDevices = allTargets?.total ?? 0;
    const gridCols = 5;
    const gridRows = 4;
    const gridTargetLimit = gridCols * gridRows * 3;

    const gridTargets = useMemo(() => {
        if (!targets.length) return [];
        // Keep the device grid light to avoid rendering hundreds of cards on each poll.
        return [...targets]
            .sort((a, b) => (b.pollStatus?.lastRequestAt || 0) - (a.pollStatus?.lastRequestAt || 0))
            .slice(0, gridTargetLimit);
    }, [targets, gridTargetLimit]);
    const lastUpdated = dataUpdatedAt ? dayjs(dataUpdatedAt).fromNow() : '-';
    const isLoading = targetsLoading || actionsLoading;

    // Build target type name to color map
    const targetTypeColorMap = useMemo(() => {
        const map = new Map<string, string>();
        targetTypesData?.content?.forEach(tt => {
            if (tt.name && tt.colour) {
                map.set(tt.name, tt.colour);
            }
        });
        return map;
    }, [targetTypesData]);
    const refetch = () => { refetchTargets(); refetchActions(); };

    // Offline check
    // Removed client-side overdue check to trust server status
    // const now = dataUpdatedAt || 0;

    // --- Update Status ---
    const inSyncCount = targets.filter(t => t.updateStatus === 'in_sync').length;
    const pendingCount = targets.filter(t => t.updateStatus === 'pending').length;
    const errorCount = targets.filter(t => t.updateStatus === 'error').length;
    const unknownCount = targets.filter(t => !t.updateStatus || t.updateStatus === 'unknown' || t.updateStatus === 'registered').length;

    // --- Connectivity Status ---
    const onlineCount = targets.filter(t => isTargetOnline(t)).length;
    const offlineCount = targets.filter(t =>
        t.pollStatus?.lastRequestAt !== undefined &&
        !isTargetOnline(t)
    ).length;
    const neverConnectedCount = targets.filter(t =>
        !t.pollStatus || t.pollStatus.lastRequestAt === undefined
    ).length;

    const onlinePercent = totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 100) : 0;

    // Pie Data for Connectivity
    const connectivityPieData = [
        { name: t('status.online', 'Online'), value: onlineCount, color: COLORS.online },
        { name: t('status.offline', 'Offline'), value: offlineCount, color: COLORS.offline },
        { name: t('status.neverConnected', 'Never Connected'), value: neverConnectedCount, color: COLORS.unknown },
    ].filter(d => d.value > 0);

    // Pie Data for Update Status
    const updateStatusPieData = [
        { name: t('status.inSync', 'In Sync'), value: inSyncCount, color: COLORS.inSync },
        { name: t('status.pending', 'Pending'), value: pendingCount, color: COLORS.pending },
        { name: t('status.error', 'Error'), value: errorCount, color: COLORS.error },
        { name: t('status.unknown', 'Unknown'), value: unknownCount, color: COLORS.unknown },
    ].filter(d => d.value > 0);

    // Pie Data for Target Types
    const targetTypePieData = useMemo(() => {
        const typeCounts = new Map<string, { count: number; color: string }>();
        targets.forEach(target => {
            const typeName = target.targetTypeName || t('status.unknown', 'Unknown');
            const existing = typeCounts.get(typeName);
            const typeColor = targetTypeColorMap.get(target.targetTypeName || '') || COLORS.unknown;
            if (existing) {
                existing.count++;
            } else {
                typeCounts.set(typeName, { count: 1, color: typeColor });
            }
        });
        return Array.from(typeCounts.entries()).map(([name, { count, color }]) => ({
            name,
            value: count,
            color,
        }));
    }, [targets, targetTypeColorMap, t]);



    // Custom Legend Renderer
    const renderCustomLegend = (data: { name: string; value: number; color: string }[]) => (
        <LegendStack vertical gap={4}>
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

    const content = (
        <OverviewScrollContent>
            {/* Top Row: KPI Cards + 3 Pie Charts */}
            <TopRow>
                <KPIGridContainer>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)"
                        $delay={1}
                        onClick={() => navigate('/targets/list')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)">
                                    <AppstoreOutlined />
                                </IconBadge>
                                <BigNumber $color="var(--ant-color-primary)">{totalDevices}</BigNumber>
                                <StatCaption type="secondary">
                                    {t('overview.totalDevices', 'Total Devices')}
                                </StatCaption>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)"
                        $delay={2}
                        onClick={() => navigate('/targets/list')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)">
                                    <CheckCircleOutlined />
                                </IconBadge>
                                <BigNumber $color={COLORS.inSync}>{inSyncCount}</BigNumber>
                                <StatCaption type="secondary">
                                    {t('status.inSync', 'In Sync')}
                                </StatCaption>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, var(--ant-color-info) 0%, var(--ant-color-info-active) 100%)"
                        $delay={3}
                        $pulse={pendingCount > 0}
                        onClick={() => navigate('/targets/list')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, var(--ant-color-info) 0%, var(--ant-color-info-active) 100%)">
                                    <ClockCircleOutlined />
                                </IconBadge>
                                <BigNumber $color={COLORS.pending}>{pendingCount}</BigNumber>
                                <StatCaption type="secondary">
                                    {t('status.pending', 'Pending')}
                                </StatCaption>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, var(--ant-color-error) 0%, var(--ant-color-error-active) 100%)"
                        $delay={4}
                        $pulse={errorCount > 0}
                        onClick={() => navigate('/targets/list')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, var(--ant-color-error) 0%, var(--ant-color-error-active) 100%)">
                                    <ExclamationCircleOutlined />
                                </IconBadge>
                                <BigNumber $color={errorCount > 0 ? COLORS.error : 'var(--ant-color-text-tertiary)'}>{errorCount}</BigNumber>
                                <StatCaption type="secondary">
                                    {t('status.error', 'Error')}
                                </StatCaption>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                </KPIGridContainer>

                <ChartsContainer>
                    <OverviewChartCard
                        $theme="targets"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $theme="targets">
                                    <ApiOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <ChartTitle>{t('overview.connectivityStatus')}</ChartTitle>
                                    <ChartSubtitle type="secondary">{t('overview.percentOnline', { percent: onlinePercent })}</ChartSubtitle>
                                </Flex>
                            </Flex>
                        }
                        $delay={5}
                    >
                        {isLoading ? (
                            <ChartSkeleton active size={60} shape="circle" />
                        ) : connectivityPieData.length > 0 ? (
                            <FlexFill vertical>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={connectivityPieData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {connectivityPieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {renderCustomLegend(connectivityPieData)}
                            </FlexFill>
                        ) : (
                            <CenteredFlex justify="center" align="center">
                                <Text type="secondary">{t('common:messages.noData')}</Text>
                            </CenteredFlex>
                        )}
                    </OverviewChartCard>

                    <OverviewChartCard
                        $theme="targets"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
                                    <TagsOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <ChartTitle>{t('overview.targetTypeDistribution')}</ChartTitle>
                                    <ChartSubtitle type="secondary">{t('overview.typesCount', { count: targetTypePieData.length })}</ChartSubtitle>
                                </Flex>
                            </Flex>
                        }
                        $delay={6}
                    >
                        {isLoading ? (
                            <ChartSkeleton active size={60} shape="circle" />
                        ) : targetTypePieData.length > 0 ? (
                            <FlexFill vertical>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={targetTypePieData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {targetTypePieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {renderCustomLegend(targetTypePieData)}
                            </FlexFill>
                        ) : (
                            <CenteredFlex justify="center" align="center">
                                <Text type="secondary">{t('common:messages.noData')}</Text>
                            </CenteredFlex>
                        )}
                    </OverviewChartCard>

                    <OverviewChartCard
                        $theme="targets"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $color="linear-gradient(135deg, var(--ant-color-primary) 0%, #2563eb 100%)">
                                    <SyncOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <ChartTitle>{t('overview.updateStatusDistribution')}</ChartTitle>
                                    <ChartSubtitle type="secondary">{t('overview.devicesCount', { count: targets.length })}</ChartSubtitle>
                                </Flex>
                            </Flex>
                        }
                        $delay={6}
                    >
                        {isLoading ? (
                            <ChartSkeleton active size={60} shape="circle" />
                        ) : updateStatusPieData.length > 0 ? (
                            <FlexFill vertical>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={updateStatusPieData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {updateStatusPieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {renderCustomLegend(updateStatusPieData)}
                            </FlexFill>
                        ) : (
                            <CenteredFlex justify="center" align="center">
                                <Text type="secondary">{t('common:messages.noData')}</Text>
                            </CenteredFlex>
                        )}
                    </OverviewChartCard>
                </ChartsContainer>
            </TopRow>

            {/* Bottom Row: Device Grid (Full Width) */}
            <FullWidthBottomRow>
                <DeviceCardGrid
                    targets={gridTargets}
                    actions={actions}
                    loading={isLoading}
                    title={t('overview.deviceGrid', 'Device Status Grid')}
                    delay={7}
                    cols={gridCols}
                    rows={gridRows}
                    gap={8}
                    rowHeight={90}
                    targetTypeColorMap={targetTypeColorMap}
                />
            </FullWidthBottomRow>
        </OverviewScrollContent>
    );

    if (!standalone) {
        return content;
    }

    return (
        <PageLayout fullHeight={true}>
            <PageHeader
                title={t('overview.title', 'Device Monitoring')}
                description={
                    <Flex align="center" gap={12}>
                        <SubtitleText type="secondary">
                            {t('overview.subtitle', 'Real-time device status overview')}
                        </SubtitleText>
                        <LiveIndicator $active={onlineCount > 0} $color={COLORS.targets}>
                            {onlineCount > 0 ? t('common:status.live', 'Live') : t('common:status.idle', 'Idle')}
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
                            onClick={() => refetch()}
                            loading={isLoading}
                            size="small"
                        >
                            {t('actions.refresh')}
                        </Button>
                    </Flex>
                }
            />
            {content}
        </PageLayout>
    );
};

export default TargetsOverview;
