import React from 'react';
import { Badge, Tooltip } from 'antd';
import { WifiOutlined, DisconnectOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { WebSocketConnectionState } from '@/api/websocket/types';

const pulse = keyframes`
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
`;

const Container = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border);
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--ant-color-primary-border);
    }
`;

const IconWrapper = styled.span<{ $state: WebSocketConnectionState }>`
    display: flex;
    align-items: center;
    color: ${props => {
        switch (props.$state) {
            case 'CONNECTED': return 'var(--ant-color-success)';
            case 'CONNECTING': return 'var(--ant-color-warning)';
            case 'ERROR': return 'var(--ant-color-error)';
            case 'DISCONNECTED': return 'var(--ant-color-text-quaternary)';
        }
    }};

    ${props => props.$state === 'CONNECTING' && css`
        animation: ${pulse} 1.5s ease-in-out infinite;
    `}
`;

const StatusText = styled.span`
    font-weight: 500;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

interface WebSocketIndicatorProps {
    showLabel?: boolean;
}

export const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({ showLabel = true }) => {
    const { connectionState } = useWebSocket();

    const getIcon = () => {
        switch (connectionState) {
            case 'CONNECTED':
                return <WifiOutlined />;
            case 'CONNECTING':
                return <LoadingOutlined />;
            case 'ERROR':
                return <WarningOutlined />;
            case 'DISCONNECTED':
                return <DisconnectOutlined />;
        }
    };

    const getStatusText = () => {
        switch (connectionState) {
            case 'CONNECTED':
                return 'Live';
            case 'CONNECTING':
                return 'Connecting';
            case 'ERROR':
                return 'Error';
            case 'DISCONNECTED':
                return 'Offline';
        }
    };

    const getTooltipText = () => {
        switch (connectionState) {
            case 'CONNECTED':
                return 'Real-time updates active';
            case 'CONNECTING':
                return 'Establishing connection...';
            case 'ERROR':
                return 'Connection error - using backup mode';
            case 'DISCONNECTED':
                return 'Disconnected - using backup mode';
        }
    };

    const getBadgeStatus = () => {
        switch (connectionState) {
            case 'CONNECTED':
                return 'success' as const;
            case 'CONNECTING':
                return 'processing' as const;
            case 'ERROR':
                return 'error' as const;
            case 'DISCONNECTED':
                return 'default' as const;
        }
    };

    return (
        <Tooltip title={getTooltipText()} placement="bottom">
            <Container>
                <Badge status={getBadgeStatus()} />
                <IconWrapper $state={connectionState}>
                    {getIcon()}
                </IconWrapper>
                {showLabel && <StatusText>{getStatusText()}</StatusText>}
            </Container>
        </Tooltip>
    );
};
