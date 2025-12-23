import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { getStatusColor, getStatusLabel } from '@/utils/statusUtils';
import {
    SyncOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    PauseCircleOutlined,

} from '@ant-design/icons';

interface StatusTagProps {
    status?: string;
    showIcon?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

const getStatusIcon = (status?: string) => {
    if (!status) return undefined;
    switch (status.toLowerCase()) {
        case 'running':
        case 'processing':
        case 'starting':
        case 'retrieving':
        case 'downloading':
            return <SyncOutlined spin />;
        case 'finished':
        case 'completed':
        case 'success':
            return <CheckCircleOutlined />;
        case 'error':
        case 'failed':
        case 'canceled':
            return <CloseCircleOutlined />;
        case 'waiting_for_approval':
        case 'scheduled':
        case 'pending':
            return <ClockCircleOutlined />;
        case 'paused':
            return <PauseCircleOutlined />;
        default:
            return undefined;
    }
};

export const StatusTag: React.FC<StatusTagProps> = ({ status, showIcon = false, style, className }) => {
    const { t } = useTranslation(['common']);

    if (!status) return null;

    const color = getStatusColor(status);
    const label = getStatusLabel(status, t);
    const icon = showIcon ? getStatusIcon(status) : undefined;

    return (
        <Tag color={color} icon={icon} style={{ borderRadius: 999, ...style }} className={className}>
            {label}
        </Tag>
    );
};
