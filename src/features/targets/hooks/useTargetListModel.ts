import { useState, useCallback, useMemo, useEffect } from 'react';
import { message, type TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetTargetsInfinite,
    useDeleteTarget,
    useCreateTargets,
    useUpdateTarget,
    usePostAssignedDistributionSet,
    getGetTargetsInfiniteQueryKey,
} from '@/api/generated/targets/targets';
import type { GetTargetsParams } from '@/api/generated/model';
import { axiosInstance } from '@/api/axios-instance';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';
import { buildQueryFromFilterValues, buildWildcardSearch } from '@/utils/fiql';
import { COLUMN_CONFIG } from '../config/targetListConfig';
import type { MgmtTarget, MgmtTag, MgmtTargetType, MgmtDistributionSetAssignment, MgmtDistributionSetAssignments, MgmtDistributionSetAssignmentType, PagedListMgmtTarget, ExceptionInfo } from '@/api/generated/model';
import type { FilterValue, FilterField } from '@/components/patterns';
import type { AssignPayload } from '../components';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import { isTargetOnline } from '@/entities/target/model';

export const useTargetListModel = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation('targets');

    // Pagination/Sort Hook
    const {
        pagination,
        sort,
        globalSearch,
        setGlobalSearch,
        debouncedGlobalSearch,
        handleTableChange: serverTableChange,
        resetPagination,
        setPagination,
    } = useServerTable<MgmtTarget>({
        syncToUrl: true,
        defaultSort: undefined,
        allowedSortFields: ['name', 'controllerId', 'lastModifiedAt', 'createdAt', 'lastControllerRequestAt'],
    });

    // List Filter Store Integration
    const {
        targets: targetPersistentState,
        setTargets: setTargetPersistentState
    } = useListFilterStore();

    const {
        filters,
        quickFilter,
        visibleColumns
    } = targetPersistentState;

    const [selectedTargetIds, setSelectedTargetIds] = useState<React.Key[]>([]);
    const [isAllMatchingSelected, setIsAllMatchingSelected] = useState(false);
    const [isFetchingAllIds, setIsFetchingAllIds] = useState(false);

    // Modal Open States
    const [bulkTagsModalOpen, setBulkTagsModalOpen] = useState(false);
    const [bulkTypeModalOpen, setBulkTypeModalOpen] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [dsSearch, setDsSearch] = useState('');
    const [onlyCompatible, setOnlyCompatible] = useState(true);

    // New Phase 2-6 Modal States
    const [bulkAutoConfirmModalOpen, setBulkAutoConfirmModalOpen] = useState(false);
    const [bulkAutoConfirmMode, setBulkAutoConfirmMode] = useState<'activate' | 'deactivate'>('activate');
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [drawerTarget, setDrawerTarget] = useState<MgmtTarget | null>(null);

    // Entity States for Modals (restored)
    const [targetToDelete, setTargetToDelete] = useState<MgmtTarget | null>(null);
    const [editingTarget, setEditingTarget] = useState<MgmtTarget | null>(null);
    const [targetToAssign, setTargetToAssign] = useState<MgmtTarget | null>(null);

    // Master Data Queries
    const { data: tagsData } = useGetTargetTags({ limit: 100 }, { query: { staleTime: 60000 } });
    const { data: typesData } = useGetTargetTypes({ limit: 100 }, { query: { staleTime: 60000 } });

    const availableTags = useMemo(() => (tagsData?.content as MgmtTag[]) || [], [tagsData]);
    const availableTypes = useMemo(() => (typesData?.content as MgmtTargetType[]) || [], [typesData]);

    // Filter Building - Enhanced with new filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('table.name'), type: 'text' },
        { key: 'controllerId', label: t('table.controllerId'), type: 'text' },
        { key: 'ipAddress', label: t('table.ipAddress'), type: 'text' },
        { key: 'description', label: t('form.description'), type: 'text' },
        {
            key: 'targetType',
            label: t('table.targetType'),
            type: 'select',
            options: availableTypes.map(tp => ({ value: String(tp.id), label: tp.name || String(tp.id) })),
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
                { value: 'registered', label: t('status.registered') },
            ],
        },
        {
            key: 'autoConfirmActive',
            label: t('table.autoConfirm'),
            type: 'select',
            options: [
                { value: 'true', label: t('autoConfirm.enabled') },
                { value: 'false', label: t('autoConfirm.disabled') },
            ],
        },
        {
            key: 'status',
            label: t('table.status'),
            type: 'select',
            options: [
                { value: 'online', label: t('status.online', { defaultValue: 'Online' }) },
                { value: 'offline', label: t('status.offline', { defaultValue: 'Offline' }) },
            ],
        },
    ], [t, availableTypes, availableTags]);

    const buildFinalQuery = useCallback((targetFilters: FilterValue[] = filters): string => {
        // Exclude client-side only filters like 'status' from the server-side FIQL query
        const serverFilters = targetFilters.filter(f => f.field !== 'status');

        const fiql = buildQueryFromFilterValues(serverFilters, {
            fieldMap: {
                tag: 'tag',
            },
            rawFields: ['query'],
        });

        if (debouncedGlobalSearch) {
            const searchFields = ['name', 'controllerId', 'ipAddress', 'description'];
            const searchQuery = searchFields
                .map(field => buildWildcardSearch(field, debouncedGlobalSearch))
                .join(',');

            return fiql ? `(${fiql});(${searchQuery})` : `(${searchQuery})`;
        }

        return fiql;
    }, [filters, debouncedGlobalSearch]);

    // Setters for persistent state
    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setTargetPersistentState({ filters: newFilters });
    }, [setTargetPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setTargetPersistentState({ visibleColumns: columns });
    }, [setTargetPersistentState]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        setSelectedTargetIds([]);
        setIsAllMatchingSelected(false);
        setTargetPersistentState({ quickFilter: 'all' });
        resetPagination();
    }, [setFilters, setTargetPersistentState, resetPagination, setSelectedTargetIds, setIsAllMatchingSelected]);

    // Reset query cache on unmount to prevent UI stutter on re-entry
    useEffect(() => {
        return () => {
            // Removes all infinite queries for targets effectively resetting the list state
            queryClient.removeQueries({ queryKey: ['infinite', '/rest/v1/targets'] });
        };
    }, [queryClient]);

    // Main Data Query
    // Main Data Query (Infinite Scroll)
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: targetsLoading,
        isFetching: targetsFetching,
        error: targetsError,
        refetch: refetchTargets,
        dataUpdatedAt: targetsUpdatedAt,
    } = useGetTargetsInfinite(
        {
            // Initial offset is handled by initialPageParam
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: buildFinalQuery() || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtTarget, allPages: PagedListMgmtTarget[]) => {
                    const pageSize = pagination.pageSize || 20;
                    if ((lastPage.content?.length || 0) < pageSize) return undefined;

                    const total = lastPage.total || 0;
                    const currentOffset = allPages.length * pageSize;
                    return currentOffset < total ? currentOffset : undefined;
                },
                initialPageParam: 0,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                staleTime: 30000,
                refetchInterval: () => {
                    if (typeof document === 'undefined') return 30000;
                    return document.visibilityState === 'visible' ? 30000 : false;
                },
            }
        }
    );

    const targetsContent = useMemo(() => {
        let content = infiniteData?.pages.flatMap((page: PagedListMgmtTarget) => page.content || []) || [];

        // Client-side filtering for status since server-side might not support it well
        const statusFilter = filters.find(f => f.field === 'status')?.value;
        if (statusFilter === 'online') {
            content = content.filter(t => isTargetOnline(t));
        } else if (statusFilter === 'offline') {
            content = content.filter(t => !isTargetOnline(t));
        }

        return content;
    }, [infiniteData, filters]);

    const totalTargets = useMemo(() => {
        return infiniteData?.pages[0]?.total || 0;
    }, [infiniteData]);

    const handleSelectAllMatching = useCallback(async () => {
        setIsFetchingAllIds(true);
        try {
            const response = await axiosInstance<PagedListMgmtTarget>({
                url: `/rest/v1/targets`,
                method: 'GET',
                params: {
                    limit: 1000,
                    q: buildFinalQuery() || undefined,
                },
            });
            const allIds = response.content?.map((target: MgmtTarget) => target.controllerId) || [];
            setSelectedTargetIds(allIds);
            setIsAllMatchingSelected(true);
        } catch (error) {
            message.error(t('common:messages.error'));
        } finally {
            setIsFetchingAllIds(false);
        }
    }, [buildFinalQuery, t]);

    const handleSelectionChange = useCallback((keys: React.Key[]) => {
        setSelectedTargetIds(keys);
        if (keys.length === 0) {
            setIsAllMatchingSelected(false);
        } else if (keys.length < totalTargets) {
            setIsAllMatchingSelected(false);
        }
    }, [totalTargets]);

    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets(
        {
            limit: 100,
            q: useMemo(() => {
                const parts: string[] = [];
                if (dsSearch) parts.push(`name==*${dsSearch}*,description==*${dsSearch}*`);
                if (onlyCompatible && targetToAssign?.targetTypeName) {
                    parts.push(`type.key==${targetToAssign.targetTypeName}`);
                }
                return parts.length > 0 ? parts.join(';') : undefined;
            }, [dsSearch, onlyCompatible, targetToAssign])
        },
        { query: { enabled: assignModalOpen } }
    );

    const handleDsSearch = useCallback((value: string) => {
        setDsSearch(value);
    }, []);

    const handleCompatibleChange = useCallback((checked: boolean) => {
        setOnlyCompatible(checked);
    }, []);

    // Mutations
    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSuccess'));
                setDeleteModalOpen(false);
                setTargetToDelete(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
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
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
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
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
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
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
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
        if (!targetsContent) return;
        const csvData = targetsContent.map(target => ({
            controllerId: target.controllerId,
            name: target.name,
            description: target.description,
            ipAddress: target.ipAddress,
            targetType: target.targetTypeName,
            lastModifiedAt: target.lastModifiedAt ? dayjs(target.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss') : '',
            status: target.pollStatus?.overdue ? 'offline' : 'online'
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
    }, [targetsContent]);

    return {
        // Auth/Permissions
        isAdmin,
        t,

        // Data
        targetsData: targetsContent,
        totalTargets,
        targetsLoading,
        targetsFetching,
        targetsError,
        targetsUpdatedAt,
        availableTags,
        availableTypes,
        dsData,
        dsLoading,

        // State
        pagination,
        selectedTargetIds,
        filters,
        filterFields,

        // Infinite Scroll State
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,

        // Modal States
        bulkTagsModalOpen, setBulkTagsModalOpen,
        bulkTypeModalOpen, setBulkTypeModalOpen,
        bulkDeleteModalOpen, setBulkDeleteModalOpen,
        importModalOpen, setImportModalOpen,
        bulkEditModalOpen, setBulkEditModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        formModalOpen, setFormModalOpen,
        assignModalOpen, setAssignModalOpen,

        // New Phase 2-6 Modal States
        bulkAutoConfirmModalOpen, setBulkAutoConfirmModalOpen,
        bulkAutoConfirmMode, setBulkAutoConfirmMode,
        detailDrawerOpen, setDetailDrawerOpen,
        drawerTarget, setDrawerTarget,

        // Column & Quick Filter States
        visibleColumns,
        quickFilter,

        // Entity States
        targetToDelete,
        editingTarget,
        targetToAssign, setTargetToAssign,
        dsSearch,
        onlyCompatible,

        // Handlers
        handleTableChange,
        handleFiltersChange,
        buildFinalQuery,
        refetchTargets,
        handleAddTarget,
        handleEditTarget,
        handleDeleteClick,
        handleDeleteConfirm,
        handleCreateTarget,
        handleInlineUpdate,
        handleAssignDS,
        handleDsSearch,
        handleCompatibleChange,
        handleExport,
        setSelectedTargetIds,
        setPagination,
        setVisibleColumns,
        globalSearch,
        setGlobalSearch,
        isAllMatchingSelected,
        isFetchingAllIds,
        handleSelectAllMatching,
        handleSelectionChange,

        // Column options for FilterBuilder
        columnOptions: useMemo(() => COLUMN_CONFIG.filter(c => c.key !== 'actions').map(c => ({
            key: c.key,
            label: t(`table.${c.key}`),
            defaultVisible: c.defaultVisible
        })), [t]),

        // Mutation States
        deletePending: deleteTargetMutation.isPending,
        createPending: createTargetMutation.isPending,
        assignPending: assignDSMutation.isPending,
    };
};
