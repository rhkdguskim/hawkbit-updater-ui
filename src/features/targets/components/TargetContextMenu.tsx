/**
 * Target Context Menu Component
 * Right-click context menu for quick actions
 */
import React from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    EyeOutlined,
    SendOutlined,
    TagOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    StopOutlined,
    DeleteOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import type { MgmtTarget } from '@/api/generated/model';

interface TargetContextMenuProps {
    children: React.ReactNode;
    target: MgmtTarget;
    t: (key: string, options?: Record<string, unknown>) => string;
    isAdmin: boolean;
    onView: () => void;
    onAssignDS: () => void;
    onAssignTags: () => void;
    onAssignType: () => void;
    onActivateAutoConfirm: () => void;
    onDeactivateAutoConfirm: () => void;
    onCopyId: () => void;
    onDelete: () => void;
}

export const TargetContextMenu: React.FC<TargetContextMenuProps> = ({
    children,
    target,
    t,
    isAdmin,
    onView,
    onAssignDS,
    onAssignTags,
    onAssignType,
    onActivateAutoConfirm,
    onDeactivateAutoConfirm,
    onCopyId,
    onDelete,
}) => {
    const items: MenuProps['items'] = [
        {
            key: 'view',
            label: t('actions.viewDetails'),
            icon: <EyeOutlined />,
            onClick: onView,
        },
        {
            key: 'copyId',
            label: t('contextMenu.copyControllerId', { defaultValue: 'Copy Controller ID' }),
            icon: <CopyOutlined />,
            onClick: onCopyId,
        },
        { type: 'divider' },
        {
            key: 'assignDS',
            label: t('detail.assignDS'),
            icon: <SendOutlined />,
            onClick: onAssignDS,
        },
        {
            key: 'assignTags',
            label: t('bulkAssign.assignTag'),
            icon: <TagOutlined />,
            onClick: onAssignTags,
        },
        {
            key: 'assignType',
            label: t('bulkAssign.assignType'),
            icon: <AppstoreOutlined />,
            onClick: onAssignType,
        },
        { type: 'divider' },
        {
            key: 'autoConfirm',
            label: t('autoConfirm.title'),
            icon: <CheckCircleOutlined />,
            children: [
                {
                    key: 'activateAutoConfirm',
                    label: t('autoConfirm.activate'),
                    icon: <CheckCircleOutlined />,
                    onClick: onActivateAutoConfirm,
                    disabled: target.autoConfirmActive,
                },
                {
                    key: 'deactivateAutoConfirm',
                    label: t('autoConfirm.deactivate'),
                    icon: <StopOutlined />,
                    onClick: onDeactivateAutoConfirm,
                    disabled: !target.autoConfirmActive,
                },
            ],
        },
        ...(isAdmin
            ? [
                { type: 'divider' as const },
                {
                    key: 'delete',
                    label: t('actions.delete'),
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: onDelete,
                },
            ]
            : []),
    ];

    return (
        <Dropdown
            menu={{ items }}
            trigger={['contextMenu']}
        >
            {children}
        </Dropdown>
    );
};

export default TargetContextMenu;
