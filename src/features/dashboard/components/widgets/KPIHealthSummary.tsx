import React from 'react';
import { Flex, Skeleton, Typography, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { HeartOutlined } from '@ant-design/icons';
import { ChartCard, IconBadge, ProgressBar } from '../DashboardStyles';

const { Text } = Typography;

interface KPIHealthSummaryProps {
    isLoading: boolean;
    onlineRate: number | null;
    deploymentRate: number | null;
    errorRate: number | null;
    pendingCount: number;
    runningRolloutCount: number;
}

export const KPIHealthSummary: React.FC<KPIHealthSummaryProps> = ({
    isLoading,
    onlineRate,
    deploymentRate,
    errorRate,
    pendingCount,
    runningRolloutCount,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const renderRateRow = (label: string, value: number | null, color: string) => (
        <Flex vertical gap={6}>
            <Flex justify="space-between" align="center">
                <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
                <Text strong style={{ fontSize: 13, color }}>{value !== null ? `${value.toFixed(1)}%` : '-'}</Text>
            </Flex>
            <ProgressBar $progress={value ?? 0} $color={color} />
        </Flex>
    );

    return (
        <ChartCard
            $theme="connectivity"
            title={
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                    <Flex align="center" gap={10}>
                        <IconBadge $theme="connectivity">
                            <HeartOutlined />
                        </IconBadge>
                        <Flex vertical gap={0}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{t('snapshot.title', 'System Snapshot')}</span>
                            <Text type="secondary" style={{ fontSize: 11 }}>{t('snapshot.subtitle', 'Key health signals')}</Text>
                        </Flex>
                    </Flex>
                    <Tag color={pendingCount > 0 ? 'warning' : 'success'}>
                        {pendingCount > 0 ? t('snapshot.attention', 'Needs attention') : t('snapshot.stable', 'Stable')}
                    </Tag>
                </Flex>
            }
            $delay={9}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <Flex vertical gap={12} style={{ flex: 1 }}>
                    {renderRateRow(t('snapshot.onlineRate', 'Online rate'), onlineRate, 'var(--ant-color-success)')}
                    {renderRateRow(t('snapshot.deploymentRate', 'Deployment rate'), deploymentRate, 'var(--ant-color-primary)')}
                    {renderRateRow(t('snapshot.errorRate', 'Action error rate'), errorRate, 'var(--ant-color-error)')}
                    <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {t('snapshot.pendingActions', 'Pending actions')}
                        </Text>
                        <Text strong style={{ fontSize: 12 }}>{pendingCount}</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {t('snapshot.activeRollouts', 'Active rollouts')}
                        </Text>
                        <Text strong style={{ fontSize: 12 }}>{runningRolloutCount}</Text>
                    </Flex>
                </Flex>
            )}
        </ChartCard>
    );
};

export default KPIHealthSummary;
