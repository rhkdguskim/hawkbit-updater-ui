import React, { useMemo, useCallback } from 'react';
import { Tag, message, Modal } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetDistributionSetTypesInfinite,
    useDeleteDistributionSetType,
    useUpdateDistributionSetType,
} from '@/api/generated/distribution-set-types/distribution-set-types';
import type { MgmtDistributionSetType, PagedListMgmtDistributionSetType, ExceptionInfo } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import DistributionSetTypeDialog from './DistributionSetTypeDialog';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createDateColumn, createColoredNameColumn } from '@/utils/columnFactory';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';

interface DistributionSetTypeListProps {
    standalone?: boolean;
}

const DistributionSetTypeList: React.FC<DistributionSetTypeListProps> = ({ standalone = true }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // List Filter Store Integration
    const {
        distributionSetTypes: persistentState,
        setDistributionSetTypes: setPersistentState
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
    } = useServerTable<MgmtDistributionSetType>({ syncToUrl: standalone });

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingType, setEditingType] = React.useState<MgmtDistributionSetType | null>(null);

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        refetch
    } = useGetDistributionSetTypesInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtDistributionSetType, allPages: PagedListMgmtDistributionSetType[]) => {
                    const total = lastPage.total || 0;
                    const currentOffset = allPages.length * (pagination.pageSize || 20);
                    return currentOffset < total ? currentOffset : undefined;
                },
                initialPageParam: 0,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        }
    );

    const typesContent = useMemo(() => {
        return infiniteData?.pages.flatMap((page: PagedListMgmtDistributionSetType) => page.content || []) || [];
    }, [infiniteData]);

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('common:table.name'), type: 'text' },
        { key: 'key', label: t('typeManagement.columns.key'), type: 'text' },
        { key: 'description', label: t('common:table.description'), type: 'text' },
    ], [t]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    const deleteMutation = useDeleteDistributionSetType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.deleteSuccess'));
                refetch();
            },
            onError: (error: ExceptionInfo) => {
                message.error((error as Error).message || t('typeManagement.deleteError'));
            },
        },
    });

    const updateMutation = useUpdateDistributionSetType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.updateSuccess'));
                refetch();
            },
            onError: (error: ExceptionInfo) => {
                message.error((error as Error).message || t('typeManagement.updateError'));
            },
        },
    });

    const handleDelete = (record: MgmtDistributionSetType) => {
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ distributionSetTypeId: record.id }),
        });
    };

    const handleEdit = (record: MgmtDistributionSetType) => {
        setEditingType(record);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingType(null);
    };

    const handleDialogSuccess = () => {
        handleDialogClose();
        refetch();
    };

    const columns: ColumnsType<MgmtDistributionSetType> = useMemo(() => [
        createIdColumn<MgmtDistributionSetType>(t),
        createColoredNameColumn<MgmtDistributionSetType>({ t }),
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            sorter: true,
            render: (text: string) => <Tag style={{ fontSize: 'var(--ant-font-size-sm)', margin: 0 }}>{text}</Tag>,
        },
        createDescriptionColumn<MgmtDistributionSetType>({ t }),
        createColorColumn<MgmtDistributionSetType>({
            t,
            editable: isAdmin,
            onUpdate: async (record, newColor) => {
                await updateMutation.mutateAsync({
                    distributionSetTypeId: record.id,
                    data: {
                        description: record.description,
                        colour: newColor,
                    },
                });
            }
        }),
        createDateColumn<MgmtDistributionSetType>({ t, dataIndex: 'lastModifiedAt' }),
        createActionsColumn<MgmtDistributionSetType>({
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
        { key: 'key', label: t('typeManagement.columns.key'), defaultVisible: true },
        { key: 'description', label: t('common:table.description'), defaultVisible: true },
        { key: 'colour', label: t('common:table.color'), defaultVisible: true },
        { key: 'lastModifiedAt', label: t('common:table.lastModified'), defaultVisible: true },
    ], [t]);

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
                addLabel={t('typeManagement.addType')}
                loading={isLoading || isFetching}
                columns={columnOptions}
                visibleColumns={visibleColumns}
                onVisibilityChange={setVisibleColumns}
            />
            <DataView
                loading={isLoading}
                error={null}
                isEmpty={!isLoading && typesContent.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtDistributionSetType>
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

            <DistributionSetTypeDialog
                open={dialogOpen}
                editingType={editingType}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </>
    );

    if (!standalone) {
        return listContent;
    }

    return (
        <StandardListLayout
            title={t('typeManagement.dsTypeTitle')}
            description={t('typeManagement.dsTypeDescription', { defaultValue: 'Manage distribution set types' })}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default DistributionSetTypeList;
