import { useState, useCallback, useMemo } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
    useGetDistributionSets,
    useDeleteDistributionSet,
    useUpdateDistributionSet,
    getGetDistributionSetsQueryKey,
} from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtDistributionSet } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useServerTable } from '@/hooks/useServerTable';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import type { FilterValue, FilterField } from '@/components/patterns';

export const useDistributionSetListModel = () => {
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
    } = useServerTable<MgmtDistributionSet>({ syncToUrl: true });

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedSetIds, setSelectedSetIds] = useState<React.Key[]>([]);
    const [bulkTagsModalOpen, setBulkTagsModalOpen] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [filters, setFilters] = useState<FilterValue[]>([]);

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('list.columns.name'), type: 'text' },
        { key: 'version', label: t('list.columns.version'), type: 'text' },
        { key: 'typeName', label: t('list.columns.type'), type: 'text' },
        {
            key: 'complete',
            label: t('list.columns.completeness'),
            type: 'select',
            options: [
                { value: 'true', label: t('tags.complete') },
                { value: 'false', label: t('tags.incomplete') },
            ],
        },
    ], [t]);

    // Build RSQL query from filters
    const buildFinalQuery = useCallback(() => buildQueryFromFilterValues(filters), [filters]);

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetDistributionSets(
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

    const deleteMutation = useDeleteDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSetSuccess'));
                refetch();
            },
            onError: (err) => {
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
    }, [resetPagination]);

    // Update mutation for inline editing
    const updateMutation = useUpdateDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetDistributionSetsQueryKey() });
                refetch();
            },
            onError: (err) => {
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
        offset,
        sort,
        handleTableChange,
        selectedSetIds,
        setSelectedSetIds,

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
        bulkTagsModalOpen,
        setBulkTagsModalOpen,
        bulkDeleteModalOpen,
        setBulkDeleteModalOpen,

        // Handlers
        handleDelete,
        handleInlineUpdate,
    };
};
