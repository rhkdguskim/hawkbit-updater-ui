/**
 * Generic Status Quick Filters Component
 * Reusable across different list pages (Rollouts, Actions, etc.)
 */
import React from 'react';
import { Space, Button, Tooltip, Tag } from 'antd';
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

export interface StatusFilterOption {
    key: string;
    label: string;
    tooltip?: string;
    icon?: React.ReactNode;
    color?: 'default' | 'success' | 'processing' | 'error' | 'warning';
    danger?: boolean;
}

interface StatusQuickFiltersProps {
    t: (key: string, options?: Record<string, unknown>) => string;
    options: StatusFilterOption[];
    activeFilter?: string;
    onFilterChange: (filter: string) => void;
    allLabel?: string;
    allTooltip?: string;
}

export const StatusQuickFilters: React.FC<StatusQuickFiltersProps> = ({
    t,
    options,
    activeFilter = 'all',
    onFilterChange,
    allLabel,
    allTooltip,
}) => {
    return (
        <QuickFilterWrapper size="small" wrap>
            <Tooltip title={allTooltip || t('common:actions.showAll', { defaultValue: 'Show all' })}>
                <Button
                    size="small"
                    className={activeFilter === 'all' ? 'active' : ''}
                    onClick={() => onFilterChange('all')}
                >
                    {allLabel || t('common:actions.all', { defaultValue: 'All' })}
                </Button>
            </Tooltip>

            {options.map(option => (
                <Tooltip key={option.key} title={option.tooltip || option.label}>
                    <Button
                        size="small"
                        danger={option.danger || activeFilter === option.key && option.color === 'error'}
                        className={activeFilter === option.key ? 'active' : ''}
                        icon={option.icon}
                        onClick={() => onFilterChange(option.key)}
                    >
                        {option.color ? (
                            <Tag color={option.color} style={{ margin: 0, border: 'none', background: 'transparent' }}>
                                {option.label}
                            </Tag>
                        ) : (
                            option.label
                        )}
                    </Button>
                </Tooltip>
            ))}
        </QuickFilterWrapper>
    );
};

export default StatusQuickFilters;
