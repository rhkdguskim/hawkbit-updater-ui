import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Typography, Flex, Empty, Spin } from 'antd';
import { ChartCard } from '../DashboardStyles';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface DistributionCompletenessChartProps {
    isLoading: boolean;
    data: { name: string; value: number; color: string }[];
}

export const DistributionCompletenessChart: React.FC<DistributionCompletenessChartProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common', 'distributions']);

    const renderCustomLegend = (props: any) => {
        const { payload } = props;
        return (
            <Flex vertical gap={4} style={{ marginTop: 8 }}>
                {payload.map((entry: any, index: number) => (
                    <Flex key={`item-${index}`} align="center" justify="space-between" gap={8}>
                        <Flex align="center" gap={6}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: entry.color }} />
                            <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{entry.value}</Text>
                        </Flex>
                        <Text strong style={{ fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)' }}>
                            {data[index].value}
                        </Text>
                    </Flex>
                ))}
            </Flex>
        );
    };

    return (
        <ChartCard title={t('chart.completeness', 'Distribution Completeness')} style={{ height: '100%' }}>
            {isLoading ? (
                <Flex align="center" justify="center" style={{ height: 180 }}>
                    <Spin />
                </Flex>
            ) : data.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <div style={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend content={renderCustomLegend} verticalAlign="bottom" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </ChartCard>
    );
};
