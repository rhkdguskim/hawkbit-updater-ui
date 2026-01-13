/**
 * Quick Filters Component
 * One-click filter buttons for updateStatus-based filtering
 * Clicking an active filter toggles it off (back to 'all')
 */
import React from 'react';
import { Space, Button, Tooltip } from 'antd';
import {
    ExclamationCircleOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    DisconnectOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const QuickFilterWrapper = styled(Space)`
    .ant-btn {
        border-radius: var(--ant-border-radius);
        
        &.active {
            background-color: var(--ant-color-primary-bg);
            border-color: var(--ant-color-primary);
            color: var(--ant-color-primary);
        }
    }
`;

export type QuickFilterType = 'error' | 'offline' | 'pending' | 'inSync' | 'all';

interface QuickFiltersProps {
    t: (key: string, options?: Record<string, unknown>) => string;
    activeFilter?: QuickFilterType;
    onFilterChange: (filter: QuickFilterType) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
    t,
    activeFilter = 'all',
    onFilterChange,
}) => {
    // Toggle filter: if clicking active filter, go back to 'all'
    const handleClick = (filter: QuickFilterType) => {
        if (activeFilter === filter) {
            onFilterChange('all');
        } else {
            onFilterChange(filter);
        }
    };

    return (
        <QuickFilterWrapper size="small" wrap>
            <Tooltip title={t('status.all', { defaultValue: 'Show all targets' })}>
                <Button
                    size="small"
                    className={activeFilter === 'all' ? 'active' : ''}
                    onClick={() => onFilterChange('all')}
                >
                    {t('common:actions.all', { defaultValue: 'All' })}
                </Button>
            </Tooltip>

            <Tooltip title={t('status.errorOnly', { defaultValue: 'Show error targets only' })}>
                <Button
                    size="small"
                    danger={activeFilter === 'error'}
                    className={activeFilter === 'error' ? 'active' : ''}
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => handleClick('error')}
                >
                    {t('status.error')}
                </Button>
            </Tooltip>

            <Tooltip title={t('status.offlineOnly', { defaultValue: 'Show offline targets only' })}>
                <Button
                    size="small"
                    className={activeFilter === 'offline' ? 'active' : ''}
                    icon={<DisconnectOutlined />}
                    onClick={() => handleClick('offline')}
                >
                    {t('status.offline')}
                </Button>
            </Tooltip>

            <Tooltip title={t('status.pendingOnly', { defaultValue: 'Show pending targets only' })}>
                <Button
                    size="small"
                    className={activeFilter === 'pending' ? 'active' : ''}
                    icon={<SyncOutlined />}
                    onClick={() => handleClick('pending')}
                >
                    {t('status.pending')}
                </Button>
            </Tooltip>

            <Tooltip title={t('status.inSyncOnly', { defaultValue: 'Show in-sync targets only' })}>
                <Button
                    size="small"
                    className={activeFilter === 'inSync' ? 'active' : ''}
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleClick('inSync')}
                >
                    {t('status.inSync')}
                </Button>
            </Tooltip>
        </QuickFilterWrapper>
    );
};

export default QuickFilters;
