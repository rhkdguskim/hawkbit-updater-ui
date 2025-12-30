import React, { useState } from 'react';
import {
    Button,
    Space,
    message,
    Popconfirm,
    Tag,
    Typography,
    Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTargetTypes,
    useDeleteTargetType,
    useCreateTargetTypes,
    useUpdateTargetType,
    useAddCompatibleDistributionSets,
    useRemoveCompatibleDistributionSet,
    getCompatibleDistributionSets,
    getGetTargetTypesQueryKey,
    getGetCompatibleDistributionSetsQueryKey,
} from '@/api/generated/target-types/target-types';
import type { MgmtTargetType, MgmtTargetTypeRequestBodyPost, MgmtTargetTypeRequestBodyPut } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { ColorSwatch } from '@/components/common';
import { EnhancedTable } from '@/components/patterns';
import TargetTypeDialog from './TargetTypeDialog';

const { Text } = Typography;

const TargetTypeList: React.FC = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtTargetType | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading } = useGetTargetTypes({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteTargetType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.deleteSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const createMutation = useCreateTargetTypes({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const updateMutation = useUpdateTargetType({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const addCompatibleMutation = useAddCompatibleDistributionSets({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const removeCompatibleMutation = useRemoveCompatibleDistributionSet({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const handleCreate = async (values: MgmtTargetTypeRequestBodyPost, compatibleDsTypeIds?: number[]) => {
        try {
            // Create the target type with compatible DS types
            const createData: MgmtTargetTypeRequestBodyPost = {
                ...values,
                compatibledistributionsettypes: compatibleDsTypeIds?.map(id => ({ id })),
            };

            await createMutation.mutateAsync({ data: [createData] });

            message.success(t('typeManagement.createSuccess'));
            setDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
        } catch {
            // Error handled in mutation
        }
    };

    const handleUpdate = async (values: MgmtTargetTypeRequestBodyPut, compatibleDsTypeIds?: number[]) => {
        if (!editingType?.id) return;

        try {
            // First update the target type basic info
            await updateMutation.mutateAsync({ targetTypeId: editingType.id, data: values });

            // Then handle compatible DS types
            // Get current compatible DS types
            const currentCompatible = await queryClient.fetchQuery({
                queryKey: getGetCompatibleDistributionSetsQueryKey(editingType.id),
                queryFn: () => getCompatibleDistributionSets(editingType.id),
                staleTime: 0,
            }).catch(() => []) as { id: number }[];

            const currentIds = currentCompatible?.map(dt => dt.id) || [];
            const newIds = compatibleDsTypeIds || [];

            // Find IDs to add and remove
            const toAdd = newIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !newIds.includes(id));

            // Add new compatible DS types
            if (toAdd.length > 0) {
                await addCompatibleMutation.mutateAsync({
                    targetTypeId: editingType.id,
                    data: toAdd.map(id => ({ id })),
                });
            }

            // Remove old compatible DS types
            for (const dsTypeId of toRemove) {
                await removeCompatibleMutation.mutateAsync({
                    targetTypeId: editingType.id,
                    distributionSetTypeId: dsTypeId,
                });
            }

            message.success(t('typeManagement.updateSuccess'));
            setDialogOpen(false);
            setEditingType(null);
            queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCompatibleDistributionSetsQueryKey(editingType.id) });
        } catch {
            // Error handled in mutation
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate({ targetTypeId: id });
    };

    const columns: ColumnsType<MgmtTargetType> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
            render: (id) => <Text style={{ fontSize: 12 }}>{id}</Text>,
        },
        {
            title: t('table.name'),
            dataIndex: 'name',
            key: 'name',
            width: 180,
            sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
            render: (name: string, record) => (
                <Space size={4}>
                    {record.colour && (
                        <Tag color={record.colour} style={{ fontSize: 12, margin: 0 }}>
                            {name}
                        </Tag>
                    )}
                    {!record.colour && <Text strong style={{ fontSize: 12 }}>{name}</Text>}
                </Space>
            ),
        },
        {
            title: t('typeManagement.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            sorter: (a, b) => (a.key ?? '').localeCompare(b.key ?? ''),
            render: (key) => <Text style={{ fontSize: 12 }}>{key}</Text>,
        },
        {
            title: t('form.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            sorter: (a, b) => (a.description ?? '').localeCompare(b.description ?? ''),
            render: (desc) => <Text type="secondary" style={{ fontSize: 12 }}>{desc || '-'}</Text>,
        },
        {
            title: t('tagManagement.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 100,
            render: (colour: string) => <ColorSwatch color={colour} />,
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0} className="action-cell">
                    {isAdmin && (
                        <>
                            <Tooltip title={t('common:edit')}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setEditingType(record);
                                        setDialogOpen(true);
                                    }}
                                />
                            </Tooltip>
                            <Popconfirm
                                title={t('typeManagement.deleteConfirm')}
                                onConfirm={() => handleDelete(record.id)}
                                okText={t('common:confirm')}
                                cancelText={t('common:cancel')}
                            >
                                <Tooltip title={t('common:delete')}>
                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const isSubmitting = createMutation.isPending || updateMutation.isPending ||
        addCompatibleMutation.isPending || removeCompatibleMutation.isPending;

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {isAdmin && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingType(null);
                            setDialogOpen(true);
                        }}
                    >
                        {t('typeManagement.add')}
                    </Button>
                )}
            </div>

            <EnhancedTable<MgmtTargetType>
                columns={columns}
                dataSource={data?.content || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: data?.total || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
                scroll={{ x: 800 }}
            />

            <TargetTypeDialog
                open={dialogOpen}
                mode={editingType ? 'edit' : 'create'}
                initialData={editingType}
                loading={isSubmitting}
                onSubmit={editingType ? handleUpdate : handleCreate}
                onCancel={() => {
                    setDialogOpen(false);
                    setEditingType(null);
                }}
            />
        </Space>
    );
};

export default TargetTypeList;
