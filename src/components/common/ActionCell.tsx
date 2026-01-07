import React from 'react';
import { Space, Button, Tooltip } from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export interface ActionButton {
    key: string;
    icon: React.ReactNode;
    tooltip: string;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
    loading?: boolean;
    hidden?: boolean;
}

export interface ActionCellProps {
    /** View action callback */
    onView?: () => void;
    /** Edit action callback */
    onEdit?: () => void;
    /** Delete action callback */
    onDelete?: () => void;
    /** Whether edit action is allowed */
    canEdit?: boolean;
    /** Whether delete action is allowed */
    canDelete?: boolean;
    /** Custom tooltip for view action */
    viewTooltip?: string;
    /** Custom tooltip for edit action */
    editTooltip?: string;
    /** Custom tooltip for delete action */
    deleteTooltip?: string;
    /** Additional custom action buttons */
    extra?: ActionButton[];
    /** Size of the buttons */
    size?: 'small' | 'middle' | 'large';
}

/**
 * Standardized action cell component for table rows.
 * Provides consistent action buttons (view, edit, delete) across all list pages.
 */
export const ActionCell: React.FC<ActionCellProps> = ({
    onView,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
    viewTooltip,
    editTooltip,
    deleteTooltip,
    extra = [],
    size = 'small',
}) => {
    const { t } = useTranslation(['common']);

    const defaultViewTooltip = viewTooltip || t('actions.view');
    const defaultEditTooltip = editTooltip || t('actions.edit');
    const defaultDeleteTooltip = deleteTooltip || t('actions.delete');

    return (
        <Space size={0} className="action-cell">
            {onView && (
                <Tooltip title={defaultViewTooltip}>
                    <Button
                        type="text"
                        size={size}
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onView();
                        }}
                    />
                </Tooltip>
            )}
            {onEdit && canEdit && (
                <Tooltip title={defaultEditTooltip}>
                    <Button
                        type="text"
                        size={size}
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                    />
                </Tooltip>
            )}
            {extra.map((action) =>
                action.hidden ? null : (
                    <Tooltip key={action.key} title={action.tooltip}>
                        <Button
                            type="text"
                            size={size}
                            icon={action.icon}
                            danger={action.danger}
                            disabled={action.disabled}
                            loading={action.loading}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                            }}
                        />
                    </Tooltip>
                )
            )}
            {onDelete && canDelete && (
                <Tooltip title={defaultDeleteTooltip}>
                    <Button
                        type="text"
                        size={size}
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    />
                </Tooltip>
            )}
        </Space>
    );
};

export default ActionCell;
