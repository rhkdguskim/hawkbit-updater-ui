import React, { useMemo, useCallback } from 'react';
import { Tag, message, Modal } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTypesInfinite,
    useDeleteSoftwareModuleType,
    useUpdateSoftwareModuleType,
} from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleType, PagedListMgmtSoftwareModuleType, ExceptionInfo } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import SoftwareModuleTypeDialog from './SoftwareModuleTypeDialog';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createDateColumn, createColoredNameColumn } from '@/utils/columnFactory';
import { SmallText } from '@/components/shared/Typography';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';

interface SoftwareModuleTypeListProps {
    standalone?: boolean;
}

const SoftwareModuleTypeList: React.FC<SoftwareModuleTypeListProps> = ({ standalone = true }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // List Filter Store Integration
    const {
        softwareModuleTypes: persistentState,
        setSoftwareModuleTypes: setPersistentState
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
    } = useServerTable<MgmtSoftwareModuleType>({ syncToUrl: standalone });

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingType, setEditingType] = React.useState<MgmtSoftwareModuleType | null>(null);

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        refetch
    } = useGetTypesInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtSoftwareModuleType, allPages: PagedListMgmtSoftwareModuleType[]) => {
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
        return infiniteData?.pages.flatMap((page: PagedListMgmtSoftwareModuleType) => page.content || []) || [];
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

    const deleteMutation = useDeleteSoftwareModuleType({
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

    const updateMutation = useUpdateSoftwareModuleType({
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

    const handleDelete = (record: MgmtSoftwareModuleType) => {
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ softwareModuleTypeId: record.id }),
        });
    };

    const handleEdit = (record: MgmtSoftwareModuleType) => {
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

    const columns: ColumnsType<MgmtSoftwareModuleType> = useMemo(() => [
        createIdColumn<MgmtSoftwareModuleType>(t),
        createColoredNameColumn<MgmtSoftwareModuleType>({ t }),
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            sorter: true,
            render: (text: string) => <Tag style={{ fontSize: 'var(--ant-font-size-sm)', margin: 0 }}>{text}</Tag>,
        },
        createDescriptionColumn<MgmtSoftwareModuleType>({ t }),
        {
            title: t('typeManagement.columns.maxAssignments'),
            dataIndex: 'maxAssignments',
            key: 'maxAssignments',
            width: 100,
            sorter: true,
            render: (val: number) => <SmallText>{val ?? 1}</SmallText>,
        },
        createColorColumn<MgmtSoftwareModuleType>({
            t,
            editable: isAdmin,
            onUpdate: async (record, newColor) => {
                await updateMutation.mutateAsync({
                    softwareModuleTypeId: record.id,
                    data: {
                        description: record.description,
                        colour: newColor,
                    },
                });
            }
        }),
        createDateColumn<MgmtSoftwareModuleType>({ t, dataIndex: 'lastModifiedAt' }),
        createActionsColumn<MgmtSoftwareModuleType>({
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
        { key: 'maxAssignments', label: t('typeManagement.columns.maxAssignments'), defaultVisible: true },
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
                <EnhancedTable<MgmtSoftwareModuleType>
                    columns={displayColumns}
                    dataSource={typesContent}
                    rowKey="id"
                    pagination={false}
                    loading={isLoading || isFetching}
                    onChange={handleTableChange}
                    scroll={{ x: 900 }}
                    onFetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                />
            </DataView>

            <SoftwareModuleTypeDialog
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
            title={t('typeManagement.smTypeTitle')}
            description={t('typeManagement.smTypeDescription', { defaultValue: 'Manage software module types' })}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default SoftwareModuleTypeList;
