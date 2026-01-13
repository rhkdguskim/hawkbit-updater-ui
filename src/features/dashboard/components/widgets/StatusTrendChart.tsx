import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ReferenceLine,
} from 'recharts';
import { Flex, Typography, Skeleton, Tag, Space } from 'antd';
import {
    AreaChartOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { MgmtAction, MgmtRolloutResponseBody } from '@/api/generated/model';
import {
    WidgetContainer,
    HeaderRow,
    IconBadge,
    ChartWrapper,
    LegendContainer,
    LegendItem,
    LegendDot
} from './WidgetStyles';

const { Text, Title } = Typography;

interface HourlyData {
    hour: string;
    timestamp: number;
    success: number;
    running: number;
    error: number;
    total: number;
}

interface RolloutEvent {
    timestamp: number;
    type: 'start' | 'pause' | 'resume';
    rolloutName: string;
}

interface StatusTrendChartProps {
    isLoading: boolean;
    actions: MgmtAction[];
    rollouts?: MgmtRolloutResponseBody[];
    hours?: number;
    referenceTimeMs?: number | null;
}

const EventMarker = styled.div<{ $type: 'start' | 'pause' | 'resume' }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ $type }) =>
        $type === 'start' ? 'var(--ant-color-success)' :
            $type === 'pause' ? 'var(--ant-color-warning)' :
                'var(--ant-color-info)'
    };
    color: white;
    font-size: 10px;
