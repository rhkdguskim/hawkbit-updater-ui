import React, { useMemo, useCallback } from 'react';
import { message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetTargetTagsInfinite,
    useDeleteTargetTag,
    useCreateTargetTags,
    useUpdateTargetTag,
    getGetTargetTagsInfiniteQueryKey,
} from '@/api/generated/target-tags/target-tags';
import type { MgmtTag, PagedListMgmtTag } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { TagFormModal, ListSummary } from '@/components/common';
import type { TagFormValues } from '@/components/common';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createTagNameColumn } from '@/utils/columnFactory';
import type { ColumnsType } from 'antd/es/table';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';

interface MgmtTagRequestBodyPost {
    name: string;
    description?: string;
    colour?: string;
}

interface TargetTagListProps {
    standalone?: boolean;
}

const TargetTagList: React.FC<TargetTagListProps> = ({ standalone = true }) => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    // List Filter Store Integration
    const {
        targetTags: persistentState,
        setTargetTags: setPersistentState
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
    } = useServerTable<MgmtTag>({ syncToUrl: standalone });

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingTag, setEditingTag] = React.useState<MgmtTag | null>(null);

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        refetch,
        dataUpdatedAt,
    } = useGetTargetTagsInfinite({
        limit: pagination.pageSize,
        sort: sort || undefined,
    }, {
        query: {
            getNextPageParam: (lastPage: PagedListMgmtTag, allPages: PagedListMgmtTag[]) => {
                const total = lastPage.total || 0;
                const currentOffset = allPages.length * (pagination.pageSize || 20);
                return currentOffset < total ? currentOffset : undefined;
            },
            initialPageParam: 0,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 30000,
        }
    });

    const tagsContent = useMemo(() => {
        return infiniteData?.pages.flatMap((page: PagedListMgmtTag) => page.content || []) || [];
    }, [infiniteData]);
    const totalCount = useMemo(() => infiniteData?.pages[0]?.total || 0, [infiniteData]);

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('common:table.name'), type: 'text' },
        { key: 'description', label: t('common:table.description'), type: 'text' },
    ], [t]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    const deleteMutation = useDeleteTargetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.deleteSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsInfiniteQueryKey() });
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
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsInfiniteQueryKey() });
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
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsInfiniteQueryKey() });
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

    const handleDelete = (record: MgmtTag) => {
        Modal.confirm({
            title: t('tagManagement.deleteConfirmTitle'),
            content: t('tagManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ targetTagId: record.id }),
        });
    };

    const handleEdit = (record: MgmtTag) => {
        setEditingTag(record);
        setDialogOpen(true);
    };

    const columns: ColumnsType<MgmtTag> = useMemo(() => [
        createIdColumn<MgmtTag>(t),
        createTagNameColumn<MgmtTag>({ t }),
        createDescriptionColumn<MgmtTag>({ t }),
        createColorColumn<MgmtTag>({
            t,
            editable: isAdmin,
            onUpdate: async (record, newColor) => {
                await updateMutation.mutateAsync({
                    targetTagId: record.id,
                    data: {
                        name: record.name,
                        description: record.description,
                        colour: newColor,
                    },
                });
            }
        }),
        createActionsColumn<MgmtTag>({
            t,
            onEdit: handleEdit,
            onDelete: handleDelete,
            canEdit: true,
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
        { key: 'description', label: t('common:table.description'), defaultVisible: true },
        { key: 'colour', label: t('common:table.color'), defaultVisible: true },
    ], [t]);

    const summary = useMemo(() => (
        <ListSummary
            loaded={tagsContent.length}
            total={totalCount}
            filtersCount={filters.length}
            updatedAt={dataUpdatedAt}
            isFetching={isFetching}
        />
    ), [tagsContent.length, totalCount, filters.length, dataUpdatedAt, isFetching]);

    const searchBar = (
        <FilterBuilder
            fields={filterFields}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRefresh={() => refetch()}
            onAdd={() => {
                setEditingTag(null);
                setDialogOpen(true);
            }}
            canAdd={isAdmin}
            addLabel={t('tagManagement.add')}
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
                isEmpty={tagsContent.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtTag>
                    columns={displayColumns}
                    dataSource={tagsContent}
                    rowKey="id"
                    loading={isLoading || isFetching}
                    pagination={false}
                    onChange={handleTableChange}
                    scroll={{ x: 700 }}
                    onFetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                />
            </DataView>

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
                    nameLabel: t('common:table.name'),
                    namePlaceholder: t('form.namePlaceholder'),
                    nameRequired: t('common:validation.required'),
                    descriptionLabel: t('common:table.description'),
                    descriptionPlaceholder: t('form.descriptionPlaceholder'),
                    colourLabel: t('common:table.color'),
                    cancelText: t('common:actions.cancel'),
                }}
            />
        </>
    );

    if (!standalone) {
        return listContent;
    }

    return (
        <StandardListLayout
            title={t('tagManagement.title')}
            description={t('tagManagement.description', { defaultValue: 'Manage target tags for categorization' })}
            searchBar={searchBar}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default TargetTagList;
