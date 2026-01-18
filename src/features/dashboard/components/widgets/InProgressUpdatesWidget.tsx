import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, Tag, Button, Tooltip, Empty, message, Space } from 'antd';
import {
    SyncOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    CloseOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { ListCard } from '../DashboardStyles';
import { WidgetContainer, HeaderRow, ActivityCard, IconBadge } from './WidgetStyles';
import { useCancelAction, useGetActionStatusList } from '@/api/generated/targets/targets';
// useGetAction1 removed - no longer needed after N+1 optimization
import { useQueryClient } from '@tanstack/react-query';
import type { MgmtTarget, MgmtAction, MgmtActionStatus } from '@/api/generated/model';
import { Popover, List } from 'antd';
import { useLanguageStore } from '@/stores/useLanguageStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import 'dayjs/locale/en';
import { getStatusLabel, translateStatusMessage, isActionCanceled, isActionInProgress } from '@/utils/statusUtils';
import { isActive } from '@/entities';

dayjs.extend(relativeTime);

const { Text } = Typography;





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

const ListBody = styled.div<{ $hasMany?: boolean }>`
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    display: grid;
    /* Use 2 columns if many items and space permits */
    grid-template-columns: ${props => props.$hasMany ? 'repeat(auto-fill, minmax(450px, 1fr))' : '1fr'};
    grid-auto-rows: max-content;
    align-content: start;
    gap: 12px;
    padding-right: 4px;

    /* Custom scrollbar for better appearance */
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-border-secondary);
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: var(--ant-color-border);
    }
`;

interface InProgressItem {
    target: MgmtTarget;
    action: MgmtAction;
    rolloutName?: string;
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
    const [isHovered, setIsHovered] = useState(false);

    // OPTIMIZED: Removed individual action polling (N+1 pattern)
    // Parent component (useDashboardMetrics) already provides real-time action data
    const currentAction = item.action;

    // OPTIMIZED: Status history only fetched on hover with 30s cache
    // This dramatically reduces API calls since most items are never hovered
    const { data: statusHistoryData, refetch: refetchHistory } = useGetActionStatusList(
        item.target.controllerId!,
        item.action.id!,
        {},
        {
            query: {
                enabled: false, // Lazy fetch - triggered on hover
                staleTime: 30000, // 30s cache - don't refetch if recently fetched
                gcTime: 60000, // Keep in cache for 1 minute
            }
        }
    );

    // Fetch history on hover (lazy loading)
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        refetchHistory();
    }, [refetchHistory]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const statusHistory = statusHistoryData?.content || [];

    // Sort history to find the latest event by timestamp (descending)
    const sortedHistory = [...statusHistory].sort((a, b) => {
        const tA = a.timestamp || a.reportedAt || 0;
        const tB = b.timestamp || b.reportedAt || 0;
        return dayjs(tB).valueOf() - dayjs(tA).valueOf();
    });

    const getDelayText = (startTime?: number): string => {
        if (!startTime || !currentTime) return t('inProgress.justNow');
        return dayjs(startTime).locale(language).from(dayjs(currentTime), true);
    };

    const handleRetry = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRetry && item.target.controllerId && item.action.id) {
            try {
                await onRetry(item.target.controllerId, item.action.id);
                message.success(t('actions:detail.messages.retrySuccess'));
            } catch (error) {
                // Global interceptor handles the error message, avoid double alert
                console.error('Retry action failed:', error);
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
                message.success(t('actions:detail.messages.cancelSuccess'));
                queryClient.invalidateQueries({ queryKey: ['/rest/v1/actions'] });
            } catch (error) {
                // Global interceptor handles the error message, avoid double alert
                console.error('Cancel action failed:', error);
            }
        }
    };

    const delayText = getDelayText(currentAction.createdAt);

    const historyContent = (
        <div style={{ maxWidth: 350, padding: '4px 8px' }}>
            <Text strong style={{ fontSize: 'var(--ant-font-size)', marginBottom: 12, display: 'block', borderBottom: '1px solid var(--ant-color-border-secondary)', paddingBottom: 4 }}>
                {t('actions:history.title', 'Action History')}
            </Text>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <List
                    size="small"
                    dataSource={sortedHistory}
                    renderItem={(status: MgmtActionStatus) => (
                        <List.Item style={{ padding: '8px 0', borderBottom: '1px dashed var(--ant-color-border-secondary)' }}>
                            <Flex vertical gap={4} style={{ width: '100%' }}>
                                <Flex justify="space-between" align="center">
                                    <Tag color="blue" style={{ fontSize: 'var(--ant-font-size-sm)', margin: 0, fontWeight: 600 }}>
                                        {getStatusLabel(status.type, t)}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
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
                                        fontSize: 'var(--ant-font-size-sm)',
                                        color: 'var(--ant-color-text-secondary)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all'
                                    }}>
                                        {status.messages.map(m => translateStatusMessage(m, t)).join(', ')}
                                    </div>
                                )}
                            </Flex>
                        </List.Item>
                    )}
                    locale={{ emptyText: t('actions:statusHistoryEmpty') }}
                />
            </div>
        </div>
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleItemClick(item);
        }
    };

    return (
        <Popover
            content={historyContent}
            placement="right"
            trigger="hover"
            mouseEnterDelay={0.3}
            overlayStyle={{ padding: 0 }}
        >
            <ActivityCard
                $status={['error', 'failed'].includes(currentAction.status?.toLowerCase() || '') ? 'error' : currentAction.status?.toLowerCase() === 'canceling' ? 'warning' : 'info'}
                onClick={() => handleItemClick(item)}
                onKeyDown={handleKeyDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                role="button"
                tabIndex={0}
                aria-label={item.target.name || item.target.controllerId || ''}
                className="dashboard-clickable"
            >
                <Flex justify="space-between" align="flex-start">
                    <Flex align="center" gap={8}>
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: 'rgba(var(--color-primary-rgb), 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {['error', 'failed'].includes(currentAction.status?.toLowerCase() || '') ? (
                                <CloseOutlined
                                    style={{
                                        fontSize: 'var(--ant-font-size)',
                                        color: 'var(--ant-color-error)',
                                    }}
                                />
                            ) : (
                                <SyncOutlined
                                    spin
                                    style={{ fontSize: 'var(--ant-font-size)', color: 'var(--ant-color-primary)' }}
                                />
                            )}
                        </div>
                        <Flex vertical gap={0}>
                            <Flex align="center" gap={4} wrap="wrap">
                                <Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                    {item.target.name || item.target.controllerId}
                                </Text>
                            </Flex>
                            <Space size={4} wrap>
                                <Tag
                                    color={['error', 'failed', 'canceled'].includes(currentAction.status?.toLowerCase() || '') ? 'red' : currentAction.status?.toLowerCase() === 'canceling' ? 'orange' : 'blue'}
                                    style={{
                                        margin: 0,
                                        fontSize: 'var(--ant-font-size-sm)',
                                        borderRadius: 4,
                                        padding: '0 4px',
                                        marginTop: 2,
                                    }}
                                >
                                    {t(`common:status.${currentAction.status?.toLowerCase() || 'running'}`)}
                                </Tag>
                            </Space>
                        </Flex>
                    </Flex>
                    <Flex align="center" gap={4} style={{ color: 'var(--ant-color-text-description)', fontSize: 'var(--ant-font-size-sm)' }}>
                        <ClockCircleOutlined />
                        {delayText}
                    </Flex>
                </Flex>

                {item.rolloutName && (
                    <RolloutInfo>
                        <RocketOutlined style={{ fontSize: 'var(--ant-font-size-sm)' }} />
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
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
                            disabled={
                                !isActionInProgress(currentAction.status) ||
                                isActionCanceled(currentAction) ||
                                currentAction.type?.toLowerCase() === 'cancel'
                            }
                            onClick={handleCancel}
                        >
                            {t('inProgress.cancel')}
                        </Button>
                    </Tooltip>
                </ActionButtons>
            </ActivityCard>
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
        // Aggressively filter out canceling/canceled actions
        const filteredData = data.filter((item) => {
            return isActive(item.action) && !isActionCanceled(item.action);
        });

        return [...filteredData].sort((a, b) => {
            const aStart = a.action.createdAt || 0;
            const bStart = b.action.createdAt || 0;
            // Sort by delay (oldest first)
            return aStart - bStart;
        });
    }, [data]);

    const handleItemClick = (item: InProgressItem) => {
        navigate(`/actions/${item.action.id}`);
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
                        <span style={{ fontSize: 'var(--ant-font-size)', fontWeight: 600 }}>{t('inProgress.title')}</span>
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                            {t('recentActivities.inProgress', { count: sortedData.length })}
                        </Text>
                    </Flex>
                </Flex>
            }
            $delay={9}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : sortedData.length > 0 ? (
                <ListBody $hasMany={sortedData.length > 5}>
                    {sortedData.map((item: InProgressItem) => (
                        <InProgressActionItem
                            key={`${item.target.controllerId}-${item.action.id}`}
                            item={item}
                            currentTime={currentTime}
                            onRetry={onRetry}
                            handleItemClick={handleItemClick}
                            cancelActionMutation={cancelActionMutation}
                        />
                    ))}
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
