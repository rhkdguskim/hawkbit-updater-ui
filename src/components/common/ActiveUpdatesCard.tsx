import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Typography, Flex, Empty, Skeleton, Progress, Tag, Popover } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    SyncOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
// useGetAction1 removed - no longer needed after N+1 optimization
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

const UpdateRow = styled.div<{ $isCompleting?: boolean; $isNew?: boolean }>`
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
    will-change: transform, opacity;

    &:hover {
        background: var(--ant-color-item-hover, rgba(59, 130, 246, 0.03));
    }

    ${props => props.$isNew && css`
        background: rgba(var(--ant-color-info-rgb), 0.06);
        box-shadow: inset 0 0 0 1px rgba(var(--ant-color-info-rgb), 0.2);
    `}
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

const ProgressBar = styled.div`
    margin-top: var(--ant-margin-xs, 8px);
    padding: 0 var(--ant-padding-xxs, 4px);
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

const EmptyState = styled(Flex)`
    flex: 1;
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

const PopoverRow = styled(Flex) <{ $withDivider?: boolean }>`
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
    rowRef?: (node: HTMLDivElement | null) => void;
    isNew?: boolean;
}> = ({ item, onNavigate, showHistory = true, onComplete, rowRef, isNew }) => {
    const { t } = useTranslation(['dashboard', 'actions', 'common']);
    const navigate = useNavigate();
    const [isCompleting, setIsCompleting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const prevStatusRef = useRef<string | undefined>(item.action.status);

    // OPTIMIZED: Removed individual action polling (N+1 pattern)
    // Parent component already provides real-time action data
    const displayAction = item.action;
    const status = displayAction.status?.toLowerCase() || '';
    const isActiveStatus = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading'].includes(status);

    const targetLink = (displayAction._links as Record<string, unknown> | undefined)?.target as { href?: string } | undefined;
    const targetId = item.controllerId || targetLink?.href?.split('/')?.pop();

    // OPTIMIZED: Status history only fetched on hover with 30s cache
    const { data: statusData, refetch: refetchHistory } = useGetActionStatusList(
        targetId || '',
        item.action.id!,
        { limit: 10 },
        {
            query: {
                enabled: false, // Lazy fetch - triggered on hover
                staleTime: 30000, // 30s cache
                gcTime: 60000, // Keep in cache for 1 minute
            }
        }
    );

    // Fetch history on hover (lazy loading)
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        if (showHistory && targetId) {
            refetchHistory();
        }
    }, [refetchHistory, showHistory, targetId]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    const statusHistory = (statusData?.content || []).slice().sort((a, b) => {
        const aTime = a.reportedAt || a.timestamp || 0;
        const bTime = b.reportedAt || b.timestamp || 0;
        return bTime - aTime;
    });

    const historyMessages = statusHistory.flatMap((entry) => entry.messages || []);
    const fallbackMessages = (displayAction as Record<string, unknown>).messages as string[] | undefined;
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
    const progress = (displayAction as Record<string, unknown>).progress as number | undefined;

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
        <UpdateRow
            $isCompleting={isCompleting}
            $isNew={isNew}
            ref={rowRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
                </Flex>
            </MainContent>

            {/* Progress bar if available */}
            {progress !== undefined && progress > 0 && progress < 100 && (
                <ProgressBar>
                    <Progress percent={progress} size="small" strokeColor="var(--ant-color-info)" />
                </ProgressBar>
            )}

        </UpdateRow>
    );
    if (showHistory) {
        return (
            <StatusPopover
                content={popoverContent}
                title={null}
                placement="right"
                trigger="hover"
                mouseEnterDelay={0.2}
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
    const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<number>>(new Set());
    const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const previousPositions = useRef<Map<number, DOMRect>>(new Map());
    const previousIds = useRef<Set<number>>(new Set());

    // Update visible items when props change
    useEffect(() => {
        setVisibleItems(items);
    }, [items]);

    useEffect(() => {
        const nextIds = new Set(items.map(item => item.action.id!));
        const newIds = items
            .map(item => item.action.id!)
            .filter(id => !previousIds.current.has(id));
        previousIds.current = nextIds;
        if (newIds.length === 0) return undefined;
        setRecentlyAddedIds(prev => {
            const next = new Set(prev);
            newIds.forEach(id => next.add(id));
            return next;
        });
        const timer = setTimeout(() => {
            setRecentlyAddedIds(prev => {
                const next = new Set(prev);
                newIds.forEach(id => next.delete(id));
                return next;
            });
        }, 1500);
        return () => clearTimeout(timer);
    }, [items]);

    useLayoutEffect(() => {
        const nextPositions = new Map<number, DOMRect>();
        visibleItems.forEach(item => {
            const node = itemRefs.current.get(item.action.id!);
            if (!node) return;
            nextPositions.set(item.action.id!, node.getBoundingClientRect());
        });

        nextPositions.forEach((nextRect, id) => {
            const prevRect = previousPositions.current.get(id);
            if (!prevRect) return;
            const deltaX = prevRect.left - nextRect.left;
            const deltaY = prevRect.top - nextRect.top;
            if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;
            const node = itemRefs.current.get(id);
            if (!node) return;
            node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            node.style.transition = 'transform 260ms ease';
            requestAnimationFrame(() => {
                node.style.transform = 'translate(0, 0)';
            });
        });

        previousPositions.current = nextPositions;
    }, [visibleItems]);

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
                        isNew={recentlyAddedIds.has(item.action.id!)}
                        rowRef={(node) => {
                            if (node) {
                                itemRefs.current.set(item.action.id!, node);
                            } else {
                                itemRefs.current.delete(item.action.id!);
                            }
                        }}
                    />
                ))}
            </ListContainer>
        </Container>
    );
};

export default ActiveUpdatesCard;
