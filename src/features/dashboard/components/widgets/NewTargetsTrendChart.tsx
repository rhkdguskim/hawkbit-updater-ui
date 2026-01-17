import React from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

interface NewTargetsTrendChartProps {
    isLoading: boolean;
    data: { time: string; count: number }[];
}

export const NewTargetsTrendChart: React.FC<NewTargetsTrendChartProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);

    return (
        <ChartCard
            $theme="targets"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="targets">
                        <UserAddOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 'var(--ant-font-size)', fontWeight: 600 }}>{t('chart.newTargetsTrend', 'New Targets Trend')}</span>
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{t('chart.last24h', 'Last 24h')}</Text>
                    </Flex>
                </Flex>
            }
            $delay={12}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTargets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--ant-color-success)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--ant-color-success)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 'var(--ant-font-size-sm)', fill: 'var(--ant-color-text-description)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 'var(--ant-font-size-sm)', fill: 'var(--ant-color-text-description)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                background: 'rgba(255,255,255,0.95)'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="var(--ant-color-success)"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTargets)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </ChartCard>
    );
};

export default NewTargetsTrendChart;
