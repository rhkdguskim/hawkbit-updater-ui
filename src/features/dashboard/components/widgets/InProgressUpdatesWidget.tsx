import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, Tag, Button, Tooltip, Badge, Empty, message } from 'antd';
import {
    SyncOutlined,
    ClockCircleOutlined,
    ExclamationCircleFilled,
    ReloadOutlined,
    CloseOutlined,
    RocketOutlined,
    WarningFilled,
} from '@ant-design/icons';
import { AirportSlideList } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import { useCancelAction, useGetActionStatusList } from '@/api/generated/targets/targets';
import { useGetAction1 } from '@/api/generated/actions/actions';
import { useQueryClient } from '@tanstack/react-query';
import type { MgmtTarget, MgmtAction, MgmtActionStatus } from '@/api/generated/model';
import { Popover, List } from 'antd';
import { formatDistance } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { useLanguageStore } from '@/stores/useLanguageStore';
import dayjs from 'dayjs';

const { Text } = Typography;


const pulseAlert = keyframes`
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.98); }
    100% { opacity: 1; transform: scale(1); }
`;

const WarningBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: linear-gradient(
        135deg,
        rgba(var(--ant-orange-rgb), 0.1) 0%,
        rgba(var(--ant-red-rgb), 0.05) 100%
    );
    border: 1px solid var(--ant-color-warning-border);
    border-radius: 8px;
    font-size: 12px;
    color: var(--ant-color-warning-text);
    animation: ${pulseAlert} 3s infinite ease-in-out;
`;

const ActivityItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
    cursor: pointer;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%);
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: linear-gradient(135deg, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.6) 100%);
        border: 1px solid rgba(255, 255, 255, 0.03);
    }
`;

const DelayIndicator = styled.div<{ $level: 'warning' | 'critical' | 'normal' }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;

    ${({ $level }) => {
        switch ($level) {
            case 'critical':
                return `
                    background: rgba(var(--ant-red-rgb), 0.15);
                    color: var(--ant-color-error);
                `;
            case 'warning':
                return `
                    background: rgba(var(--ant-orange-rgb), 0.15);
                    color: var(--ant-color-warning);
                `;
            default:
                return `
                    background: rgba(var(--ant-green-rgb), 0.15);
                    color: var(--ant-color-success);
                `;
        }
    }}
`;

const RolloutInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 4px 8px;
    background: var(--ant-color-fill-quaternary);
    border-radius: 4px;
    font-size: 11px;
    color: var(--ant-color-text-secondary);
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--ant-color-border-secondary);
`;

