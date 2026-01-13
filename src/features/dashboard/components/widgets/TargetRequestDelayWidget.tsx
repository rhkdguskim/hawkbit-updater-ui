import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, List } from 'antd';
import { FieldTimeOutlined, WarningOutlined } from '@ant-design/icons';
import { ChartCard, IconBadge } from '../DashboardStyles';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Text } = Typography;

interface TargetRequestDelayWidgetProps {
    isLoading: boolean;
    averageDelay: number;
    topDelayedTargets: Array<{
        name: string;
        delay: number;
        lastRequestAt: number;
    }>;
}

export const TargetRequestDelayWidget: React.FC<TargetRequestDelayWidgetProps> = ({
    isLoading,
    averageDelay,
    topDelayedTargets,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        const d = dayjs.duration(ms);
        if (ms >= 24 * 60 * 60 * 1000) return `${Math.floor(d.asDays())}d ${d.hours()}h`;
        if (ms >= 60 * 60 * 1000) return `${d.hours()}h ${d.minutes()}m`;
        if (ms >= 60 * 1000) return `${d.minutes()}m ${d.seconds()}s`;
        return `${d.seconds()}s`;
    };

    const avgColor = useMemo(() => {
        // Simple thresholds: > 1h = warning, > 24h = error
        if (averageDelay > 24 * 60 * 60 * 1000) return 'var(--ant-color-error)';
        if (averageDelay > 60 * 60 * 1000) return 'var(--ant-color-warning)';
        return 'var(--ant-color-success)';
    }, [averageDelay]);

    return (
        <ChartCard
            $theme="connectivity"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="connectivity">
                        <FieldTimeOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('delayWidget.title', 'Target Request Delay')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{t('delayWidget.subtitle', 'Time since last poll')}</Text>
                    </Flex>
                </Flex>
            }
            $delay={4}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <Flex vertical gap={16} style={{ flex: 1 }}>
                    <Flex vertical gap={4} align="center" style={{ padding: '12px 0', background: 'var(--ant-color-fill-quaternary)', borderRadius: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{t('delayWidget.average', 'Average Delay')}</Text>
                        <Text strong style={{ fontSize: 24, color: avgColor }}>
                            {formatDuration(averageDelay)}
                        </Text>
                    </Flex>

                    <Flex vertical gap={8} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        <Flex justify="space-between" align="center">
                            <Text strong style={{ fontSize: 12 }}>{t('delayWidget.longestDelays', 'Longest Delays')}</Text>
                            <Text type="secondary" style={{ fontSize: 10 }}>Top 5</Text>
                        </Flex>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {topDelayedTargets.length > 0 ? (
                                <List
                                    size="small"
                                    split={false}
                                    dataSource={topDelayedTargets}
                                    renderItem={(item) => (
                                        <List.Item style={{ padding: '6px 0' }}>
                                            <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                                                <Flex align="center" gap={8}>
                                                    {item.delay > 24 * 60 * 60 * 1000 && <WarningOutlined style={{ fontSize: 12, color: 'var(--ant-color-error)' }} />}
                                                    <Text ellipsis style={{ maxWidth: 120, fontSize: 12 }}>{item.name}</Text>
                                                </Flex>
                                                <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>
                                                    {formatDuration(item.delay)}
                                                </Text>
                                            </Flex>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Flex justify="center" align="center" style={{ height: '100%' }}>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t('common:messages.noData')}</Text>
                                </Flex>
                            )}
                        </div>
                    </Flex>
                </Flex>
            )}
        </ChartCard>
    );
};
