import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Typography, Flex, Empty, Skeleton, Timeline, Progress, Tag, Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    SyncOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { useGetAction1 } from '@/api/generated/actions/actions';
import { useGetActionStatusList } from '@/api/generated/targets/targets';
import type { MgmtAction } from '@/api/generated/model';
import { ActionTimeline } from './ActionTimeline';

dayjs.extend(relativeTime);

const { Text } = Typography;

// Animations
const fadeInSlide = keyframes`
    from {
        opacity: 0;
        transform: translateX(-8px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const fadeOutSlide = keyframes`
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(20px);
        height: 0;
        padding: 0;
        margin: 0;
    }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

const ListContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-track {
        background: var(--ant-color-fill-tertiary);
    }
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-fill);
        border-radius: 4px;
    }
`;

const UpdateRow = styled.div<{ $isCompleting?: boolean; $isExpanded?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    background: transparent;
    border-bottom: 1px solid var(--ant-color-border-secondary, rgba(0, 0, 0, 0.03));
    transition: all 0.3s ease;
    animation: ${props => props.$isCompleting
        ? css`${fadeOutSlide} 0.5s ease-out forwards`
        : css`${fadeInSlide} 0.3s ease-out`};
    cursor: pointer;

    ${props => props.$isExpanded && `
        background: var(--ant-color-primary-bg, rgba(59, 130, 246, 0.04));
    `}

    &:hover {
        background: var(--ant-color-item-hover, rgba(59, 130, 246, 0.03));
    }
`;

const MainContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

const IconBadge = styled.div<{ $status?: string }>`
    width: var(--ant-control-height-lg, 40px);
    height: var(--ant-control-height-lg, 40px);
    border-radius: var(--ant-border-radius, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${props => {
        switch (props.$status) {
            case 'finished':
                return 'rgba(var(--ant-color-success-rgb), 0.15)';
            case 'error':
            case 'canceled':
                return 'rgba(var(--ant-color-error-rgb), 0.15)';
            default:
                return 'rgba(var(--ant-color-info-rgb), 0.15)';
        }
    }};
    color: ${props => {
        switch (props.$status) {
            case 'finished':
                return 'var(--ant-color-success)';
            case 'error':
            case 'canceled':
                return 'var(--ant-color-error)';
            default:
                return 'var(--ant-color-info)';
        }
    }};
    font-size: 1.1rem;

    ${props => ['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(props.$status || '') && css`
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const ExpandButton = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: var(--ant-padding-xxs, 4px) var(--ant-padding-xs, 8px);
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-description, #6b7280);
    cursor: pointer;
    border-radius: var(--ant-border-radius-sm, 6px);
    transition: all 0.2s;

    &:hover {
        background: var(--ant-color-item-hover);
        color: var(--ant-color-primary);
    }
`;

const HistoryPanel = styled.div`
    margin-top: var(--ant-margin-sm, 12px);
    padding: var(--ant-padding-sm, 12px);
    background: var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02));
    border-radius: var(--ant-border-radius, 8px);
    max-height: 200px;
    overflow-y: auto;
`;

const ProgressBar = styled.div`
    margin-top: var(--ant-margin-xs, 8px);
    padding: 0 var(--ant-padding-xxs, 4px);
`;

const PopoverContainer = styled.div`
    max-width: 320px;
    max-height: 300px;
    overflow: auto;
`;

const PopoverHeader = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        margin-bottom: var(--ant-margin-xxs, 4px);
    }
`;

const PopoverRow = styled(Flex)<{ $withDivider?: boolean }>`
    && {
        padding: var(--ant-padding-xxs, 4px) 0;
        border-bottom: ${props => props.$withDivider ? '1px solid var(--ant-color-border-secondary)' : 'none'};
    }
`;

const PopoverTag = styled(Tag)`
    && {
        font-size: var(--ant-font-size-sm);
        margin: 0;
        flex-shrink: 0;
    }
`;

const PopoverMessage = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        word-break: break-word;
    }
`;

const PopoverMore = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        text-align: center;
        margin-top: var(--ant-margin-xxs, 4px);
        display: block;
    }
`;

const RowContent = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

const RowMeta = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

const TargetName = styled(Text)`
    && {
        font-size: var(--ant-font-size);
    }
`;

const TimeText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const StatusText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
    }
`;

const HistoryTag = styled(Tag)`
    && {
        font-size: var(--ant-font-size-sm);
        margin: 0;
    }
`;

const HistoryMessage = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const EmptyState = styled(Flex)`
    flex: 1;
`;

const StatusPopover = styled(Popover)`
    .ant-popover-inner {
        max-width: 350px;
    }
