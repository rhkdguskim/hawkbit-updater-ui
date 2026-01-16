import { useState, useCallback, useMemo } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetSoftwareModulesInfinite,
    useDeleteSoftwareModule,
    useUpdateSoftwareModule,
    getGetSoftwareModulesQueryKey,
} from '@/api/generated/software-modules/software-modules';
import type { MgmtSoftwareModule, PagedListMgmtSoftwareModule, ExceptionInfo } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useServerTable } from '@/hooks/useServerTable';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import type { FilterValue, FilterField } from '@/components/patterns';
import { useListFilterStore } from '@/stores/useListFilterStore';

export const useSoftwareModuleListModel = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const {
        pagination,
        sort,
        handleTableChange,
        resetPagination,
    } = useServerTable<MgmtSoftwareModule>({ syncToUrl: true });

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedModuleIds, setSelectedModuleIds] = useState<React.Key[]>([]);

    // List Filter Store Integration
    const {
        softwareModules: smPersistentState,
        setSoftwareModules: setSmPersistentState
    } = useListFilterStore();

    const {
        filters,
        visibleColumns
    } = smPersistentState;

    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setSmPersistentState({ filters: newFilters });
    }, [setSmPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setSmPersistentState({ visibleColumns: columns });
    }, [setSmPersistentState]);

    /**
     * Filter fields for Software Modules.
     */
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('list.columns.name'), type: 'text' },
        { key: 'version', label: t('list.columns.version'), type: 'text' },
        { key: 'typeName', label: t('list.columns.type'), type: 'text' },
        { key: 'vendor', label: t('list.columns.vendor'), type: 'text' },
    ], [t]);

    /**
     * Build RSQL query from filters.
     */
    const buildFinalQuery = useCallback(() => {
        const serverFilters = filters.filter(f => f.field !== 'typeName');
        return buildQueryFromFilterValues(serverFilters);
    }, [filters]);

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
    } = useGetSoftwareModulesInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: buildFinalQuery() || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtSoftwareModule, allPages: PagedListMgmtSoftwareModule[]) => {
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
        const allItems = infiniteData?.pages.flatMap((page: PagedListMgmtSoftwareModule) => page.content || []) || [];

        if (!typeNameFilter) return allItems;

        return allItems.filter(sm => sm.typeName === typeNameFilter);
    }, [infiniteData, typeNameFilter]);

    const totalCount = useMemo(() => {
        return infiniteData?.pages[0]?.total || 0;
    }, [infiniteData]);

    const deleteMutation = useDeleteSoftwareModule({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteModuleSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetSoftwareModulesQueryKey() });
                refetch();
            },
            onError: (err: ExceptionInfo) => {
                message.error((err as Error).message || t('messages.deleteModuleError'));
            },
        },
    });

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t('messages.deleteModuleConfirmTitle'),
            content: t('messages.deleteModuleConfirmDesc'),
            okText: t('actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ softwareModuleId: id }),
        });
    };

    const handleBulkDelete = useCallback(() => {
        Modal.confirm({
            title: t('messages.bulkDeleteModuleConfirmTitle', { count: selectedModuleIds.length }),
            content: t('messages.bulkDeleteModuleConfirmDesc'),
            okText: t('actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: async () => {
                for (const id of selectedModuleIds) {
                    await deleteMutation.mutateAsync({ softwareModuleId: id as number }).catch(() => { });
                }
                setSelectedModuleIds([]);
                refetch();
                message.success(t('messages.bulkDeleteModuleSuccess'));
            },
        });
    }, [selectedModuleIds, deleteMutation, refetch, t]);

    // Handle filter change
    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    // Update mutation for inline editing
    const updateMutation = useUpdateSoftwareModule({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetSoftwareModulesQueryKey() });
                refetch();
            },
            onError: (err: ExceptionInfo) => {
                message.error((err as Error).message || t('common:messages.error'));
            },
        },
    });

    const handleInlineUpdate = useCallback(async (id: number, field: 'name' | 'vendor' | 'description', value: string) => {
        await updateMutation.mutateAsync({
            softwareModuleId: id,
            data: { [field]: value },
        });
    }, [updateMutation]);

    return {
        // Context
        t,
        isAdmin,
        navigate,

        // Table State
        pagination,
        sort,
        handleTableChange,
        selectedModuleIds,
        setSelectedModuleIds,

        // Infinite Scroll State
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,

        // Filters State
        filters,
        setFilters,
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

        // Handlers
        handleDelete,
        handleBulkDelete,
        handleInlineUpdate,
    };
};
