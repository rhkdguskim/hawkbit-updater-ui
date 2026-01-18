import React from 'react';
import { Tag, Button } from 'antd';
import styled from 'styled-components';
import { MinusCircleOutlined } from '@ant-design/icons';

const ChipContainer = styled(Tag)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    margin: 4px;
    background: rgba(var(--color-primary-rgb), 0.08);
    border: 1px solid rgba(var(--color-primary-rgb), 0.2);
    color: var(--ant-color-primary);
    transition: all 0.2s ease;
    cursor: default;

    &:hover {
        background: rgba(var(--color-primary-rgb), 0.12);
        border-color: var(--ant-color-primary);
    }

    .filter-field {
        font-weight: 700;
        opacity: 0.8;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .filter-operator {
        color: var(--text-tertiary);
        font-weight: 500;
    }

    .filter-value {
        font-weight: 700;
        color: var(--text-title);
    }
`;

const RemoveButton = styled(Button)`
    &.ant-btn {
        padding: 0;
        width: 20px;
        height: 20px;
        min-width: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
        border: none;
        background: transparent;
        transition: all 0.2s ease;
        margin-left: 2px;
        
        &:hover {
            color: var(--ant-color-error);
            background: rgba(var(--color-error-rgb), 0.1);
            transform: scale(1.1);
        }
    }
`;

export interface FilterChipProps {
    field: string;
    operator: string;
    value: string;
    onRemove: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
    field,
    operator,
    value,
    onRemove,
}) => {
    return (
        <ChipContainer>
            <span className="filter-field">{field}</span>
            <span className="filter-operator">{operator}</span>
            <span className="filter-value">{value}</span>
            <RemoveButton
                type="text"
                size="small"
                icon={<MinusCircleOutlined style={{ fontSize: 16 }} />}
                onClick={onRemove}
            />
        </ChipContainer>
    );
};

export default FilterChip;