`;

// Types
interface ActiveUpdateItem {
    action: MgmtAction;
    targetName?: string;
    controllerId?: string;
}

interface ActiveUpdatesCardProps {
    items: ActiveUpdateItem[];
    isLoading?: boolean;
    onNavigate?: (actionId: number) => void;
    showHistory?: boolean;
    emptyText?: string;
}

// Individual Row Component with real-time updates
const ActiveUpdateRowComponent: React.FC<{
    item: ActiveUpdateItem;
    onNavigate?: (actionId: number) => void;
    showHistory?: boolean;
    onComplete?: (actionId: number) => void;
}> = ({ item, onNavigate, showHistory = true, onComplete }) => {
    const { t } = useTranslation(['dashboard', 'actions', 'common']);
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const prevStatusRef = useRef<string | undefined>(item.action.status);

    // Real-time action data polling for active actions
    const isActive = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading'].includes(
        item.action.status?.toLowerCase() || ''
    );

    const { data: fetchedAction } = useGetAction1(
        item.action.id!,
        {
            query: {
                enabled: !!item.action.id && isActive,
                refetchInterval: 2000,
                staleTime: 0
            }
        }
    );

    const displayAction = fetchedAction || item.action;
    const status = displayAction.status?.toLowerCase() || '';
    const showPopover = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading'].includes(status);

    const targetLink = (displayAction._links as any)?.target;
    const targetId = item.controllerId || targetLink?.href?.split('/')?.pop();

    // Fetch granular status history on hover
    const { data: statusData } = useGetActionStatusList(
        targetId || '',
        item.action.id!,
        { limit: 10 },
        {
            query: {
                enabled: !!targetId && !!item.action.id && popoverOpen && showPopover,
                staleTime: 5000 // Cache for 5s
            }
        }
    );

    const statusHistory = (statusData?.content || []).slice().sort((a, b) => {
        const aTime = a.reportedAt || a.timestamp || 0;
        const bTime = b.reportedAt || b.timestamp || 0;
        return bTime - aTime;
    });

    const historyMessages = statusHistory.flatMap((entry) => entry.messages || []);
    const fallbackMessages = (displayAction as any).messages as string[] | undefined;
    const messages = historyMessages.length > 0 ? historyMessages : fallbackMessages;
    const lastMessage = historyMessages.length > 0
        ? historyMessages[0]
        : messages && messages.length > 0 ? messages[messages.length - 1] : undefined;
    const displayStatus = lastMessage || displayAction.detailStatus || status;
    const statusLabel = status
        ? t(`common:status.${status}`, { defaultValue: status })
        : '-';
    const resolvedStatus = displayStatus && displayStatus.toLowerCase() === status
        ? statusLabel
        : displayStatus || statusLabel;

    // Handle completion animation
    useEffect(() => {
        const prevStatus = prevStatusRef.current?.toLowerCase();
        const currentStatus = displayAction.status?.toLowerCase();

        // If status changed from active to finished
        if (
            prevStatus &&
            ['running', 'pending', 'scheduled', 'retrieving', 'downloading'].includes(prevStatus) &&
            ['finished', 'error', 'canceled'].includes(currentStatus || '')
        ) {
            // Wait 1 second, then fade out
            const timer = setTimeout(() => {
                setIsCompleting(true);
                // After fade animation, notify parent
                setTimeout(() => {
                    onComplete?.(item.action.id!);
                }, 500);
            }, 1000);
            return () => clearTimeout(timer);
        }

        prevStatusRef.current = displayAction.status;
    }, [displayAction.status, item.action.id, onComplete]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNavigate && item.action.id) {
            onNavigate(item.action.id);
        } else if (item.action.id) {
            navigate(`/actions/${item.action.id}`);
        }
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'finished':
                return <CheckCircleOutlined />;
            case 'error':
            case 'canceled':
                return <CloseCircleOutlined />;
            case 'running':
            case 'downloading':
            case 'retrieving':
                return <SyncOutlined spin />;
            default:
                return <ThunderboltOutlined />;
        }
    };

    // Calculate progress if available
    const progress = (displayAction as any).progress as number | undefined;

    // Popover content for hover - status history only
    const popoverContent = (
        <PopoverContainer>
            <Flex vertical gap={8}>
                <PopoverHeader strong>
                    {t('activeUpdates.statusHistory')}
                </PopoverHeader>
                {showHistory && statusHistory.length > 0 ? (
                    <Flex vertical gap={4}>
                        {statusHistory.slice(0, 6).map((entry, idx) => {
                            const statusKey = entry.type?.toLowerCase() || 'unknown';
                            const statusLabelText = t(`common:status.${statusKey}`, { defaultValue: entry.type || '-' });
                            const messageText = entry.messages?.[0] || statusLabelText;
                            return (
                                <PopoverRow key={`${entry.id ?? idx}`} gap={8} align="flex-start" $withDivider={idx < 5 && idx < statusHistory.length - 1}>
                                    <PopoverTag color={idx === 0 ? 'blue' : 'default'}>
                                        {statusLabelText}
                                    </PopoverTag>
                                    <PopoverMessage type={idx === 0 ? undefined : 'secondary'}>
                                        {messageText}
                                    </PopoverMessage>
                                </PopoverRow>
                            );
                        })}
                        {statusHistory.length > 6 && (
                            <PopoverMore type="secondary">
                                +{statusHistory.length - 6} {t('common:more')}...
                            </PopoverMore>
                        )}
                    </Flex>
                ) : showHistory && messages && messages.length > 0 ? (
                    <Flex vertical gap={4}>
                        {messages.slice().reverse().slice(0, 6).map((msg: string, idx: number) => (
                            <PopoverRow key={idx} gap={8} align="flex-start" $withDivider={idx < 5 && idx < messages.length - 1}>
                                <PopoverTag color={idx === 0 ? 'blue' : 'default'}>
                                    {idx === 0 ? t('common:status.current') : `#${messages.length - idx}`}
                                </PopoverTag>
                                <PopoverMessage type={idx === 0 ? undefined : 'secondary'}>
                                    {msg}
                                </PopoverMessage>
                            </PopoverRow>
                        ))}
                        {messages.length > 6 && (
                            <PopoverMore type="secondary">
                                +{messages.length - 6} {t('common:more')}...
                            </PopoverMore>
                        )}
                    </Flex>
                ) : (
                    <Text type="secondary">
                        {t('activeUpdates.noHistory')}
                    </Text>
                )}
            </Flex>
        </PopoverContainer>
    );

    const rowContent = (
        <UpdateRow $isCompleting={isCompleting} $isExpanded={isExpanded}>
            <MainContent onClick={handleClick}>
                <RowContent align="center" gap={12}>
                    <IconBadge $status={status}>
                        {getStatusIcon()}
                    </IconBadge>
                    <RowMeta vertical gap={2}>
                        <Flex justify="space-between" align="center">
                            <TargetName strong>
                                {item.targetName || item.controllerId || `Action #${item.action.id}`}
                            </TargetName>
                            <TimeText type="secondary">
                                {item.action.createdAt ? dayjs(item.action.createdAt).fromNow(true) : ''}
                            </TimeText>
                        </Flex>
                        <Flex align="center" gap={6}>
                            <StatusText type="secondary">
                                {resolvedStatus}
                            </StatusText>
                        </Flex>
                    </RowMeta>
                </RowContent>

                <Flex align="center" gap={8}>
                    <ActionTimeline action={displayAction} />
                    {showHistory && messages && messages.length > 1 && (
                        <ExpandButton onClick={handleExpandClick}>
                            {isExpanded ? <UpOutlined /> : <DownOutlined />}
                        </ExpandButton>
                    )}
                </Flex>
            </MainContent>

            {/* Progress bar if available */}
            {progress !== undefined && progress > 0 && progress < 100 && (
                <ProgressBar>
                    <Progress percent={progress} size="small" strokeColor="var(--ant-color-info)" />
                </ProgressBar>
            )}

            {/* Expandable Status History - uses messages from action */}
            {isExpanded && showHistory && messages && messages.length > 0 && (
                <HistoryPanel onClick={(e) => e.stopPropagation()}>
                    <Timeline
                        items={messages.slice().reverse().slice(0, 10).map((msg: string, idx: number) => ({
                            color: idx === 0 ? 'blue' : 'gray',
                            children: (
                                <Flex vertical gap={2}>
                                    <Flex align="center" gap={8}>
                                        <HistoryTag>
                                            {idx === 0 ? t('common:status.current') : `${t('common:pagination.step')} ${messages.length - idx}`}
                                        </HistoryTag>
                                    </Flex>
                                    <HistoryMessage type="secondary">
                                        {msg}
                                    </HistoryMessage>
                                </Flex>
                            ),
                        }))}
                    />
                </HistoryPanel>
            )}
        </UpdateRow>
    );

    // Wrap with Popover for hover effect on active actions
    if (showPopover) {
        return (
            <StatusPopover
                content={popoverContent}
                title={null}
                placement="right" // Changed to right for better visibility usually, or auto
                trigger="hover"
                mouseEnterDelay={0.2} // Slightly faster to feel responsive
                onOpenChange={setPopoverOpen}
            >
                {rowContent}
            </StatusPopover>
        );
    }

    return rowContent;
};

