import React, { useMemo, useState, useCallback } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ReferenceLine,
    Legend,
} from 'recharts';
import { Flex, Typography, Skeleton, Segmented, Tooltip, Space } from 'antd';
import {
    AreaChartOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import type { MgmtAction, MgmtRolloutResponseBody } from '@/api/generated/model';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { DASHBOARD_COLORS, TYPOGRAPHY, SPACING, SHADOWS, TRANSITIONS, CHART_CONFIG } from '@/theme/dashboard-design-system';

const { Text } = Typography;

type TimeRange = '1h' | '6h' | '24h' | '7d';

interface HourlyData {
    hour: string;
    timestamp: number;
    success: number;
    running: number;
    error: number;
    total: number;
    successRate: number;
}

interface RolloutEvent {
    timestamp: number;
    type: 'start' | 'pause' | 'resume';
    rolloutName: string;
}

interface EnterpriseStatusTrendChartProps {
    isLoading: boolean;
    actions: MgmtAction[];
    rollouts?: MgmtRolloutResponseBody[];
    referenceTimeMs?: number | null;
}

const ChartContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: 16px;
    padding: ${SPACING[5]};
    border: 1px solid var(--ant-color-border);
    box-shadow: ${SHADOWS.base};
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: ${SPACING[4]};
    transition: ${TRANSITIONS.default};

    &:hover {
        box-shadow: ${SHADOWS.md};
        border-color: var(--ant-color-primary-border);
    }
`;

const ChartHeader = styled(Flex)`
    width: 100%;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${SPACING[4]};
    flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${SPACING[3]};
`;

const IconBadge = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    border: 1px solid rgba(99, 102, 241, 0.2);

    svg {
        font-size: ${TYPOGRAPHY.fontSize['2xl']};
        color: ${DASHBOARD_COLORS.status.info};
    }
`;

const TitleSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[1]};
`;

const ChartTitle = styled.span`
    font-size: ${TYPOGRAPHY.fontSize.lg};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    color: var(--ant-color-text);
`;

const ChartSubtitle = styled(Text)`
    font-size: ${TYPOGRAPHY.fontSize.sm};
    color: var(--ant-color-text-secondary);
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${SPACING[3]};
`;

const TimeRangeSelector = styled(Segmented)`
    && {
        background: var(--ant-color-bg-layout);
        padding: ${SPACING[1]};
        border-radius: 8px;

        .ant-segmented-item {
            border-radius: 6px;
            font-weight: ${TYPOGRAPHY.fontWeight.medium};
            min-width: 50px;
            padding: ${SPACING[1]} ${SPACING[3]};
        }

        .ant-segmented-item-selected {
            background: var(--ant-color-primary);
            color: white;
            box-shadow: ${SHADOWS.sm};
        }
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${SPACING[3]};
    padding: ${SPACING[3]};
    background: var(--ant-color-bg-layout);
    border-radius: 12px;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[1]};
