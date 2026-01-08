import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard, IconBadge, ChartLegendItem } from '../DashboardStyles';

const { Text } = Typography;

interface DistributionCompletenessChartProps {
    isLoading: boolean;
    completenessData: { name: string; value: number; color: string; statusKey?: 'complete' | 'incomplete' }[];
    totalCount: number;
}

export const DistributionCompletenessChart: React.FC<DistributionCompletenessChartProps> = ({
    isLoading,
    completenessData,
    totalCount,
}) => {
    const { t } = useTranslation(['distributions', 'common']);

    return (
        <ChartCard
            $theme="deployment"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="deployment">
                        <AppstoreOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('overview.completeness', 'DS Completeness')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{totalCount} sets</Text>
                    </Flex>
                </Flex>
            }
            $delay={4}
        >
            {isLoading ? (
                <Skeleton.Avatar active size={60} shape="circle" style={{ margin: '8px auto', display: 'block' }} />
            ) : completenessData.length > 0 ? (
                <Flex gap={8} style={{ flex: 1 }} align="center">
                    <ResponsiveContainer width="45%" height={100}>
                        <PieChart>
                            <Pie data={completenessData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                {completenessData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
                        {completenessData.map(entry => (
                            <ChartLegendItem key={entry.statusKey ?? entry.name} style={{ padding: '6px 10px' }}>
                                <Flex align="center" gap={6}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, flexShrink: 0 }} />
                                    <Text style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                                        {entry.name}
                                    </Text>
                                </Flex>
                                <Text strong style={{ fontSize: 12, color: entry.color }}>{entry.value}</Text>
                            </ChartLegendItem>
                        ))}
                    </Flex>
                </Flex>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};

export default DistributionCompletenessChart;
