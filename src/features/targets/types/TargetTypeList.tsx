import React, { useMemo, useCallback } from 'react';
import { message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTargetTypesInfinite,
    useDeleteTargetType,
    useCreateTargetTypes,
    useUpdateTargetType,
    useAddCompatibleDistributionSets,
    useRemoveCompatibleDistributionSet,
    getCompatibleDistributionSets,
    getGetTargetTypesQueryKey,
    getGetCompatibleDistributionSetsQueryKey,
} from '@/api/generated/target-types/target-types';
import type { MgmtTargetType, MgmtTargetTypeRequestBodyPost, MgmtTargetTypeRequestBodyPut, PagedListMgmtTargetType, ExceptionInfo } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createColoredNameColumn } from '@/utils/columnFactory';
import { SmallText } from '@/components/shared/Typography';
import TargetTypeDialog from './TargetTypeDialog';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';
import { ListSummary } from '@/components/common';

interface TargetTypeListProps {
    standalone?: boolean;
}

const TargetTypeList: React.FC<TargetTypeListProps> = ({ standalone = true }) => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    // List Filter Store Integration
    const {
        targetTypes: persistentState,
        setTargetTypes: setPersistentState
    } = useListFilterStore();

    const { filters, visibleColumns } = persistentState;

    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setPersistentState({ filters: newFilters });
    }, [setPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setPersistentState({ visibleColumns: columns });
    }, [setPersistentState]);

    const {
        pagination,
        sort,
        handleTableChange,
        resetPagination,
    } = useServerTable<MgmtTargetType>({ syncToUrl: standalone });

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingType, setEditingType] = React.useState<MgmtTargetType | null>(null);

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        refetch,
        dataUpdatedAt,
    } = useGetTargetTypesInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtTargetType, allPages: PagedListMgmtTargetType[]) => {
                    const total = lastPage.total || 0;
                    const currentOffset = allPages.length * (pagination.pageSize || 20);
                    return currentOffset < total ? currentOffset : undefined;
                },
                initialPageParam: 0,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                staleTime: 30000,
            },
        }
    );

    const typesContent = useMemo(() => {
        return infiniteData?.pages.flatMap((page: PagedListMgmtTargetType) => page.content || []) || [];
    }, [infiniteData]);
    const totalCount = useMemo(() => infiniteData?.pages[0]?.total || 0, [infiniteData]);

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('common:table.name'), type: 'text' },
        { key: 'key', label: t('typeManagement.key'), type: 'text' },
        { key: 'description', label: t('common:table.description'), type: 'text' },
    ], [t]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

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
            refetch();
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
            refetch();
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

    // Handle column visibility
    const displayColumns = useMemo(() => {
        if (!visibleColumns || visibleColumns.length === 0) return columns;
        return columns.filter(col =>
            col.key === 'actions' || visibleColumns.includes(col.key as string)
        );
    }, [columns, visibleColumns]);

    const columnOptions = useMemo(() => [
        { key: 'id', label: t('common:table.id'), defaultVisible: false },
        { key: 'name', label: t('common:table.name'), defaultVisible: true },
        { key: 'key', label: t('typeManagement.key'), defaultVisible: true },
        { key: 'description', label: t('common:table.description'), defaultVisible: true },
        { key: 'colour', label: t('common:table.color'), defaultVisible: true },
    ], [t]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending ||
        addCompatibleMutation.isPending || removeCompatibleMutation.isPending;

    const summary = useMemo(() => (
        <ListSummary
            loaded={typesContent.length}
            total={totalCount}
            filtersCount={filters.length}
            updatedAt={dataUpdatedAt}
            isFetching={isFetching}
        />
    ), [typesContent.length, totalCount, filters.length, dataUpdatedAt, isFetching]);

    const searchBar = (
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
            extra={summary}
            columns={columnOptions}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
            searchPlaceholder={t('list.searchPlaceholder', { defaultValue: t('common:actions.search') })}
        />
    );

    const listContent = (
        <>
            {!standalone && <div style={{ marginBottom: 16 }}>{searchBar}</div>}
            <DataView
                loading={isLoading}
                error={null}
                isEmpty={!isLoading && typesContent.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtTargetType>
                    columns={displayColumns}
                    dataSource={typesContent}
                    rowKey="id"
                    pagination={false}
                    loading={isLoading || isFetching}
                    onChange={handleTableChange}
                    scroll={{ x: 800 }}
                    onFetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
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
            searchBar={searchBar}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default TargetTypeList;