`;

const COLORS = {
    success: 'var(--ant-color-success)',
    running: 'var(--ant-color-info)',
    error: 'var(--ant-color-error)',
};

export const StatusTrendChart: React.FC<StatusTrendChartProps> = ({
    isLoading,
    actions,
    rollouts = [],
    hours = 24,
    referenceTimeMs,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const chartData = useMemo<HourlyData[]>(() => {
        const now = referenceTimeMs ? dayjs(referenceTimeMs) : dayjs();
        const hoursArray: HourlyData[] = [];

        // Initialize hourly buckets
        for (let i = hours - 1; i >= 0; i--) {
            const hourStart = now.subtract(i, 'hour').startOf('hour');
            hoursArray.push({
                hour: hourStart.format('HH:00'),
                timestamp: hourStart.valueOf(),
                success: 0,
                running: 0,
                error: 0,
                total: 0,
            });
        }

        // Aggregate actions into buckets
        actions.forEach(action => {
            if (!action.createdAt) return;

            const actionTime = dayjs(action.createdAt);
            const bucketIndex = hoursArray.findIndex(bucket => {
                const bucketStart = dayjs(bucket.timestamp);
                const bucketEnd = bucketStart.add(1, 'hour');
                return actionTime.isAfter(bucketStart) && actionTime.isBefore(bucketEnd);
            });

            if (bucketIndex !== -1) {
                const status = (action.status || '').toLowerCase();
                hoursArray[bucketIndex].total++;

                if (status === 'finished') {
                    hoursArray[bucketIndex].success++;
                } else if (status === 'error' || status === 'canceled') {
                    hoursArray[bucketIndex].error++;
                } else if (status === 'running' || status === 'pending') {
                    hoursArray[bucketIndex].running++;
                }
            }
        });

        return hoursArray;
    }, [actions, hours]);

    const rolloutEvents = useMemo<RolloutEvent[]>(() => {
        const events: RolloutEvent[] = [];
        const now = referenceTimeMs ? dayjs(referenceTimeMs) : dayjs();
        const twentyFourHoursAgo = now.subtract(24, 'hour').valueOf();

        rollouts.forEach(rollout => {
            // Check for start events
            if (rollout.createdAt && rollout.createdAt > twentyFourHoursAgo) {
                events.push({
                    timestamp: rollout.createdAt,
                    type: 'start',
                    rolloutName: rollout.name || 'Unknown',
                });
            }
        });

        return events.sort((a, b) => a.timestamp - b.timestamp);
    }, [rollouts]);

    const summary = useMemo(() => {
        const totalActions = chartData.reduce((sum, d) => sum + d.total, 0);
        const totalSuccess = chartData.reduce((sum, d) => sum + d.success, 0);
        const totalError = chartData.reduce((sum, d) => sum + d.error, 0);
        const successRate = totalActions > 0 ? Math.round((totalSuccess / totalActions) * 100) : 100;

        return { totalActions, totalSuccess, totalError, successRate };
    }, [chartData]);

    const hasData = chartData.some(d => d.total > 0);

    if (isLoading) {
        return (
            <WidgetContainer>
                <Skeleton active paragraph={{ rows: 6 }} />
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer>
            <HeaderRow align="center" justify="space-between">
                <Flex align="center" gap={12}>
                    <IconBadge>
                        <AreaChartOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <Title level={5} style={{ margin: 0 }}>
                            {t('statusTrend.title', 'Status Trend (24h)')}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('statusTrend.subtitle', 'Hourly action status aggregation')}
                        </Text>
                    </Flex>
                </Flex>
                <Space>
                    <Tag color={summary.successRate >= 95 ? 'success' : summary.successRate >= 80 ? 'warning' : 'error'}>
                        {t('statusTrend.successRate', 'Success')}: {summary.successRate}%
                    </Tag>
                    <Tag color="default">{summary.totalActions} {t('statusTrend.actionsTotal', 'actions')}</Tag>
                </Space>
            </HeaderRow>

            <ChartWrapper>
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="runningGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.running} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.running} stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={COLORS.error} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="hour"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    background: 'rgba(255,255,255,0.95)',
                                }}
                                formatter={(value: number | undefined) => {
                                    if (value === undefined) return ['', ''];
                                    // Note: we can't easily get the series name here without more complex logic in Recharts Tooltip, 
                                    // but we can at least return the value safely.
                                    return [value, ''];
                                }}
                                labelFormatter={(label) => `${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="success"
                                stackId="1"
                                stroke={COLORS.success}
                                fill="url(#successGradient)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="running"
                                stackId="1"
                                stroke={COLORS.running}
                                fill="url(#runningGradient)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="error"
                                stackId="1"
                                stroke={COLORS.error}
                                fill="url(#errorGradient)"
                                strokeWidth={2}
                            />
                            {/* Rollout event markers */}
                            {rolloutEvents.map((event, index) => {
                                const eventHour = dayjs(event.timestamp).format('HH:00');
                                return (
                                    <ReferenceLine
                                        key={index}
                                        x={eventHour}
                                        stroke={event.type === 'start' ? COLORS.success : COLORS.running}
                                        strokeDasharray="3 3"
                                        label={{
                                            value: event.type === 'start' ? '▶' : '⏸',
                                            position: 'top',
                                            fill: event.type === 'start' ? COLORS.success : COLORS.running,
                                            fontSize: 14,
                                        }}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <Flex justify="center" align="center" style={{ height: '100%' }}>
                        <Text type="secondary">{t('common:messages.noData', 'No data available')}</Text>
                    </Flex>
                )}
            </ChartWrapper>

            <LegendContainer gap={24} align="center" justify="center">
                <LegendItem align="center">
                    <LegendDot $color={COLORS.success} />
                    <Text type="secondary">{t('statusTrend.success', 'Success')}</Text>
                </LegendItem>
                <LegendItem align="center">
                    <LegendDot $color={COLORS.running} />
                    <Text type="secondary">{t('statusTrend.running', 'Running')}</Text>
                </LegendItem>
                <LegendItem align="center">
                    <LegendDot $color={COLORS.error} />
                    <Text type="secondary">{t('statusTrend.error', 'Error')}</Text>
                </LegendItem>
                <LegendItem align="center" style={{ marginLeft: 16 }}>
                    <EventMarker $type="start"><PlayCircleOutlined /></EventMarker>
                    <Text type="secondary">{t('statusTrend.rolloutStart', 'Rollout Start')}</Text>
                </LegendItem>
                <LegendItem align="center">
                    <EventMarker $type="pause"><PauseCircleOutlined /></EventMarker>
                    <Text type="secondary">{t('statusTrend.rolloutPause', 'Rollout Pause')}</Text>
                </LegendItem>
            </LegendContainer>
        </WidgetContainer>
    );
};

export default StatusTrendChart;
