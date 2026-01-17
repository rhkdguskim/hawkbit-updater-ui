import React from 'react';
import { Space, Button, Typography, Divider } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const ToolbarContainer = styled.div`
    position: sticky;
    top: 8px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--ant-color-primary);
    border-left: 4px solid var(--ant-color-primary);
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: var(--shadow-lg);
    animation: fadeInUp 0.3s var(--transition-gentle);

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const SelectionInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--ant-color-primary);
`;

const SelectionText = styled(Text)`
    && {
        color: var(--ant-color-primary);
        font-size: var(--ant-font-size);
        font-weight: 600;
        letter-spacing: -0.01em;
    }
`;

const Separator = styled(Divider)`
    && {
        border-color: rgba(var(--primary-rgb), 0.2);
        height: 20px;
    }
`;

const ActionGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StyledButton = styled(Button)`
    &.ant-btn {
        background: rgba(var(--primary-rgb), 0.05);
        border: 1px solid rgba(var(--primary-rgb), 0.2);
        color: var(--ant-color-primary);
        font-weight: 600;
        border-radius: 6px !important;

        &:hover {
            background: rgba(var(--primary-rgb), 0.1);
            border-color: var(--ant-color-primary);
            color: var(--ant-color-primary);
            transform: translateY(-1px);
        }

        &.ant-btn-dangerous {
            background: rgba(255, 77, 79, 0.1);
            border-color: rgba(255, 77, 79, 0.3);
            color: #ff4d4f;

            &:hover {
                background: #ff4d4f;
                color: white;
                border-color: #ff4d4f;
            }
        }
    }
`;

const CloseButton = styled(Button)`
    &.ant-btn {
        color: var(--ant-color-text-secondary);
        opacity: 0.6;

        &:hover {
            opacity: 1;
            background: rgba(var(--primary-rgb), 0.05);
            color: var(--ant-color-primary);
        }
    }
`;

export interface ToolbarAction {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
}

export interface SelectionToolbarProps {
    selectedCount: number;
    actions: ToolbarAction[];
    onClearSelection?: () => void;
    selectionLabel?: string;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
    selectedCount,
    actions,
    onClearSelection,
    selectionLabel,
}) => {
    const { t } = useTranslation('common');

    if (selectedCount === 0) return null;

    const label = selectionLabel || t('filter.selected');

    return (
        <ToolbarContainer>
            <SelectionInfo>
                <SelectionText strong>
                    {selectedCount} {label}
                </SelectionText>
                <Separator type="vertical" />
            </SelectionInfo>

            <ActionGroup>
                <Space size="small">
                    {actions.map((action) => (
                        <StyledButton
                            key={action.key}
                            icon={action.icon}
                            onClick={action.onClick}
                            danger={action.danger}
                            disabled={action.disabled}
                            size="small"
                        >
                            {action.label}
                        </StyledButton>
                    ))}
                </Space>

                {onClearSelection && (
                    <CloseButton
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClearSelection}
                        size="small"
                    />
                )}
            </ActionGroup>
        </ToolbarContainer>
    );
};

export default SelectionToolbar;
