import { useState, useCallback, useMemo } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
    useGetSoftwareModules,
    useDeleteSoftwareModule,
    useUpdateSoftwareModule,
    getGetSoftwareModulesQueryKey,
} from '@/api/generated/software-modules/software-modules';
import type { MgmtSoftwareModule } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useServerTable } from '@/hooks/useServerTable';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import type { FilterValue, FilterField } from '@/components/patterns';

export const useSoftwareModuleListModel = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const {
        pagination,
        offset,
        sort,
        handleTableChange,
        resetPagination,
    } = useServerTable<MgmtSoftwareModule>({ syncToUrl: true });

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedModuleIds, setSelectedModuleIds] = useState<React.Key[]>([]);
    const [filters, setFilters] = useState<FilterValue[]>([]);

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('list.columns.name'), type: 'text' },
        { key: 'version', label: t('list.columns.version'), type: 'text' },
        { key: 'typeName', label: t('list.columns.type'), type: 'text' },
        { key: 'vendor', label: t('list.columns.vendor'), type: 'text' },
    ], [t]);

    // Build RSQL query from filters
    const buildFinalQuery = useCallback(() => buildQueryFromFilterValues(filters), [filters]);

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetSoftwareModules(
        {
            offset,
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: buildFinalQuery() || undefined,
        },
        {
            query: {
                placeholderData: keepPreviousData,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        }
    );

    const deleteMutation = useDeleteSoftwareModule({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteModuleSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetSoftwareModulesQueryKey() });
                refetch();
            },
            onError: (err) => {
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
    }, [resetPagination]);

    // Update mutation for inline editing
    const updateMutation = useUpdateSoftwareModule({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetSoftwareModulesQueryKey() });
                refetch();
            },
            onError: (err) => {
                message.error((err as Error).message || t('common:messages.error'));
            },
        },
    });

    const handleInlineUpdate = useCallback(async (id: number, field: 'vendor' | 'description', value: string) => {
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
        offset,
        sort,
        handleTableChange,
        selectedModuleIds,
        setSelectedModuleIds,

        // Filters State
        filters,
        filterFields,
        handleFiltersChange,

        // Data
        data,
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
