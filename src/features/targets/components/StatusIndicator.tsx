/**
 * StatusIndicator Component
 * Enhanced status display with color dots and icons
 */
import React from 'react';
import { Space, Typography } from 'antd';
import styled, { keyframes, css } from 'styled-components';

const { Text } = Typography;

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(var(--ant-color-primary-rgb), 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(var(--ant-color-primary-rgb), 0); }
    100% { box-shadow: 0 0 0 0 rgba(var(--ant-color-primary-rgb), 0); }
`;

interface StatusDotProps {
    $status: 'online' | 'offline' | 'unknown' | 'pending';
}

const StatusDot = styled.span<StatusDotProps>`
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    
    ${({ $status }) => {
        switch ($status) {
            case 'online':
                return css`
                    background-color: var(--ant-color-success);
                    box-shadow: 0 0 4px var(--ant-color-success); /* LED Glow */
                `;
            case 'offline':
                return css`
                    background-color: var(--ant-color-text-tertiary); /* Dimmed for offline */
                    border: 1px solid var(--ant-color-border);
                `;
            case 'pending':
                return css`
                    background-color: var(--ant-color-primary);
                    animation: ${pulse} 2s infinite;
                `;
            default:
                return css`
                    background-color: transparent;
                    border: 1px solid var(--ant-color-text-quaternary);
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
        <StatusWrapper size={8}>
            <StatusDot $status={status} />
            <Text style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</Text>
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
                return 'offline'; // Reuse offline color (red usually defined in global) for simple error dot, or add specific error type
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

    // Override error style in dot logic if needed, or stick to simple mapping

    return (
        <StatusWrapper size={8}>
            <StatusDot $status={getStatus()} style={updateStatus === 'error' ? { backgroundColor: 'var(--ant-color-error)', boxShadow: 'none' } : {}} />
            <Text style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{getLabel()}</Text>
        </StatusWrapper>
    );
};

export default StatusIndicator;
