/**
 * Unified Target List Configuration
 * Single source of truth for columns, filters, and sorting
 */

import { Tag, Space, Tooltip, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
    EyeOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MgmtTarget, MgmtTargetType, MgmtTag } from '@/api/generated/model';
import dayjs from 'dayjs';
import { isTargetOnline } from '@/entities';
import { TargetTagsCell, TargetTypeCell, InstalledModulesCell, StatusIndicator } from '../components';
import { Highlighter } from '@/components/common/Highlighter';

const { Text } = Typography;

export interface ColumnConfig {
    key: string;
    defaultVisible: boolean;
    sortable: boolean;
    filterable: boolean;
}

// All available columns with their configuration
export const COLUMN_CONFIG: ColumnConfig[] = [
    { key: 'name', defaultVisible: true, sortable: true, filterable: true },
    { key: 'ipAddress', defaultVisible: true, sortable: false, filterable: true },
    { key: 'targetType', defaultVisible: true, sortable: false, filterable: true },
    { key: 'tags', defaultVisible: true, sortable: false, filterable: true },
    { key: 'status', defaultVisible: true, sortable: false, filterable: true },
    { key: 'updateStatus', defaultVisible: true, sortable: false, filterable: true },
    { key: 'installedDS', defaultVisible: true, sortable: false, filterable: false },
    { key: 'lastControllerRequestAt', defaultVisible: true, sortable: true, filterable: false },
    { key: 'autoConfirmActive', defaultVisible: false, sortable: false, filterable: true },
    { key: 'lastModifiedAt', defaultVisible: false, sortable: true, filterable: false },
    { key: 'createdAt', defaultVisible: false, sortable: true, filterable: false },
    { key: 'securityToken', defaultVisible: false, sortable: false, filterable: false },
    { key: 'address', defaultVisible: false, sortable: false, filterable: false },
    { key: 'actions', defaultVisible: true, sortable: false, filterable: false },
];

// Allowed sort fields for API
export const ALLOWED_SORT_FIELDS = ['name', 'controllerId', 'lastModifiedAt', 'createdAt', 'lastControllerRequestAt'];

// Helper functions
const getUpdateStatusTag = (updateStatus: string | undefined, t: (key: string) => string) => {
    switch (updateStatus) {
        case 'in_sync':
            return <Tag icon={<CheckCircleOutlined />} color="success">{t('status.inSync')}</Tag>;
        case 'pending':
            return <Tag icon={<SyncOutlined spin />} color="processing">{t('status.pending')}</Tag>;
        case 'error':
            return <Tag icon={<CloseCircleOutlined />} color="error">{t('status.error')}</Tag>;
        case 'registered':
            return <Tag icon={<ExclamationCircleOutlined />} color="default">{t('status.registered')}</Tag>;
        default:
            return <Tag icon={<ExclamationCircleOutlined />} color="default">{t('status.unknown')}</Tag>;
    }
};

const getInstalledDsInfo = (record: MgmtTarget) => {
    const link = record._links?.installedDS;
    if (!link) return undefined;
    const resolved = Array.isArray(link) ? link[0] : link;
    const id = (resolved as { href?: string })?.href?.split('/').pop();
    const label = (resolved as { name?: string; title?: string })?.name ||
        (resolved as { title?: string })?.title || id;
    return id ? { id, label: label || id } : undefined;
};

export interface GetColumnsOptions {
    t: (key: string, options?: Record<string, unknown>) => string;
    isAdmin: boolean;
    availableTypes: MgmtTargetType[];
    availableTags?: MgmtTag[];
    visibleColumns?: string[];
    alwaysShowActions?: boolean;
    onView: (target: MgmtTarget) => void;
    onDelete: (target: MgmtTarget) => void;
    onCopySecurityToken?: (token: string) => void;
    searchTerm?: string;
}

