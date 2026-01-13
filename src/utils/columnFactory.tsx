
import { Tag, Tooltip } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { TFunction } from 'i18next';
import dayjs from 'dayjs';
import { SmallText, SecondarySmallText, IdText, StrongSmallText } from '@/components/shared/Typography';
import { ActionCell, type ActionCellProps } from '@/components/common/ActionCell';
import { StatusTag } from '@/components/common/StatusTag';
import { EditableCell } from '@/components/common/EditableCell';
import { ColorSwatch } from '@/components/common/ColorSwatch';

/**
 * Creates a standard ID column
 */
export function createIdColumn<T>(t: TFunction): ColumnType<T> {
    return {
        title: t('common:table.id'),
        dataIndex: 'id',
        key: 'id',
        width: 80,
        sorter: true,
        render: (id: number | string) => <IdText>{id}</IdText>,
    };
}

/**
 * Creates a standard name column that can be colored
 */
export function createColoredNameColumn<T extends { id?: number | string; name?: string; colour?: string }>(options: {
    t: TFunction;
    width?: number;
    editable?: boolean;
    onEdit?: (record: T, value: string) => void | Promise<void>;
    onClick?: (record: T) => void;
    useTag?: boolean;
}): ColumnType<T> {
    const { t, width = 200, editable = false, onEdit, onClick, useTag = true } = options;

    return {
        title: t('common:table.name', { defaultValue: 'Name' }),
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width,
        render: (text: string, record: T) => {
            const name = text || String(record.id || '');
            const content = useTag ? (
                <Tag color={record.colour || 'default'} style={{ margin: 0, fontSize: 'var(--ant-font-size-sm)' }}>
                    {name}
                </Tag>
            ) : (
                <StrongSmallText style={{ color: record.colour }}>{name}</StrongSmallText>
            );

            if (editable && onEdit) {
                return (
                    <EditableCell
                        value={text || ''}
                        onSave={async (val) => { await onEdit(record, val); }}
                        editable
                        renderDisplay={() => content}
                    />
                );
            }
            if (onClick) {
                return (
                    <a onClick={(e) => { e.stopPropagation(); onClick(record); }}>
                        {content}
                    </a>
                );
            }
            return content;
        },
    };
}

/**
 * Creates a standard name column
 */
export function createNameColumn<T extends { id?: number | string; name?: string }>(options: {
    t: TFunction;
    width?: number;
    editable?: boolean;
    onEdit?: (record: T, value: string) => void | Promise<void>;
    onClick?: (record: T) => void;
}): ColumnType<T> {
    const { t, width = 200, editable = false, onEdit, onClick } = options;

    return {
        title: t('common:table.name', { defaultValue: 'Name' }),
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width,
        render: (text: string, record: T) => {
            if (editable && onEdit) {
                return (
                    <EditableCell
                        value={text || ''}
                        onSave={async (val) => { await onEdit(record, val); }}
                        editable
                    />
                );
            }
            if (onClick) {
                return (
                    <a onClick={(e) => { e.stopPropagation(); onClick(record); }}>
                        <StrongSmallText>{text}</StrongSmallText>
                    </a>
                );
            }
            return <StrongSmallText>{text}</StrongSmallText>;
        },
    };
}

/**
 * Creates a standard description column
 */
export function createDescriptionColumn<T>(options: {
    t: TFunction;
    editable?: boolean;
    onEdit?: (record: T, value: string) => void | Promise<void>;
}): ColumnType<T> {
    const { t, editable = false, onEdit } = options;

    return {
        title: t('common:table.description', { defaultValue: 'Description' }),
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        render: (text: string, record: T) => {
            if (editable && onEdit) {
                return (
                    <EditableCell
                        value={text || ''}
                        onSave={async (val) => { await onEdit(record, val); }}
                        editable
                        secondary
                    />
                );
            }
            return <SecondarySmallText>{text || '-'}</SecondarySmallText>;
        },
    };
}

/**
 * Creates a standard status column using StatusTag
 */
export function createStatusColumn<T>(options: {
    t: TFunction;
    width?: number;
    showIcon?: boolean;
    dataIndex?: string;
}): ColumnType<T> {
    const { t, width = 130, showIcon = false, dataIndex = 'status' } = options;

    return {
        title: t('common:table.status', { defaultValue: 'Status' }),
        dataIndex,
        key: 'status',
        width,
        render: (status: string) => <StatusTag status={status} showIcon={showIcon} />,
    };
}

/**
 * Creates a standard date column (createdAt or lastModifiedAt)
 */
export function createDateColumn<T>(options: {
    t: TFunction;
    dataIndex: 'createdAt' | 'lastModifiedAt';
    width?: number;
    format?: string;
    showRelative?: boolean;
}): ColumnType<T> {
    const {
        t,
        dataIndex,
        width = 130,
        format = 'YYYY-MM-DD HH:mm',
        showRelative = false,
    } = options;

    const titleKey = dataIndex === 'createdAt' ? 'common:table.createdAt' : 'common:table.lastModifiedAt';

    return {
        title: t(titleKey, { defaultValue: dataIndex === 'createdAt' ? 'Created At' : 'Last Modified' }),
        dataIndex,
        key: dataIndex,
        width,
        sorter: true,
        render: (val: number | string) => {
            if (!val) return <SecondarySmallText>-</SecondarySmallText>;

            if (showRelative) {
                return (
                    <Tooltip title={dayjs(val).format(format)}>
                        <SmallText>{dayjs(val).fromNow()}</SmallText>
                    </Tooltip>
                );
            }
            return <SmallText>{dayjs(val).format(format)}</SmallText>;
        },
    };
}

