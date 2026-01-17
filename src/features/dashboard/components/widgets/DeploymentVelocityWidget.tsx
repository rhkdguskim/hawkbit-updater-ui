import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Flex, Typography, Skeleton, Tag } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ChartCard, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

interface DeploymentVelocityWidgetProps {
    isLoading: boolean;
    data: {
        time: string;
        rate: number;
        count: number;
    }[];
    currentVelocity: number;
}

export const DeploymentVelocityWidget: React.FC<DeploymentVelocityWidgetProps> = ({
    isLoading,
    data,
    currentVelocity
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const getStatusTag = (velocity: number) => {
        if (velocity === 0) return <Tag>{t('velocity.status.slow')}</Tag>;
        if (velocity > 5) return <Tag color="success">{t('velocity.status.fast')}</Tag>;
        return <Tag color="processing">{t('velocity.status.normal')}</Tag>;
    };

    return (
        <ChartCard
            $theme="deployment"
            title={
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                    <Flex align="center" gap={10}>
                        <IconBadge $theme="deployment">
                            <ThunderboltOutlined />
                        </IconBadge>
                        <Flex vertical gap={0}>
                            <span style={{ fontSize: 'var(--ant-font-size)', fontWeight: 600 }}>{t('velocity.title')}</span>
                            <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{t('velocity.trend')}</Text>
                        </Flex>
                    </Flex>
                    {getStatusTag(currentVelocity)}
                </Flex>
            }
            $delay={7}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <Flex vertical style={{ height: '100%', width: '100%' }}>
                    <Flex align="baseline" gap={4} style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 24, fontWeight: 700 }}>{currentVelocity}</span>
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{t('velocity.unit')}</Text>
                    </Flex>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--ant-color-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--ant-color-primary)" stopOpacity={0} />
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
                                        background: 'rgba(255,255,255,0.9)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="var(--ant-color-primary)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRate)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Flex>
            )}
        </ChartCard>
    );
};
