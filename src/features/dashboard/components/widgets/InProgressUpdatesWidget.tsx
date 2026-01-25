import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, Tag, Button, Tooltip, Empty, message, Space, theme } from 'antd';
import type { GlobalToken } from 'antd';
import {
    SyncOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    CloseOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { ListCard } from '@/components/patterns/DashboardStyles';
import { useCancelAction, useGetActionStatusList } from '@/api/generated/targets/targets';
import { useQueryClient } from '@tanstack/react-query';
import type { MgmtTarget, MgmtAction, MgmtActionStatus } from '@/api/generated/model';
import type { UseMutationResult } from '@tanstack/react-query';
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
const { useToken } = theme;

const ActivityCard = styled.div<{ $status: 'info' | 'warning' | 'error'; $token: GlobalToken }>`
    padding: 12px;
    background: ${props => props.$token.colorBgContainer};
    border-radius: ${props => props.$token.borderRadius}px;
    border: 1px solid ${props => {
        if (props.$status === 'error') return props.$token.colorErrorBorder;
        if (props.$status === 'warning') return props.$token.colorWarningBorder;
        return props.$token.colorBorderSecondary;
    }};
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: ${props => {
            if (props.$status === 'error') return props.$token.colorError;
            if (props.$status === 'warning') return props.$token.colorWarning;
            return props.$token.colorPrimary;
        }};
    }

    &:hover {
        border-color: ${props => props.$token.colorPrimary};
        box-shadow: ${props => props.$token.boxShadowSecondary};
        transform: translateY(-2px);
    }
`;

const IconBadge = styled.div<{ $theme: string; $token: GlobalToken }>`
    width: 32px;
    height: 32px;
    border-radius: ${props => props.$token.borderRadiusSM}px;
    background: ${props => props.$token.colorPrimaryBg};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$token.colorPrimary};
    font-size: 16px;
`;

const RolloutInfo = styled.div<{ $token: GlobalToken }>`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding: 4px 8px;
    background: ${props => props.$token.colorFillQuaternary};
    border-radius: ${props => props.$token.borderRadiusSM}px;
    font-size: 11px;
    color: ${props => props.$token.colorTextSecondary};
    font-family: var(--font-mono);
`;

const ActionButtons = styled.div<{ $token: GlobalToken }>`
    display: flex;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid ${props => props.$token.colorBorderSecondary};
`;

const ListBody = styled.div<{ $hasMany?: boolean }>`
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    display: grid;
    grid-template-columns: ${props => props.$hasMany ? 'repeat(auto-fill, minmax(450px, 1fr))' : '1fr'};
    grid-auto-rows: max-content;
    align-content: start;
    gap: 12px;
    padding-right: 4px;

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
    cancelActionMutation: ReturnType<typeof useCancelAction>;
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
    const { token } = useToken();
    const [isHovered, setIsHovered] = useState(false);

    const currentAction = item.action;

    const { data: statusHistoryData, refetch: refetchHistory } = useGetActionStatusList(
        item.target.controllerId!,
        item.action.id!,
        {},
        {
            query: {
                enabled: false,
                staleTime: 30000,
                gcTime: 60000,
            }
        }
    );

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        refetchHistory();
    }, [refetchHistory]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const statusHistory = statusHistoryData?.content || [];

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
                console.error('Cancel action failed:', error);
            }
        }
    };

    const delayText = getDelayText(currentAction.createdAt);

    const historyContent = (
        <div style={{ maxWidth: 350, padding: '4px 8px' }}>
            <Text strong style={{ fontSize: token.fontSize, marginBottom: 12, display: 'block', borderBottom: `1px solid ${token.colorBorderSecondary}`, paddingBottom: 4 }}>
                {t('actions:history.title', 'Action History')}
            </Text>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <List
                    size="small"
                    dataSource={sortedHistory}
                    renderItem={(status: MgmtActionStatus) => (
                        <List.Item style={{ padding: '8px 0', borderBottom: `1px dashed ${token.colorBorderSecondary}` }}>
                            <Flex vertical gap={4} style={{ width: '100%' }}>
                                <Flex justify="space-between" align="center">
                                    <Tag color="blue" style={{ fontSize: token.fontSizeSM, margin: 0, fontWeight: 600 }}>
                                        {getStatusLabel(status.type, t)}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: token.fontSizeSM, fontFamily: 'var(--font-mono)' }}>
                                        {status.timestamp || status.reportedAt
                                            ? dayjs(status.timestamp || status.reportedAt).format('HH:mm:ss')
                                            : '-'}
                                    </Text>
                                </Flex>
                                {status.messages && status.messages.length > 0 && (
                                    <div style={{
                                        background: token.colorFillQuaternary,
                                        padding: '4px 8px',
                                        borderRadius: token.borderRadiusSM,
                                        marginTop: 4,
                                        fontSize: token.fontSizeSM,
                                        color: token.colorTextSecondary,
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
                $token={token}
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
                                borderRadius: token.borderRadiusSM,
                                background: token.colorPrimaryBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {['error', 'failed'].includes(currentAction.status?.toLowerCase() || '') ? (
                                <CloseOutlined
                                    style={{
                                        fontSize: token.fontSize,
                                        color: token.colorError,
                                    }}
                                />
                            ) : (
                                <SyncOutlined
                                    spin
                                    style={{ fontSize: token.fontSize, color: token.colorPrimary }}
                                />
                            )}
                        </div>
                        <Flex vertical gap={0}>
                            <Flex align="center" gap={4} wrap="wrap">
                                <Text strong style={{ fontSize: token.fontSizeSM, fontFamily: 'var(--font-mono)' }}>
                                    {item.target.name || item.target.controllerId}
                                </Text>
                            </Flex>
                            <Space size={4} wrap>
                                <Tag
                                    color={['error', 'failed', 'canceled'].includes(currentAction.status?.toLowerCase() || '') ? 'red' : currentAction.status?.toLowerCase() === 'canceling' ? 'orange' : 'blue'}
                                    style={{
                                        margin: 0,
                                        fontSize: token.fontSizeSM - 2,
                                        borderRadius: 4,
                                        padding: '0 4px',
                                        marginTop: 2,
                                        textTransform: 'uppercase',
                                        fontWeight: 700
                                    }}
                                >
                                    {t(`common:status.${currentAction.status?.toLowerCase() || 'running'}`)}
                                </Tag>
                            </Space>
                        </Flex>
                    </Flex>
                    <Flex align="center" gap={4} style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM, fontFamily: 'var(--font-mono)' }}>
                        <ClockCircleOutlined style={{ fontSize: 12 }} />
                        {delayText}
                    </Flex>
                </Flex>

                {item.rolloutName && (
                    <RolloutInfo $token={token}>
                        <RocketOutlined style={{ fontSize: token.fontSizeSM }} />
                        <Text type="secondary" style={{ fontSize: token.fontSizeSM, color: 'inherit' }}>
                            {t('inProgress.rolloutLabel')}: {item.rolloutName}
                        </Text>
                    </RolloutInfo>
                )}

                <ActionButtons $token={token} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('inProgress.retry')}>
                        <Button
                            size="small"
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={handleRetry}
                            style={{ fontSize: 12 }}
                        >
                            {t('inProgress.retry')}
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('inProgress.cancel')}>
                        <Button
                            size="small"
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            loading={cancelActionMutation.isPending}
                            disabled={
                                !isActionInProgress(currentAction.status) ||
                                isActionCanceled(currentAction) ||
                                currentAction.type?.toLowerCase() === 'cancel'
                            }
                            onClick={handleCancel}
                            style={{ fontSize: 12 }}
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
    const { token } = useToken();
    const cancelActionMutation = useCancelAction();

    const [currentTime, setCurrentTime] = useState<number | null>(null);

    useEffect(() => {
        setCurrentTime(Date.now());
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const sortedData = useMemo(() => {
        const filteredData = data.filter((item) => {
            return isActive(item.action) && !isActionCanceled(item.action);
        });

        return [...filteredData].sort((a, b) => {
            const aStart = a.action.createdAt || 0;
            const bStart = b.action.createdAt || 0;
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
                    <IconBadge $theme="activity" $token={token}>
                        <SyncOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: token.fontSize, fontWeight: 700 }}>{t('inProgress.title')}</span>
                        <Text type="secondary" style={{ fontSize: token.fontSizeSM, fontFamily: 'var(--font-mono)' }}>
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