/**
 * Creates a standard version column with tag styling
 */
export function createVersionColumn<T>(options: {
    t: TFunction;
    width?: number;
    color?: string;
}): ColumnType<T> {
    const { t, width = 100, color = 'blue' } = options;

    return {
        title: t('common:table.version', { defaultValue: 'Version' }),
        dataIndex: 'version',
        key: 'version',
        width,
        sorter: true,
        render: (text: string) => <Tag color={color}>{text}</Tag>,
    };
}

/**
 * Creates a standard type column with tag styling
 */
export function createTypeColumn<T>(options: {
    t: TFunction;
    width?: number;
    dataIndex?: string;
    color?: string | ((record: T) => string | undefined);
}): ColumnType<T> {
    const { t, width = 120, dataIndex = 'typeName', color = 'blue' } = options;

    return {
        title: t('common:table.type', { defaultValue: 'Type' }),
        dataIndex,
        key: 'type',
        width,
        render: (text: string, record: T) => {
            const resolvedColor = typeof color === 'function' ? color(record) : color;
            return (
                <Tag color={resolvedColor || 'default'}>{text || t('common:notSelected')}</Tag>
            );
        },
    };
}

/**
 * Creates a standard color swatch column
 */
export function createColorColumn<T>(options: {
    t: TFunction;
    width?: number;
}): ColumnType<T> {
    const { t, width = 100 } = options;

    return {
        title: t('common:table.color', { defaultValue: 'Color' }),
        dataIndex: 'colour',
        key: 'colour',
        width,
        render: (colour: string) => <ColorSwatch color={colour} />,
    };
}

/**
 * Creates a standard actions column
 */
export function createActionsColumn<T extends { id?: number | string }>(options: {
    t: TFunction;
    width?: number;
    onView?: (record: T) => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    canEdit?: boolean | ((record: T) => boolean);
    canDelete?: boolean | ((record: T) => boolean);
    extra?: (record: T) => ActionCellProps['extra'];
}): ColumnType<T> {
    const {
        t,
        width = 100,
        onView,
        onEdit,
        onDelete,
        canEdit = true,
        canDelete = true,
        extra,
    } = options;

    return {
        title: t('common:table.actions'),
        key: 'actions',
        width,
        fixed: 'right',
        render: (_: unknown, record: T) => {
            const resolvedCanEdit = typeof canEdit === 'function' ? canEdit(record) : canEdit;
            const resolvedCanDelete = typeof canDelete === 'function' ? canDelete(record) : canDelete;

            return (
                <ActionCell
                    onView={onView ? () => onView(record) : undefined}
                    onEdit={onEdit ? () => onEdit(record) : undefined}
                    onDelete={onDelete ? () => onDelete(record) : undefined}
                    canEdit={resolvedCanEdit}
                    canDelete={resolvedCanDelete}
                    extra={extra?.(record)}
                />
            );
        },
    };
}

/**
 * Creates a standard tag name column with color
 */
export function createTagNameColumn<T extends { name?: string; colour?: string }>(options: {
    t: TFunction;
    width?: number;
}): ColumnType<T> {
    const { t, width = 180 } = options;

    return {
        title: t('common:table.name', { defaultValue: 'Name' }),
        dataIndex: 'name',
        key: 'name',
        width,
        sorter: true,
        render: (name: string, record: T) => (
            <Tag color={record.colour || 'default'} style={{ margin: 0, fontSize: 'var(--ant-font-size-sm)' }}>
                {name}
            </Tag>
        ),
    };
}

/**
 * Creates multiple standard columns at once
 */
export function createStandardColumns<T extends { id?: number | string }>(options: {
    t: TFunction;
    include: ('id' | 'name' | 'description' | 'status' | 'createdAt' | 'lastModifiedAt' | 'actions')[];
    nameOptions?: Parameters<typeof createNameColumn<T>>[0];
    statusOptions?: Parameters<typeof createStatusColumn<T>>[0];
    actionsOptions?: Parameters<typeof createActionsColumn<T>>[0];
}): ColumnsType<T> {
    const { t, include, nameOptions = {}, statusOptions = {}, actionsOptions } = options;
    const columns: ColumnsType<T> = [];

    if (include.includes('id')) {
        columns.push(createIdColumn<T>(t));
    }
    if (include.includes('name')) {
        columns.push(createNameColumn<T>({ ...nameOptions, t }));
    }
    if (include.includes('description')) {
        columns.push(createDescriptionColumn<T>({ t }));
    }
    if (include.includes('status')) {
        columns.push(createStatusColumn<T>({ ...statusOptions, t }));
    }
    if (include.includes('createdAt')) {
        columns.push(createDateColumn<T>({ t, dataIndex: 'createdAt' }));
    }
    if (include.includes('lastModifiedAt')) {
        columns.push(createDateColumn<T>({ t, dataIndex: 'lastModifiedAt' }));
    }
    if (include.includes('actions') && actionsOptions) {
        columns.push(createActionsColumn<T>({ ...actionsOptions, t }));
    }

    return columns;
}