`;

const StatLabel = styled(Text)`
    font-size: ${TYPOGRAPHY.fontSize.xs};
    color: var(--ant-color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const StatValue = styled.span<{ $color?: string }>`
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    font-size: ${TYPOGRAPHY.fontSize.xl};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
    color: ${props => props.$color || 'var(--ant-color-text)'};
    line-height: 1.2;
`;

const ChartWrapper = styled.div`
    flex: 1;
    min-height: 300px;
    width: 100%;
    position: relative;
`;

const CustomTooltipContainer = styled.div`
    background: var(--ant-color-bg-elevated);
    border: 1px solid var(--ant-color-border);
    border-radius: 8px;
    padding: ${SPACING[3]};
    box-shadow: ${SHADOWS.lg};
`;

const TooltipTitle = styled.div`
    font-size: ${TYPOGRAPHY.fontSize.sm};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    margin-bottom: ${SPACING[2]};
    color: var(--ant-color-text);
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${SPACING[4]};
    margin: ${SPACING[1]} 0;
    font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const TooltipLabel = styled.span<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: ${SPACING[2]};
    color: var(--ant-color-text-secondary);

    &::before {
        content: '';
        width: 12px;
        height: 12px;
        border-radius: 2px;
        background: ${props => props.$color};
    }
`;

const TooltipValue = styled.span`
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    color: var(--ant-color-text)    ;
`;

export const EnterpriseStatusTrendChart = React.memo<EnterpriseStatusTrendChartProps>(({
    isLoading,
    actions,
    rollouts = [],
    referenceTimeMs,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');

    const getHoursFromRange = (range: TimeRange): number => {
        switch (range) {
            case '1h': return 1;
            case '6h': return 6;
            case '24h': return 24;
            case '7d': return 168;
            default: return 24;
        }
    };

    const hours = getHoursFromRange(timeRange);

    const { chartData, stats } = useMemo(() => {
        const now = referenceTimeMs ? dayjs(referenceTimeMs) : dayjs();
        const hoursArray: HourlyData[] = [];

        for (let i = hours - 1; i >= 0; i--) {
            const hourStart = now.subtract(i, 'hour').startOf('hour');
            hoursArray.push({
                hour: hourStart.format(hours > 24 ? 'MM/DD HH:00' : 'HH:00'),
                timestamp: hourStart.valueOf(),
                success: 0,
                running: 0,
                error: 0,
                total: 0,
                successRate: 0,
            });
        }

        actions.forEach(action => {
            const actionTime = action.lastModifiedAt || action.createdAt;
            if (!actionTime) return;

            const actionDayjs = dayjs(actionTime);
            const hourIndex = hoursArray.findIndex(h => {
                const hourEnd = dayjs(h.timestamp).add(1, 'hour');
                return actionDayjs.isSameOrAfter(h.timestamp) && actionDayjs.isBefore(hourEnd);
            });

            if (hourIndex >= 0) {
                const status = action.status?.toLowerCase() || '';
                hoursArray[hourIndex].total += 1;

                if (status === 'finished') {
                    hoursArray[hourIndex].success += 1;
                } else if (['running', 'download', 'downloaded', 'retrieved', 'warning'].includes(status)) {
                    hoursArray[hourIndex].running += 1;
                } else if (['error', 'canceled'].includes(status)) {
                    hoursArray[hourIndex].error += 1;
                }
            }
        });

        hoursArray.forEach(hour => {
            if (hour.total > 0) {
                hour.successRate = (hour.success / hour.total) * 100;
            }
        });

        const totalSuccess = hoursArray.reduce((sum, h) => sum + h.success, 0);
        const totalRunning = hoursArray.reduce((sum, h) => sum + h.running, 0);
        const totalError = hoursArray.reduce((sum, h) => sum + h.error, 0);
        const totalActions = totalSuccess + totalRunning + totalError;
        const avgSuccessRate = totalActions > 0 ? (totalSuccess / totalActions) * 100 : 0;

        return {
            chartData: hoursArray,
            stats: {
                totalActions,
                totalSuccess,
                totalRunning,
                totalError,
                avgSuccessRate,
            },
        };
    }, [actions, hours, referenceTimeMs]);

    const CustomTooltip = useCallback(({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        const data = payload[0].payload;

        return (
            <CustomTooltipContainer>
                <TooltipTitle>{label}</TooltipTitle>
                <TooltipRow>
                    <TooltipLabel $color={DASHBOARD_COLORS.status.success}>Success</TooltipLabel>
                    <TooltipValue>{data.success}</TooltipValue>
                </TooltipRow>
                <TooltipRow>
                    <TooltipLabel $color={DASHBOARD_COLORS.status.info}>Running</TooltipLabel>
                    <TooltipValue>{data.running}</TooltipValue>
                </TooltipRow>
                <TooltipRow>
                    <TooltipLabel $color={DASHBOARD_COLORS.status.critical}>Error</TooltipLabel>
                    <TooltipValue>{data.error}</TooltipValue>
                </TooltipRow>
                <TooltipRow style={{ borderTop: '1px solid var(--ant-color-border)', marginTop: SPACING[2], paddingTop: SPACING[2] }}>
                    <Text type="secondary">Success Rate</Text>
                    <TooltipValue>{data.successRate.toFixed(1)}%</TooltipValue>
                </TooltipRow>
            </CustomTooltipContainer>
        );
    }, []);

    if (isLoading) {
        return (
            <ChartContainer>
                <Skeleton active paragraph={{ rows: 6 }} />
            </ChartContainer>
        );
    }

    return (
        <ChartContainer>
            <ChartHeader>
                <HeaderLeft>
                    <IconBadge>
                        <AreaChartOutlined />
                    </IconBadge>
                    <TitleSection>
                        <ChartTitle>{t('statusTrend.title', 'Action Status Trend')}</ChartTitle>
                        <ChartSubtitle>
                            {t('statusTrend.subtitle', 'Hourly action status distribution')}
                        </ChartSubtitle>
                    </TitleSection>
                </HeaderLeft>
                <HeaderRight>
                    <TimeRangeSelector
                        value={timeRange}
                        onChange={(value) => setTimeRange(value as TimeRange)}
                        options={[
                            { label: '1H', value: '1h' },
                            { label: '6H', value: '6h' },
                            { label: '24H', value: '24h' },
                            { label: '7D', value: '7d' },
                        ]}
                    />
                </HeaderRight>
            </ChartHeader>

            <StatsGrid>
                <StatItem>
                    <StatLabel>{t('statusTrend.totalActions')}</StatLabel>
                    <StatValue>{stats.totalActions.toLocaleString()}</StatValue>
                </StatItem>
                <StatItem>
                    <StatLabel>Success</StatLabel>
                    <StatValue $color={DASHBOARD_COLORS.status.success}>
                        {stats.totalSuccess.toLocaleString()}
                    </StatValue>
                </StatItem>
                <StatItem>
                    <StatLabel>Running</StatLabel>
                    <StatValue $color={DASHBOARD_COLORS.status.info}>
                        {stats.totalRunning.toLocaleString()}
                    </StatValue>
                </StatItem>
                <StatItem>
                    <StatLabel>Error</StatLabel>
                    <StatValue $color={DASHBOARD_COLORS.status.critical}>
                        {stats.totalError.toLocaleString()}
                    </StatValue>
                </StatItem>
                <StatItem>
                    <StatLabel>
                        {t('statusTrend.avgSuccessRate')}
                        <Tooltip title={t('statusTrend.avgSuccessRateTooltip')}>
                            <InfoCircleOutlined style={{ fontSize: '10px', marginLeft: '4px' }} />
                        </Tooltip>
                    </StatLabel>
                    <StatValue $color={
                        stats.avgSuccessRate >= 90 ? DASHBOARD_COLORS.status.success :
                        stats.avgSuccessRate >= 70 ? DASHBOARD_COLORS.status.warning :
                        DASHBOARD_COLORS.status.critical
                    }>
                        {stats.avgSuccessRate.toFixed(1)}%
                    </StatValue>
                </StatItem>
            </StatsGrid>

            <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={DASHBOARD_COLORS.status.success} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={DASHBOARD_COLORS.status.success} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="runningGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={DASHBOARD_COLORS.status.info} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={DASHBOARD_COLORS.status.info} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={DASHBOARD_COLORS.status.critical} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={DASHBOARD_COLORS.status.critical} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={CHART_CONFIG.grid.stroke}
                            opacity={CHART_CONFIG.grid.opacity}
                        />
                        <XAxis 
                            dataKey="hour"
                            stroke={CHART_CONFIG.axis.stroke}
                            style={{ fontSize: CHART_CONFIG.axis.fontSize }}
                            tick={{ fill: 'var(--ant-color-text-secondary)' }}
                        />
                        <YAxis 
                            stroke={CHART_CONFIG.axis.stroke}
                            style={{ fontSize: CHART_CONFIG.axis.fontSize }}
                            tick={{ fill: 'var(--ant-color-text-secondary)' }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend 
                            wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: TYPOGRAPHY.fontSize.sm,
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="success"
                            stackId="1"
                            stroke={DASHBOARD_COLORS.status.success}
                            strokeWidth={2}
                            fill="url(#successGradient)"
                            name="Success"
                            animationDuration={CHART_CONFIG.animation.duration}
                            animationEasing={CHART_CONFIG.animation.easing}
                        />
                        <Area
                            type="monotone"
                            dataKey="running"
                            stackId="1"
                            stroke={DASHBOARD_COLORS.status.info}
                            strokeWidth={2}
                            fill="url(#runningGradient)"
                            name="Running"
                            animationDuration={CHART_CONFIG.animation.duration}
                            animationEasing={CHART_CONFIG.animation.easing}
                        />
                        <Area
                            type="monotone"
                            dataKey="error"
                            stackId="1"
                            stroke={DASHBOARD_COLORS.status.critical}
                            strokeWidth={2}
                            fill="url(#errorGradient)"
                            name="Error"
                            animationDuration={CHART_CONFIG.animation.duration}
                            animationEasing={CHART_CONFIG.animation.easing}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartWrapper>
        </ChartContainer>
    );
});

export default EnterpriseStatusTrendChart;
