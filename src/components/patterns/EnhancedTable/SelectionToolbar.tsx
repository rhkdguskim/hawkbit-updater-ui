import React from 'react';
import { Space, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
    SelectionBarContainer as ToolbarContainer,
    SelectionBarText as SelectionText,
    SelectionBarDivider as Separator,
    SelectionActionButton as StyledButton,
    SelectionCloseButton as CloseButton
} from '@/components/shared/SelectionStyles';



const SelectionInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--ant-color-primary);
`;

const ActionGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
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
                <SelectionText>
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
