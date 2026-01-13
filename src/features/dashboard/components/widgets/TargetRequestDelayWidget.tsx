import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, List } from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { ChartCard, IconBadge } from '../DashboardStyles';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Text } = Typography;

const DelayItem = styled.div<{ $color: string }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 6px 10px;
    background: var(--ant-color-fill-quaternary);
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
    border-left: 2px solid ${props => props.$color};

    &:hover {
        background: var(--ant-color-fill-tertiary);
        transform: translateX(2px);
    }
`;

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
        if (ms < 1000) return t('common:duration.ms', { count: ms });
        const d = dayjs.duration(ms);
        const days = Math.floor(d.asDays());
        const hours = d.hours();
        const minutes = d.minutes();
        const seconds = d.seconds();

        if (days > 0) return `${t('common:duration.days', { count: days })} ${t('common:duration.hours', { count: hours })}`;
        if (hours > 0) return `${t('common:duration.hours', { count: hours })} ${t('common:duration.minutes', { count: minutes })}`;
        if (minutes > 0) return `${t('common:duration.minutes', { count: minutes })} ${t('common:duration.seconds', { count: seconds })}`;
        return t('common:duration.seconds', { count: seconds });
    };

    const avgColor = useMemo(() => {
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
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{t('delayWidget.title', 'Target Request Delay')}</span>
                        <Text type="secondary" style={{ fontSize: 10 }}>{t('delayWidget.subtitle', 'Time since last poll')}</Text>
                    </Flex>
                </Flex>
            }
            $delay={4}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <Flex vertical gap={12} style={{ flex: 1 }}>
                    <Flex vertical gap={2} align="center" style={{ padding: '8px 0', background: 'var(--ant-color-fill-quaternary)', borderRadius: 10 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>{t('delayWidget.average', 'Average Delay')}</Text>
                        <Text strong style={{ fontSize: 20, color: avgColor, fontFamily: 'var(--font-mono)' }}>
                            {formatDuration(averageDelay)}
                        </Text>
                    </Flex>

                    <Flex vertical gap={6} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        <Flex justify="space-between" align="center">
                            <Text strong style={{ fontSize: 11 }}>{t('delayWidget.longestDelays', 'Longest Delays')}</Text>
                            <Text type="secondary" style={{ fontSize: 9 }}>Top 5</Text>
                        </Flex>

                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
                            {topDelayedTargets.length > 0 ? (
                                <List
                                    size="small"
                                    split={false}
                                    dataSource={topDelayedTargets}
                                    renderItem={(item) => {
                                        const isHighDelay = item.delay > 24 * 60 * 60 * 1000;
                                        const isMediumDelay = item.delay > 60 * 60 * 1000;
                                        const delayColor = isHighDelay ? 'var(--ant-color-error)' : isMediumDelay ? 'var(--ant-color-warning)' : 'var(--ant-color-success)';

                                        return (
                                            <List.Item style={{ padding: '2px 0', border: 'none' }}>
                                                <DelayItem $color={delayColor}>
                                                    <Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            width: 5,
                                                            height: 5,
                                                            borderRadius: '50%',
                                                            background: delayColor,
                                                            flexShrink: 0
                                                        }} />
                                                        <Text strong ellipsis style={{ fontSize: 12, flex: 1, fontFamily: 'var(--font-mono)' }}>
                                                            {item.name}
                                                        </Text>
                                                    </Flex>
                                                    <Flex align="center" gap={8}>
                                                        <Text style={{
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            color: delayColor,
                                                            fontFamily: 'var(--font-mono)'
                                                        }}>
                                                            {formatDuration(item.delay)}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                                                            {item.lastRequestAt ? dayjs(item.lastRequestAt).format('HH:mm') : '-'}
                                                        </Text>
                                                    </Flex>
                                                </DelayItem>
                                            </List.Item>
                                        );
                                    }}
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

export default TargetRequestDelayWidget;
