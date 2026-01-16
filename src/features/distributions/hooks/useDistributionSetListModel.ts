import { useState, useCallback, useMemo } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetDistributionSetsInfinite,
    useDeleteDistributionSet,
    useUpdateDistributionSet,
    getGetDistributionSetsQueryKey,
} from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';
import type { MgmtDistributionSet, PagedListMgmtDistributionSet, ExceptionInfo } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useServerTable } from '@/hooks/useServerTable';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import type { FilterValue, FilterField } from '@/components/patterns';
import { useListFilterStore } from '@/stores/useListFilterStore';

export const useDistributionSetListModel = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const {
        pagination,
        sort,
        globalSearch,
        setGlobalSearch,
        debouncedGlobalSearch,
        handleTableChange,
        resetPagination,
    } = useServerTable<MgmtDistributionSet>({ syncToUrl: true, defaultPageSize: 25 });

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedSetIds, setSelectedSetIds] = useState<React.Key[]>([]);
    const [bulkTagsModalOpen, setBulkTagsModalOpen] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

    // List Filter Store Integration
    const {
        distributions: distPersistentState,
        setDistributions: setDistPersistentState
    } = useListFilterStore();

    const {
        filters,
        quickFilter,
        visibleColumns
    } = distPersistentState;

    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setDistPersistentState({ filters: newFilters });
    }, [setDistPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setDistPersistentState({ visibleColumns: columns });
    }, [setDistPersistentState]);

    const setQuickFilter = useCallback((q: string) => {
        setDistPersistentState({ quickFilter: q });
    }, [setDistPersistentState]);

    // Fetch Distribution Set Types for filter dropdown
    const { data: dsTypesData } = useGetDistributionSetTypes(
        { limit: 100, offset: 0 },
        { query: { staleTime: 5 * 60 * 1000 } }
    );

    /**
     * Filter fields for Distribution Sets.
     */
    const filterFields: FilterField[] = useMemo(() => {
        const typeOptions = dsTypesData?.content?.map(type => ({
            value: type.name || '',
            label: type.name || '',
        })) || [];

        return [
            { key: 'name', label: t('list.columns.name'), type: 'text' },
            { key: 'version', label: t('list.columns.version'), type: 'text' },
            {
                key: 'typeName',
                label: t('list.columns.type'),
                type: typeOptions.length > 0 ? 'select' : 'text',
                options: typeOptions.length > 0 ? typeOptions : undefined,
            },
            {
                key: 'complete',
                label: t('list.columns.completeness'),
                type: 'select',
                options: [
                    { value: 'true', label: t('tags.complete') },
                    { value: 'false', label: t('tags.incomplete') },
                ],
            },
        ];
    }, [t, dsTypesData]);

    /**
     * Build RSQL query from filters.
     */
    const buildFinalQuery = useCallback(() => {
        const fiql = buildQueryFromFilterValues(filters.filter(f => f.field !== 'typeName'));

        if (debouncedGlobalSearch) {
            const searchFields = ['name', 'version', 'description'];
            const searchQuery = searchFields
                .map(field => `${field}==*${debouncedGlobalSearch}*`)
                .join(',');

            return fiql ? `(${fiql});(${searchQuery})` : `(${searchQuery})`;
        }

        return fiql;
    }, [filters, debouncedGlobalSearch]);

    // Get typeName filter value for client-side filtering
    const typeNameFilter = useMemo(() => {
        const filter = filters.find(f => f.field === 'typeName');
        return filter?.value as string | undefined;
    }, [filters]);

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetDistributionSetsInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: buildFinalQuery() || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtDistributionSet, allPages: PagedListMgmtDistributionSet[]) => {
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

    /**
     * Flatten pages and apply client-side typeName filter (if active).
     */
    const dataContent = useMemo(() => {
        const allItems = infiniteData?.pages.flatMap((page: PagedListMgmtDistributionSet) => page.content || []) || [];

        if (!typeNameFilter) return allItems;

        return allItems.filter(ds => ds.typeName === typeNameFilter);
    }, [infiniteData, typeNameFilter]);

    const totalCount = useMemo(() => {
        return infiniteData?.pages[0]?.total || 0;
    }, [infiniteData]);

    const deleteMutation = useDeleteDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSetSuccess'));
                refetch();
            },
            onError: (err: ExceptionInfo) => {
                message.error((err as Error).message || t('messages.deleteSetError'));
            },
        },
    });

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t('messages.deleteSetConfirmTitle'),
            content: t('messages.deleteSetConfirmDesc'),
            okText: t('actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ distributionSetId: id }),
        });
    };

    // Handle filter change
    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    // Update mutation for inline editing
    const updateMutation = useUpdateDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetDistributionSetsQueryKey() });
                refetch();
            },
            onError: (err: ExceptionInfo) => {
                message.error((err as Error).message || t('common:messages.error'));
            },
        },
    });

    const handleInlineUpdate = useCallback(async (id: number, field: 'name' | 'description', value: string) => {
        await updateMutation.mutateAsync({
            distributionSetId: id,
            data: { [field]: value },
        });
    }, [updateMutation]);

    return {
        // Permissions/Context
        t,
        isAdmin,
        navigate,

        // Table State
        pagination,
        sort,
        handleTableChange,
        selectedSetIds,
        setSelectedSetIds,

        // Infinite Scroll State
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,

        // Filters State
        filters,
        quickFilter,
        setQuickFilter,
        visibleColumns,
        setVisibleColumns,
        filterFields,
        handleFiltersChange,

        // Data
        data: dataContent,
        totalCount,
        isLoading,
        isFetching,
        error,
        refetch,

        // Modal States
        isCreateModalVisible,
        setIsCreateModalVisible,
        bulkTagsModalOpen,
        setBulkTagsModalOpen,
        bulkDeleteModalOpen,
        setBulkDeleteModalOpen,

        // Handlers
        handleDelete,
        handleInlineUpdate,
        globalSearch,
        setGlobalSearch,
    };
};