// Main Component
export const ActiveUpdatesCard: React.FC<ActiveUpdatesCardProps> = ({
    items,
    isLoading = false,
    onNavigate,
    showHistory = true,
    emptyText,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const [visibleItems, setVisibleItems] = useState<ActiveUpdateItem[]>(items);

    // Update visible items when props change
    useEffect(() => {
        setVisibleItems(items);
    }, [items]);

    // Handle item completion (remove from list after animation)
    const handleComplete = useCallback((actionId: number) => {
        setVisibleItems(prev => prev.filter(item => item.action.id !== actionId));
    }, []);

    if (isLoading) {
        return (
            <Container>
                <Skeleton active paragraph={{ rows: 4 }} />
            </Container>
        );
    }

    if (visibleItems.length === 0) {
        return (
            <Container>
                <EmptyState justify="center" align="center">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Text type="secondary">
                                {emptyText || t('activeUpdates.empty')}
                            </Text>
                        }
                    />
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <ListContainer>
                {visibleItems.map((item) => (
                    <ActiveUpdateRowComponent
                        key={item.action.id}
                        item={item}
                        onNavigate={onNavigate}
                        showHistory={showHistory}
                        onComplete={handleComplete}
                    />
                ))}
            </ListContainer>
        </Container>
    );
};

export default ActiveUpdatesCard;
