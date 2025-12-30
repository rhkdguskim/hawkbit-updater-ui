import React, { useState } from 'react';
import {
    Button,
    Space,
    message,
    Modal,
    Tag,
    Typography,
    Tooltip,
} from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
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
import styled from 'styled-components';

const { Text } = Typography;

const ListStack = styled(Space)`
    width: 100%;
`;

const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
`;

const SmallText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const SmallSecondaryText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const NameTag = styled(Tag)`
    && {
        margin: 0;
        font-size: var(--ant-font-size-sm);
    }
`;

const TargetTypeList: React.FC = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtTargetType | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, refetch } = useGetTargetTypes({
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
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ targetTypeId: id }),
        });
    };

    const handleTableChange: TableProps<MgmtTargetType>['onChange'] = (newPagination) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        });
    };

    const columns: ColumnsType<MgmtTargetType> = [
        {
            title: t('common:id', { defaultValue: 'ID' }),
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
            render: (id) => <SmallText>{id}</SmallText>,
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
                        <NameTag color={record.colour}>
                            {name}
                        </NameTag>
                    )}
                    {!record.colour && <SmallText strong>{name}</SmallText>}
                </Space>
            ),
        },
        {
            title: t('typeManagement.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            sorter: (a, b) => (a.key ?? '').localeCompare(b.key ?? ''),
            render: (key) => <SmallText>{key}</SmallText>,
        },
        {
            title: t('form.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            sorter: (a, b) => (a.description ?? '').localeCompare(b.description ?? ''),
            render: (desc) => <SmallSecondaryText type="secondary">{desc || '-'}</SmallSecondaryText>,
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
                            <Tooltip title={t('common:actions.edit')}>
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
                            <Tooltip title={t('common:actions.delete')}>
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const isSubmitting = createMutation.isPending || updateMutation.isPending ||
        addCompatibleMutation.isPending || removeCompatibleMutation.isPending;

    return (
        <ListStack direction="vertical" size="middle">
            <ActionRow>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                        {t('common:actions.refresh')}
                    </Button>
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
                </Space>
            </ActionRow>

            <EnhancedTable<MgmtTargetType>
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
        </ListStack>
    );
};

export default TargetTypeList;
