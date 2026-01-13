/**
 * StatusIndicator Component
 * Enhanced status display with color dots and icons
 */
import React from 'react';
import { Space, Typography } from 'antd';
import styled, { keyframes, css } from 'styled-components';

const { Text } = Typography;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

interface StatusDotProps {
    $status: 'online' | 'offline' | 'unknown' | 'pending';
}

const StatusDot = styled.span<StatusDotProps>`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    
    ${({ $status }) => {
        switch ($status) {
            case 'online':
                return css`
                    background-color: var(--ant-color-success);
                    box-shadow: 0 0 0 2px var(--ant-color-success-bg);
                `;
            case 'offline':
                return css`
                    background-color: var(--ant-color-error);
                    box-shadow: 0 0 0 2px var(--ant-color-error-bg);
                `;
            case 'pending':
                return css`
                    background-color: var(--ant-color-primary);
                    box-shadow: 0 0 0 2px var(--ant-color-primary-bg);
                    animation: ${pulse} 1.5s ease-in-out infinite;
                `;
            default:
                return css`
                    background-color: var(--ant-color-text-quaternary);
                    box-shadow: 0 0 0 2px var(--ant-color-fill-quaternary);
                `;
        }
    }}
`;

const StatusWrapper = styled(Space)`
    display: inline-flex;
    align-items: center;
`;

interface StatusIndicatorProps {
    isOnline: boolean;
    neverConnected?: boolean;
    t: (key: string) => string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    isOnline,
    neverConnected,
    t,
}) => {
    const status = neverConnected ? 'unknown' : isOnline ? 'online' : 'offline';
    const label = neverConnected
        ? t('status.neverConnected')
        : isOnline
            ? t('status.online')
            : t('status.offline');

    return (
        <StatusWrapper size={6}>
            <StatusDot $status={status} />
            <Text style={{ fontSize: 12 }}>{label}</Text>
        </StatusWrapper>
    );
};

interface UpdateStatusIndicatorProps {
    updateStatus?: string;
    t: (key: string) => string;
}

export const UpdateStatusIndicator: React.FC<UpdateStatusIndicatorProps> = ({
    updateStatus,
    t,
}) => {
    const getStatus = (): StatusDotProps['$status'] => {
        switch (updateStatus) {
            case 'in_sync':
                return 'online';
            case 'pending':
                return 'pending';
            case 'error':
                return 'offline';
            default:
                return 'unknown';
        }
    };

    const getLabel = () => {
        switch (updateStatus) {
            case 'in_sync':
                return t('status.inSync');
            case 'pending':
                return t('status.pending');
            case 'error':
                return t('status.error');
            case 'registered':
                return t('status.registered');
            default:
                return t('status.unknown');
        }
    };

    return (
        <StatusWrapper size={6}>
            <StatusDot $status={getStatus()} />
            <Text style={{ fontSize: 12 }}>{getLabel()}</Text>
        </StatusWrapper>
    );
};

export default StatusIndicator;