const ListBody = styled.div`
    flex: 1;
    max-height: 360px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

interface InProgressItem {
    target: MgmtTarget;
    action: MgmtAction;
    rolloutName?: string;
    delayLevel?: 'normal' | 'warning' | 'critical';
    delayMs?: number;
}

interface InProgressActionItemProps {
    item: InProgressItem;
    currentTime: number | null;
    onRetry?: (targetId: string | number, actionId: number) => Promise<void>;
    handleItemClick: (item: InProgressItem) => void;
    cancelActionMutation: any;
}

const InProgressActionItem: React.FC<InProgressActionItemProps> = ({
    item,
    currentTime,
    onRetry,
    handleItemClick,
    cancelActionMutation,
}) => {
    const { t } = useTranslation(['dashboard', 'common', 'actions']);
    const { language } = useLanguageStore();
    const queryClient = useQueryClient();
    const dateLocale = language === 'ko' ? ko : enUS;

    // Polling for THE action to get latest detail status
    const { data: actionData } = useGetAction1(item.action.id!, {
        query: {
            enabled: !!item.action.id,
            refetchInterval: 2000,
            staleTime: 0
        }
    });

    const currentAction = actionData || item.action;

    // Polling for action stats history
    const { data: statusHistoryData } = useGetActionStatusList(
        item.target.controllerId!,
        item.action.id!,
        {},
        {
            query: {
                enabled: !!item.target.controllerId && !!item.action.id,
                refetchInterval: 5000,
                staleTime: 0
            }
        }
    );

    const statusHistory = statusHistoryData?.content || [];

    const getDelayText = (startTime?: number): string => {
        if (!startTime || !currentTime) return t('inProgress.justNow');
        return formatDistance(new Date(startTime), new Date(currentTime), { addSuffix: false, locale: dateLocale });
    };

    const handleRetry = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRetry && item.target.controllerId && item.action.id) {
            try {
                await onRetry(item.target.controllerId, item.action.id);
                message.success(t('actions:messages.retrySuccess'));
            } catch {
                message.error(t('actions:messages.retryFailed'));
            }
        }
    };

    const handleCancel = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.target.controllerId && item.action.id) {
            try {
                await cancelActionMutation.mutateAsync({
                    targetId: item.target.controllerId,
                    actionId: item.action.id,
                    params: { force: false },
                });
                message.success(t('actions:messages.cancelSuccess'));
                queryClient.invalidateQueries({ queryKey: ['/rest/v1/actions'] });
            } catch {
                message.error(t('actions:messages.cancelFailed'));
            }
        }
    };

    const delayLevel = item.delayLevel || 'normal';
    const delayText = getDelayText(currentAction.createdAt);

    const historyContent = (
        <div style={{ maxWidth: 350, padding: '4px 8px' }}>
            <Text strong style={{ fontSize: 13, marginBottom: 12, display: 'block', borderBottom: '1px solid var(--ant-color-border-secondary)', paddingBottom: 4 }}>
                {t('actions:history.title', 'Action History')}
            </Text>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <List
                    size="small"
                    dataSource={statusHistory}
                    renderItem={(status: MgmtActionStatus) => (
                        <List.Item style={{ padding: '8px 0', borderBottom: '1px dashed var(--ant-color-border-secondary)' }}>
                            <Flex vertical gap={4} style={{ width: '100%' }}>
                                <Flex justify="space-between" align="center">
                                    <Tag color="blue" style={{ fontSize: 11, margin: 0, fontWeight: 600 }}>
                                        {status.type}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: 10 }}>
                                        {status.timestamp || status.reportedAt
                                            ? dayjs(status.timestamp || status.reportedAt).format('HH:mm:ss')
                                            : '-'}
                                    </Text>
                                </Flex>
                                {status.messages && status.messages.length > 0 && (
                                    <div style={{
                                        background: 'var(--ant-color-fill-quaternary)',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        marginTop: 4,
                                        fontSize: 10,
                                        color: 'var(--ant-color-text-secondary)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all'
                                    }}>
                                        {status.messages.join(', ')}
                                    </div>
                                )}
                            </Flex>
                        </List.Item>
                    )}
                    locale={{ emptyText: t('common:noHistory', 'No history available') }}
                />
            </div>
        </div>
    );

    return (
        <Popover
            content={historyContent}
            placement="right"
            trigger="hover"
            mouseEnterDelay={0.3}
            overlayStyle={{ padding: 0 }}
        >
            <ActivityItem onClick={() => handleItemClick(item)}>
                <Flex justify="space-between" align="flex-start">
                    <Flex align="center" gap={8}>
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background:
                                    delayLevel === 'critical'
                                        ? 'rgba(var(--ant-red-rgb), 0.15)'
                                        : delayLevel === 'warning'
                                            ? 'rgba(var(--ant-orange-rgb), 0.15)'
                                            : 'rgba(var(--ant-blue-rgb), 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {delayLevel !== 'normal' ? (
                                <ExclamationCircleFilled
                                    style={{
                                        fontSize: 14,
                                        color:
                                            delayLevel === 'critical'
                                                ? 'var(--ant-color-error)'
                                                : 'var(--ant-color-warning)',
                                    }}
                                />
                            ) : (
                                <SyncOutlined
                                    spin
                                    style={{ fontSize: 14, color: 'var(--ant-color-primary)' }}
                                />
                            )}
                        </div>
                        <Flex vertical gap={0}>
                            <Text strong style={{ fontSize: 12 }}>
                                {item.target.name || item.target.controllerId}
                            </Text>
                            <Tag
                                color="blue"
                                style={{
                                    margin: 0,
                                    fontSize: 10,
                                    borderRadius: 4,
                                    padding: '0 4px',
                                    marginTop: 2,
                                }}
                            >
                                {t(`common:status.${currentAction.status?.toLowerCase() || 'running'}`)} ({currentAction.type?.toLowerCase()})
                            </Tag>
                        </Flex>
                    </Flex>
                    <DelayIndicator $level={delayLevel}>
                        <ClockCircleOutlined style={{ fontSize: 10 }} />
                        {delayLevel !== 'normal' ? t('inProgress.delayed', { time: delayText }) : delayText}
                    </DelayIndicator>
                </Flex>

                {item.rolloutName && (
                    <RolloutInfo>
                        <RocketOutlined style={{ fontSize: 10 }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {t('inProgress.rolloutLabel')}: {item.rolloutName}
                        </Text>
                    </RolloutInfo>
                )}

                <ActionButtons onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('inProgress.retry')}>
                        <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={handleRetry}
                        >
                            {t('inProgress.retry')}
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('inProgress.cancel')}>
                        <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            loading={cancelActionMutation.isPending}
                            onClick={handleCancel}
                        >
                            {t('inProgress.cancel')}
                        </Button>
                    </Tooltip>
                </ActionButtons>
            </ActivityItem>
        </Popover>
    );
};

interface InProgressUpdatesWidgetProps {
    isLoading: boolean;
    data: InProgressItem[];
    onRetry?: (targetId: string | number, actionId: number) => Promise<void>;
}

export const InProgressUpdatesWidget: React.FC<InProgressUpdatesWidgetProps> = ({
    isLoading,
    data,
    onRetry,
}) => {
    const { t } = useTranslation(['dashboard', 'common', 'actions']);
    const navigate = useNavigate();
    const cancelActionMutation = useCancelAction();

    const [currentTime, setCurrentTime] = useState<number | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentTime(Date.now());
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aStart = a.action.createdAt || 0;
            const bStart = b.action.createdAt || 0;
            // Sort by delay (oldest first)
            return aStart - bStart;
        });
    }, [data]);

    const delayedCount = useMemo(() => {
        return data.filter((item) => item.delayLevel && item.delayLevel !== 'normal').length;
    }, [data]);

    const handleItemClick = (item: InProgressItem) => {
        navigate(`/targets/${item.target.controllerId}/actions`);
    };

    return (
        <ListCard
            $theme="activity"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="activity">
                        <SyncOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('inProgress.title')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {t('recentActivities.inProgress', { count: data.length })}
                        </Text>
                    </Flex>
                </Flex>
            }
            extra={
                delayedCount > 0 && (
                    <Badge count={delayedCount} size="small" color="orange" />
                )
            }
            $delay={9}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : sortedData.length > 0 ? (
                <ListBody>
                    {delayedCount > 0 && (
                        <WarningBanner>
                            <WarningFilled />
                            <span>{t('inProgress.delayWarning', { count: delayedCount })}</span>
                        </WarningBanner>
                    )}
                    <AirportSlideList
                        items={sortedData}
                        itemHeight={130}
                        visibleCount={3}
                        scrollSpeed={30}
                        fullHeight={true}
                        renderItem={(item: InProgressItem) => (
                            <InProgressActionItem
                                key={`${item.target.controllerId}-${item.action.id}`}
                                item={item}
                                currentTime={currentTime}
                                onRetry={onRetry}
                                handleItemClick={handleItemClick}
                                cancelActionMutation={cancelActionMutation}
                            />
                        )}
                    />
                </ListBody>
            ) : (
                <Flex
                    vertical
                    justify="center"
                    align="center"
                    gap={12}
                    style={{ flex: 1, minHeight: 200 }}
                >
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('activeUpdates.empty')}
                    />
                </Flex>
            )}
        </ListCard>
    );
};

export default InProgressUpdatesWidget;
