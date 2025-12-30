import React, { useState } from 'react';
import {
    Button,
    Space,
    message,
    Modal,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTargetTags,
    useDeleteTargetTag,
    useCreateTargetTags,
    useUpdateTargetTag,
    getGetTargetTagsQueryKey,
} from '@/api/generated/target-tags/target-tags';
import type { MgmtTag } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { ColorSwatch, TagFormModal } from '@/components/common';
import type { TagFormValues } from '@/components/common';
import { EnhancedTable } from '@/components/patterns';

const { Text } = Typography;

interface MgmtTagRequestBodyPost {
    name: string;
    description?: string;
    colour?: string;
}

const TargetTagList: React.FC = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<MgmtTag | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, refetch } = useGetTargetTags({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteTargetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.deleteSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const createMutation = useCreateTargetTags({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.createSuccess'));
                setDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const updateMutation = useUpdateTargetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.updateSuccess'));
                setDialogOpen(false);
                setEditingTag(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const handleCreate = (values: MgmtTagRequestBodyPost) => {
        createMutation.mutate({ data: [values] });
    };

    const handleUpdate = (values: MgmtTagRequestBodyPost) => {
        if (editingTag?.id) {
            updateMutation.mutate({ targetTagId: editingTag.id, data: values });
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t('tagManagement.deleteConfirmTitle'),
            content: t('tagManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ targetTagId: id }),
        });
    };

    const handleTableChange: TableProps<MgmtTag>['onChange'] = (newPagination) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        });
    };

    const columns: ColumnsType<MgmtTag> = [
        {
            title: t('common:id', { defaultValue: 'ID' }),
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
            render: (id) => <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{id}</Text>,
        },
        {
            title: t('table.name'),
            dataIndex: 'name',
            key: 'name',
            width: 180,
            sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
            render: (name: string, record) => (
                <Tag color={record.colour || 'default'}>{name}</Tag>
            ),
        },
        {
            title: t('form.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            sorter: (a, b) => (a.description ?? '').localeCompare(b.description ?? ''),
            render: (text) => <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{text || '-'}</Text>,
        },
        {
            title: t('tagManagement.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 120,
            render: (colour: string) => <ColorSwatch color={colour} />,
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0} className="action-cell">
                    <Tooltip title={t('common:actions.edit')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingTag(record);
                                setDialogOpen(true);
                            }}
                        />
                    </Tooltip>
                    {isAdmin && (
                        <Tooltip title={t('common:actions.delete')}>
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                        {t('common:actions.refresh')}
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingTag(null);
                            setDialogOpen(true);
                        }}
                    >
                        {t('tagManagement.add')}
                    </Button>
                </Space>
            </div>

            <EnhancedTable<MgmtTag>
                columns={columns}
                dataSource={data?.content || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    ...pagination,
                    total: data?.total || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                onChange={handleTableChange}
                scroll={{ x: 700 }}
            />

            <TagFormModal
                open={dialogOpen}
                mode={editingTag ? 'edit' : 'create'}
                initialData={editingTag}
                loading={createMutation.isPending || updateMutation.isPending}
                onSubmit={(values: TagFormValues) => editingTag ? handleUpdate(values) : handleCreate(values)}
                onCancel={() => {
                    setDialogOpen(false);
                    setEditingTag(null);
                }}
                translations={{
                    createTitle: t('tagManagement.createTitle'),
                    editTitle: t('tagManagement.editTitle'),
                    nameLabel: t('table.name'),
                    namePlaceholder: t('form.namePlaceholder'),
                    nameRequired: t('common:validation.required'),
                    descriptionLabel: t('form.description'),
                    descriptionPlaceholder: t('form.descriptionPlaceholder'),
                    colourLabel: t('tagManagement.colour'),
                    cancelText: t('common:actions.cancel'),
                }}
            />
        </Space>
    );
};

export default TargetTagList;
