import React, { useState, useMemo, useCallback } from 'react';
import { message, Modal } from 'antd';
import type { TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
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
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createColoredNameColumn } from '@/utils/columnFactory';
import { SmallText } from '@/components/shared/Typography';
import TargetTypeDialog from './TargetTypeDialog';

interface TargetTypeListProps {
    standalone?: boolean;
}

const TargetTypeList: React.FC<TargetTypeListProps> = ({ standalone = true }) => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtTargetType | null>(null);
    const [filters, setFilters] = useState<FilterValue[]>([]);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, isFetching, refetch } = useGetTargetTypes({
        offset,
        limit: pagination.pageSize,
    });

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('common:table.name'), type: 'text' },
        { key: 'key', label: t('typeManagement.key'), type: 'text' },
        { key: 'description', label: t('common:table.description'), type: 'text' },
    ], [t]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, current: 1 }));
    }, []);

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
            await updateMutation.mutateAsync({ targetTypeId: editingType.id, data: values });

            const currentCompatible = await queryClient.fetchQuery({
                queryKey: getGetCompatibleDistributionSetsQueryKey(editingType.id),
                queryFn: () => getCompatibleDistributionSets(editingType.id),
                staleTime: 0,
            }).catch(() => []) as { id: number }[];

            const currentIds = currentCompatible?.map(dt => dt.id) || [];
            const newIds = compatibleDsTypeIds || [];

            const toAdd = newIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !newIds.includes(id));

            if (toAdd.length > 0) {
                await addCompatibleMutation.mutateAsync({
                    targetTypeId: editingType.id,
                    data: toAdd.map(id => ({ id })),
                });
            }

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

    const handleDelete = (record: MgmtTargetType) => {
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ targetTypeId: record.id }),
        });
    };

    const handleEdit = (record: MgmtTargetType) => {
        setEditingType(record);
        setDialogOpen(true);
    };

    const handleTableChange: TableProps<MgmtTargetType>['onChange'] = (newPagination) => {
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        });
    };

    const columns: ColumnsType<MgmtTargetType> = useMemo(() => [
        createIdColumn<MgmtTargetType>(t),
        createColoredNameColumn<MgmtTargetType>({ t }),
        {
            title: t('typeManagement.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            sorter: true,
            render: (key: string) => <SmallText>{key}</SmallText>,
        },
        createDescriptionColumn<MgmtTargetType>({ t }),
        createColorColumn<MgmtTargetType>({
            t,
            editable: isAdmin,
            onUpdate: async (record, newColor) => {
                await updateMutation.mutateAsync({
                    targetTypeId: record.id,
                    data: {
                        name: record.name,
                        description: record.description,
                        colour: newColor,
                    },
                });
                queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
            }
        }),
        createActionsColumn<MgmtTargetType>({
            t,
            onEdit: handleEdit,
            onDelete: handleDelete,
            canEdit: isAdmin,
            canDelete: isAdmin,
        }),
    ], [t, isAdmin]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending ||
        addCompatibleMutation.isPending || removeCompatibleMutation.isPending;

    const listContent = (
        <>
            <FilterBuilder
                fields={filterFields}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onRefresh={() => refetch()}
                onAdd={isAdmin ? () => {
                    setEditingType(null);
                    setDialogOpen(true);
                } : undefined}
                canAdd={isAdmin}
                addLabel={t('typeManagement.add')}
                loading={isLoading || isFetching}
            />
            <DataView
                loading={isLoading}
                error={null}
                isEmpty={data?.content?.length === 0}
                emptyText={t('common:messages.noData')}
            >
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
                        position: ['topRight'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 800 }}
                />
            </DataView>

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
        </>
    );

    if (!standalone) {
        return listContent;
    }

    return (
        <StandardListLayout
            title={t('typeManagement.title')}
            description={t('typeManagement.description', { defaultValue: 'Manage target types for device categorization' })}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default TargetTypeList;
