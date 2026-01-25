import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Typography, Badge, Flex } from 'antd';
import {
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
    ApiOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { WebSocketMessage } from '@/api/websocket/types';

dayjs.extend(relativeTime);

const slideIn = keyframes`
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const Container = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: 12px;
    border: 1px solid var(--ant-color-border);
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-border);
        border-radius: 3px;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--ant-color-border-secondary);
`;

const Title = styled(Typography.Text)`
    font-weight: 600;
    font-size: 14px;
`;

const FeedList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const FeedItem = styled.div<{ $type: 'success' | 'info' | 'error' | 'warning' }>`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    background: ${props => {
        switch (props.$type) {
            case 'success': return 'rgba(16, 185, 129, 0.05)';
            case 'error': return 'rgba(220, 38, 38, 0.05)';
            case 'warning': return 'rgba(245, 158, 11, 0.05)';
            default: return 'rgba(59, 130, 246, 0.05)';
        }
    }};
    border: 1px solid ${props => {
        switch (props.$type) {
            case 'success': return 'rgba(16, 185, 129, 0.2)';
            case 'error': return 'rgba(220, 38, 38, 0.2)';
            case 'warning': return 'rgba(245, 158, 11, 0.2)';
            default: return 'rgba(59, 130, 246, 0.2)';
        }
    }};
    ${css`
        animation: ${slideIn} 0.3s ease-out;
    `}
    transition: all 0.2s ease;

    &:hover {
        transform: translateX(4px);
    }
`;

const IconWrapper = styled.div<{ $type: 'success' | 'info' | 'error' | 'warning' }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
    background: ${props => {
        switch (props.$type) {
            case 'success': return 'rgba(16, 185, 129, 0.1)';
            case 'error': return 'rgba(220, 38, 38, 0.1)';
            case 'warning': return 'rgba(245, 158, 11, 0.1)';
            default: return 'rgba(59, 130, 246, 0.1)';
        }
    }};
    color: ${props => {
        switch (props.$type) {
            case 'success': return 'var(--ant-color-success)';
            case 'error': return 'var(--ant-color-error)';
            case 'warning': return 'var(--ant-color-warning)';
            default: return 'var(--ant-color-info)';
        }
    }};
    font-size: 16px;
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const Message = styled(Typography.Text)`
    font-size: 13px;
    font-weight: 500;
    color: var(--ant-color-text);
`;

const Timestamp = styled(Typography.Text)`
    font-size: 11px;
    color: var(--ant-color-text-tertiary);
    font-family: 'SF Mono', Consolas, monospace;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px 20px;
    color: var(--ant-color-text-tertiary);
`;

interface ActivityEvent {
    id: string;
    type: 'success' | 'info' | 'error' | 'warning';
    icon: React.ReactNode;
    message: string;
    timestamp: number;
}

interface LiveActivityFeedProps {
    maxItems?: number;
    onEventReceived?: (message: WebSocketMessage) => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ 
    maxItems = 20,
}) => {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const listRef = useRef<HTMLDivElement>(null);

    const addEvent = (event: ActivityEvent) => {
        setEvents(prev => {
            const newEvents = [event, ...prev].slice(0, maxItems);
            return newEvents;
        });

        setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollTop = 0;
            }
        }, 50);
    };

    const getEventIcon = (entityType: string, eventType: string) => {
        if (eventType === 'CREATED') return <ThunderboltOutlined />;
        if (eventType === 'STOPPED' || eventType === 'DELETED') return <CloseCircleOutlined />;
        if (entityType === 'ACTION') return <RocketOutlined />;
        if (entityType === 'TARGET') return <ApiOutlined />;
        if (entityType === 'ROLLOUT') return <SyncOutlined />;
        return <CheckCircleOutlined />;
    };

    const getEventType = (eventType: string): 'success' | 'info' | 'error' | 'warning' => {
        if (eventType === 'CREATED') return 'success';
        if (eventType === 'STOPPED' || eventType === 'DELETED') return 'error';
        return 'info';
    };

    const formatEventMessage = (message: WebSocketMessage): string => {
        const { eventType, entityType, payload } = message;
        
        if (entityType === 'ACTION') {
            const actionPayload = payload as { id: number; status?: string; targetId?: string };
            if (eventType === 'CREATED') {
                return `New deployment action #${actionPayload.id} created`;
            }
            if (eventType === 'UPDATE' && actionPayload.status) {
                return `Action #${actionPayload.id} → ${actionPayload.status}`;
            }
        }

        if (entityType === 'TARGET') {
            const targetPayload = payload as { controllerId: string; status?: string };
            if (eventType === 'POLL') {
                return `Device ${targetPayload.controllerId} checked in`;
            }
            if (eventType === 'UPDATE' && targetPayload.status) {
                return `Device ${targetPayload.controllerId} is now ${targetPayload.status}`;
            }
        }

        if (entityType === 'ROLLOUT') {
            const rolloutPayload = payload as { id: number; status?: string };
            if (eventType === 'UPDATE') {
                return `Rollout #${rolloutPayload.id} status: ${rolloutPayload.status}`;
            }
            if (eventType === 'STOPPED') {
                return `Rollout #${rolloutPayload.id} stopped`;
            }
        }

        return `${entityType} ${eventType}`;
    };

    useEffect(() => {
        const handleWebSocketMessage = (event: CustomEvent<WebSocketMessage>) => {
            const message = event.detail;
            
            const activityEvent: ActivityEvent = {
                id: `${Date.now()}-${Math.random()}`,
                type: getEventType(message.eventType),
                icon: getEventIcon(message.entityType, message.eventType),
                message: formatEventMessage(message),
                timestamp: Date.now(),
            };

            addEvent(activityEvent);
        };

        window.addEventListener('websocket-message' as any, handleWebSocketMessage);

        return () => {
            window.removeEventListener('websocket-message' as any, handleWebSocketMessage);
        };
    }, []);

    return (
        <Container>
            <Header>
                <Flex align="center" gap={8}>
                    <Title>Live Activity</Title>
                    <Badge status="processing" />
                </Flex>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                </Typography.Text>
            </Header>

            <FeedList ref={listRef}>
                {events.length === 0 ? (
                    <EmptyState>
                        <ApiOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                        <Typography.Text type="secondary">
                            Waiting for real-time events...
                        </Typography.Text>
                    </EmptyState>
                ) : (
                    events.map((event) => (
                        <FeedItem key={event.id} $type={event.type}>
                            <IconWrapper $type={event.type}>
                                {event.icon}
                            </IconWrapper>
                            <Content>
                                <Message>{event.message}</Message>
                                <Timestamp>{dayjs(event.timestamp).fromNow()}</Timestamp>
                            </Content>
                        </FeedItem>
                    ))
                )}
            </FeedList>
        </Container>
    );
};
