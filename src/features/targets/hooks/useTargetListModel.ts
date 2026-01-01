import { useState, useCallback, useMemo } from 'react';
import { message, type TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
    useGetTargets,
    useDeleteTarget,
    useCreateTargets,
    useUpdateTarget,
    usePostAssignedDistributionSet,
    getGetTargetsQueryKey,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useServerTable } from '@/hooks/useServerTable';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import type { MgmtTarget, MgmtTag, MgmtTargetType, MgmtDistributionSetAssignment, MgmtDistributionSetAssignments, MgmtDistributionSetAssignmentType } from '@/api/generated/model';
import type { FilterValue, FilterField } from '@/components/patterns';
import type { AssignPayload } from '../components';
import Papa from 'papaparse';
import dayjs from 'dayjs';

export const useTargetListModel = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation('targets');

    // Pagination/Sort Hook
    const {
        pagination,
        offset,
        // sort,
        handleTableChange: serverTableChange,
        resetPagination,
        setPagination,
    } = useServerTable<MgmtTarget>({
        syncToUrl: true,
        defaultSort: undefined,
        allowedSortFields: [], // Only allow reliably sortable fields
    });

    // State
    const [filters, setFilters] = useState<FilterValue[]>([]);
    const [selectedTargetIds, setSelectedTargetIds] = useState<React.Key[]>([]);

    // Modal Open States
    const [bulkTagsModalOpen, setBulkTagsModalOpen] = useState(false);
    const [bulkTypeModalOpen, setBulkTypeModalOpen] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // Entity States for Modals
    const [targetToDelete, setTargetToDelete] = useState<MgmtTarget | null>(null);
    const [editingTarget, setEditingTarget] = useState<MgmtTarget | null>(null);
    const [targetToAssign, setTargetToAssign] = useState<MgmtTarget | null>(null);

    // Master Data Queries
    const { data: tagsData } = useGetTargetTags({ limit: 100 }, { query: { staleTime: 60000 } });
    const { data: typesData } = useGetTargetTypes({ limit: 100 }, { query: { staleTime: 60000 } });

    const availableTags = useMemo(() => (tagsData?.content as MgmtTag[]) || [], [tagsData]);
    const availableTypes = useMemo(() => (typesData?.content as MgmtTargetType[]) || [], [typesData]);

    // Filter Building
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('table.name'), type: 'text' },
        { key: 'controllerId', label: t('table.controllerId'), type: 'text' },
        {
            key: 'targetType',
            label: t('table.targetType'),
            type: 'select',
            options: availableTypes.map(tp => ({ value: tp.name || '', label: tp.name || '' })),
        },
        {
            key: 'tag',
            label: t('table.tags'),
            type: 'select',
            options: availableTags.map(tag => ({ value: tag.name || '', label: tag.name || '' })),
        },
        {
            key: 'updateStatus',
            label: t('table.updateStatus'),
            type: 'select',
            options: [
                { value: 'in_sync', label: t('status.inSync') },
                { value: 'pending', label: t('status.pending') },
                { value: 'error', label: t('status.error') },
            ],
        },
    ], [t, availableTypes, availableTags]);

    const buildFinalQuery = useCallback((targetFilters: FilterValue[] = filters): string => {
        return buildQueryFromFilterValues(targetFilters, {
            fieldMap: {
                targetType: 'targetTypeName',
                tag: 'tag',
            },
            rawFields: ['query'],
        });
    }, [filters]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination]);

    const handleApplySavedFilter = useCallback((query: string, name?: string) => {
        handleFiltersChange([{
            id: `saved-${Date.now()}`,
            field: 'query',
            fieldLabel: t('filters.query'),
            operator: 'equals',
            operatorLabel: '=',
            value: query,
            displayValue: name || query,
        }]);
    }, [handleFiltersChange, t]);

    // Main Data Query
    const {
        data: targetsData,
        isLoading: targetsLoading,
        isFetching: targetsFetching,
        error: targetsError,
        refetch: refetchTargets,
    } = useGetTargets(
        {
            offset,
            limit: pagination.pageSize,
            q: buildFinalQuery() || undefined,
        },
        { query: { placeholderData: keepPreviousData, refetchOnWindowFocus: false, refetchOnReconnect: false } }
    );

    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets(
        { limit: 100 },
        { query: { enabled: assignModalOpen } }
    );

    // Mutations
    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSuccess'));
                setDeleteModalOpen(false);
                setTargetToDelete(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error: Error) => {
                const errMsg = error.message || t('messages.deleteFailed');
                if (errMsg.includes('409')) message.error(t('messages.conflict', { ns: 'common' }));
                else message.error(errMsg);
            },
        },
    });

    const createTargetMutation = useCreateTargets({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.createSuccess'));
                setFormModalOpen(false);
                setEditingTarget(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error: Error) => {
                const errMsg = error.message || t('messages.createFailed');
                if (errMsg.includes('409')) message.error(t('messages.targetExists'));
                else message.error(errMsg);
            },
        },
    });

    const updateTargetMutation = useUpdateTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess', { defaultValue: 'Target updated' }));
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error: Error) => {
                message.error(error.message || t('messages.updateFailed', { defaultValue: 'Failed to update target' }));
            },
        },
    });

    const assignDSMutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.assignSuccess'));
                setAssignModalOpen(false);
                setTargetToAssign(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error: Error) => {
                message.error(error.message || t('messages.error', { ns: 'common' }));
            },
        },
    });

    // Handlers
    const handleTableChange: TableProps<MgmtTarget>['onChange'] = (paginationConfig, tableFilters, sorter, extra) => {
        serverTableChange(paginationConfig || {}, tableFilters, sorter, extra);
    };

    const handleAddTarget = useCallback(() => {
        setEditingTarget(null);
        setFormModalOpen(true);
    }, []);

    const handleEditTarget = useCallback((target: MgmtTarget) => {
        navigate(`/targets/${target.controllerId}`);
    }, [navigate]);

    const handleDeleteClick = useCallback((target: MgmtTarget) => {
        setTargetToDelete(target);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (targetToDelete?.controllerId) {
            deleteTargetMutation.mutate({ targetId: targetToDelete.controllerId });
        }
    }, [targetToDelete, deleteTargetMutation]);

    const handleCreateTarget = useCallback((values: { controllerId?: string; name?: string; description?: string }) => {
        if (values.controllerId) {
            createTargetMutation.mutate({
                data: [{ controllerId: values.controllerId, name: values.name || values.controllerId, description: values.description }],
            });
        }
    }, [createTargetMutation]);

    const handleInlineUpdate = useCallback(async (controllerId: string, newName: string) => {
        await updateTargetMutation.mutateAsync({
            targetId: controllerId,
            data: { controllerId, name: newName },
        });
    }, [updateTargetMutation]);

    const handleAssignDS = useCallback((payload: AssignPayload) => {
        if (targetToAssign?.controllerId) {
            const assignment: MgmtDistributionSetAssignment = {
                id: payload.dsId,
                type: payload.type as MgmtDistributionSetAssignmentType,
                confirmationRequired: payload.confirmationRequired,
                weight: payload.weight,
                forcetime: payload.forcetime,
                maintenanceWindow: payload.maintenanceWindow,
            };
            assignDSMutation.mutate({
                targetId: targetToAssign.controllerId,
                data: [assignment] as MgmtDistributionSetAssignments,
            });
        }
    }, [targetToAssign, assignDSMutation]);

    const handleExport = useCallback(() => {
        if (!targetsData?.content) return;
        const csvData = targetsData.content.map(t => ({
            controllerId: t.controllerId,
            name: t.name,
            description: t.description,
            ipAddress: t.ipAddress,
            targetType: t.targetTypeName,
            lastModifiedAt: t.lastModifiedAt ? dayjs(t.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss') : '',
            status: t.pollStatus?.overdue ? 'offline' : 'online'
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `targets_export_${dayjs().format('YYYYMMDD_HHmm')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [targetsData]);

    return {
        // Auth/Permissions
        isAdmin,
        t,

        // Data
        targetsData,
        targetsLoading,
        targetsFetching,
        targetsError,
        availableTags,
        availableTypes,
        dsData,
        dsLoading,

        // State
        pagination,
        selectedTargetIds,
        filters,
        filterFields,

        // Modal States
        bulkTagsModalOpen, setBulkTagsModalOpen,
        bulkTypeModalOpen, setBulkTypeModalOpen,
        bulkDeleteModalOpen, setBulkDeleteModalOpen,
        savedFiltersOpen, setSavedFiltersOpen,
        importModalOpen, setImportModalOpen,
        bulkEditModalOpen, setBulkEditModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        formModalOpen, setFormModalOpen,
        assignModalOpen, setAssignModalOpen,

        // Entity States
        targetToDelete,
        editingTarget,
        targetToAssign, setTargetToAssign,

        // Handlers
        handleTableChange,
        handleFiltersChange,
        handleApplySavedFilter,
        buildFinalQuery,
        refetchTargets,
        handleAddTarget,
        handleEditTarget,
        handleDeleteClick,
        handleDeleteConfirm,
        handleCreateTarget,
        handleInlineUpdate,
        handleAssignDS,
        handleExport,
        setSelectedTargetIds,
        setPagination,

        // Mutation States
        deletePending: deleteTargetMutation.isPending,
        createPending: createTargetMutation.isPending,
        assignPending: assignDSMutation.isPending,
    };
};