export const getTargetColumns = ({
    t,
    isAdmin,
    availableTypes,
    availableTags,
    visibleColumns,
    alwaysShowActions = false,
    onView,
    onDelete,
    onCopySecurityToken,
    searchTerm,
}: GetColumnsOptions): ColumnsType<MgmtTarget> => {
    const allColumns: ColumnsType<MgmtTarget> = [
        {
            title: t('table.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            width: 220,
            render: (_: string, record) => (
                <Tooltip title={record.description || undefined}>
                    <Text strong ellipsis style={{ maxWidth: 200, fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)' }}>
                        <Highlighter text={record.name || record.controllerId} search={searchTerm} />
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: t('table.ipAddress'),
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 130,
            render: (ipAddress: string | undefined) => (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)' }}>
                    <Highlighter text={ipAddress} search={searchTerm} />
                </Text>
            ),
        },
        {
            title: t('table.targetType'),
            dataIndex: 'targetTypeName',
            key: 'targetType',
            width: 140,
            render: (_, record) => {
                const typeColour = availableTypes?.find(tp => tp.id === record.targetType)?.colour;
                return (
                    <TargetTypeCell
                        controllerId={record.controllerId!}
                        currentTypeId={record.targetType}
                        currentTypeName={record.targetTypeName}
                        currentTypeColour={typeColour}
                    />
                );
            },
        },
        {
            title: t('table.tags'),
            key: 'tags',
            width: 180,
            render: (_, record) => (
                <TargetTagsCell
                    controllerId={record.controllerId!}
                    availableTags={availableTags}
                />
            ),
        },
        {
            title: t('table.status'),
            key: 'status',
            width: 100,
            render: (_, record) => (
                <StatusIndicator
                    isOnline={isTargetOnline(record)}
                    neverConnected={!record.pollStatus?.lastRequestAt}
                    t={t}
                />
            ),
        },
        {
            title: t('table.updateStatus'),
            dataIndex: 'updateStatus',
            key: 'updateStatus',
            width: 110,
            render: (status: string) => getUpdateStatusTag(status, t),
        },
        {
            title: t('table.installedDS'),
            key: 'installedDS',
            width: 180,
            render: (_, record) => {
                const dsInfo = getInstalledDsInfo(record);
                return dsInfo ? (
                    <Space direction="vertical" size={0}>
                        <Link to={`/distributions/sets/${dsInfo.id}`}>
                            <Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }}>{dsInfo.label}</Text>
                        </Link>
                        <InstalledModulesCell distributionSetId={Number(dsInfo.id)} />
                    </Space>
                ) : (
                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>-</Text>
                );
            },
        },
        {
            title: t('table.lastControllerRequest'),
            dataIndex: 'lastControllerRequestAt',
            key: 'lastControllerRequestAt',
            sorter: true,
            width: 150,
            render: (value: number | undefined) =>
                value ? (
                    <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--ant-font-size-sm)' }}>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
                ) : (
                    <Text type="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--ant-font-size-sm)' }}>-</Text>
                ),
        },
        {
            title: t('table.autoConfirm'),
            dataIndex: 'autoConfirmActive',
            key: 'autoConfirmActive',
            width: 100,
            render: (value: boolean | undefined) =>
                value ? (
                    <Tag color="green">{t('autoConfirm.enabled')}</Tag>
                ) : (
                    <Tag>{t('autoConfirm.disabled')}</Tag>
                ),
        },
        {
            title: t('table.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            sorter: true,
            width: 150,
            render: (value: number | undefined) =>
                value ? (
                    <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--ant-font-size-sm)' }}>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
                ) : (
                    <Text type="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--ant-font-size-sm)' }}>-</Text>
                ),
        },
        {
            title: t('overview.created', { defaultValue: 'Created' }),
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            width: 150,
            render: (value: number | undefined) =>
                value ? (
                    <Text style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--ant-font-size-sm)' }}>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
                ) : (
                    <Text type="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--ant-font-size-sm)' }}>-</Text>
                ),
        },
        {
            title: t('overview.securityToken'),
            dataIndex: 'securityToken',
            key: 'securityToken',
            width: 120,
            render: (token: string | undefined) =>
                token && isAdmin && onCopySecurityToken ? (
                    <Tooltip title={token}>
                        <Button
                            type="link"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => onCopySecurityToken(token)}
                        >
                            {t('common:actions.copy', { defaultValue: 'Copy' })}
                        </Button>
                    </Tooltip>
                ) : (
                    <Text type="secondary">-</Text>
                ),
        },
        {
            title: t('overview.address'),
            dataIndex: 'address',
            key: 'address',
            width: 200,
            render: (address: string | undefined) => (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{address || '-'}</Text>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Space
                    size="small"
                    className={alwaysShowActions ? '' : 'hover-action-cell'}
                >
                    <Tooltip title={t('actions.viewDetails')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    {isAdmin && (
                        <Tooltip title={t('actions.delete')}>
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => onDelete(record)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    // Filter columns based on visibility
    if (visibleColumns && visibleColumns.length > 0) {
        return allColumns.filter(col =>
            col.key === 'actions' || visibleColumns.includes(col.key as string)
        );
    }

    // Return default visible columns
    const defaultVisibleKeys = COLUMN_CONFIG
        .filter(c => c.defaultVisible)
        .map(c => c.key);

    return allColumns.filter(col =>
        defaultVisibleKeys.includes(col.key as string)
    );
};

// Filter field configuration
export interface FilterFieldConfig {
    key: string;
    type: 'text' | 'select' | 'dateRange';
    fiqlField?: string; // Optional mapping to API field
}

export const FILTER_FIELD_CONFIG: FilterFieldConfig[] = [
    { key: 'name', type: 'text' },
    { key: 'controllerId', type: 'text' },
    { key: 'ipAddress', type: 'text' },
    { key: 'description', type: 'text' },
    { key: 'targetType', type: 'select', fiqlField: 'targetTypeName' },
    { key: 'tag', type: 'select', fiqlField: 'tag' },
    { key: 'updateStatus', type: 'select' },
    { key: 'autoConfirmActive', type: 'select' },
    { key: 'status', type: 'select' },
    { key: 'createdAt', type: 'dateRange' },
    { key: 'lastModifiedAt', type: 'dateRange' },
];
