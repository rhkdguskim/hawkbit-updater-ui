import { useState, useCallback, useMemo, useEffect } from 'react';
import { message, type TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';
import { useQueryClient } from '@tanstack/react-query';
import { COLUMN_CONFIG } from '../types/columnConfig';
import type { MgmtTarget } from '@/api/generated/model';
import type { FilterValue } from '@/components/patterns';
import type { AssignPayload } from '../components';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import { useTargetListData } from './useTargetListData';
import { useTargetMutations } from './useTargetMutations';
import { useTargetBulkActions } from './useTargetBulkActions';

export const useTargetListModel = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation('targets');
    const queryClient = useQueryClient();

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

    const {
        targets: targetPersistentState,
        setTargets: setTargetPersistentState,
    } = useListFilterStore();

    const {
        filters,
        quickFilter,
        visibleColumns,
    } = targetPersistentState;

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

    const [bulkAutoConfirmModalOpen, setBulkAutoConfirmModalOpen] = useState(false);
    const [bulkAutoConfirmMode, setBulkAutoConfirmMode] = useState<'activate' | 'deactivate'>('activate');
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [drawerTarget, setDrawerTarget] = useState<MgmtTarget | null>(null);

    const [targetToDelete, setTargetToDelete] = useState<MgmtTarget | null>(null);
    const [editingTarget, setEditingTarget] = useState<MgmtTarget | null>(null);
    const [targetToAssign, setTargetToAssign] = useState<MgmtTarget | null>(null);

    const {
        availableTags,
        availableTypes,
        filterFields,
        buildFinalQuery,
        targetsContent,
        totalTargets,
        targetsLoading,
        targetsFetching,
        targetsError,
        targetsUpdatedAt,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetchTargets,
        dsData,
        dsLoading,
    } = useTargetListData({
        pagination,
        sort,
        debouncedGlobalSearch,
        filters,
        dsSearch,
        onlyCompatible,
        targetToAssign,
        assignModalOpen,
        t,
    });

    const {
        selectedTargetIds,
        setSelectedTargetIds,
        isAllMatchingSelected,
        setIsAllMatchingSelected,
        isFetchingAllIds,
        handleSelectAllMatching,
        handleSelectionChange,
    } = useTargetBulkActions({
        buildFinalQuery: () => buildFinalQuery(),
        totalTargets,
        onError: () => message.error(t('common:messages.error')),
    });

    const {
        deleteTargetMutation,
        createTargetMutation,
        assignDSMutation,
        handleDeleteConfirm,
        handleCreateTarget,
        handleInlineUpdate,
        handleAssignDS,
    } = useTargetMutations({
        t,
        targetToDelete,
        targetToAssign,
        setDeleteModalOpen,
        setTargetToDelete,
        setFormModalOpen,
        setEditingTarget,
        setAssignModalOpen,
        setTargetToAssign,
    });

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
    }, [setFilters, setSelectedTargetIds, setIsAllMatchingSelected, setTargetPersistentState, resetPagination]);

    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ['infinite', '/rest/v1/targets'] });
        };
    }, [queryClient]);

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

    const handleAssignPayload = useCallback((payload: AssignPayload) => {
        handleAssignDS(payload);
    }, [handleAssignDS]);

    const handleDsSearch = useCallback((value: string) => {
        setDsSearch(value);
    }, []);

    const handleCompatibleChange = useCallback((checked: boolean) => {
        setOnlyCompatible(checked);
    }, []);

    const handleExport = useCallback(() => {
        if (!targetsContent) return;
        const csvData = targetsContent.map(target => ({
            controllerId: target.controllerId,
            name: target.name,
            description: target.description,
            ipAddress: target.ipAddress,
            targetType: target.targetTypeName,
            lastModifiedAt: target.lastModifiedAt ? dayjs(target.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss') : '',
            status: target.pollStatus?.overdue ? 'offline' : 'online',
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

    const columnOptions = useMemo(() => (
        COLUMN_CONFIG.filter(c => c.key !== 'actions').map(c => ({
            key: c.key,
            label: t(`table.${c.key}`),
            defaultVisible: c.defaultVisible,
        }))
    ), [t]);

    return {
        isAdmin,
        t,

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

        pagination,
        selectedTargetIds,
        filters,
        filterFields,

        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,

        bulkTagsModalOpen, setBulkTagsModalOpen,
        bulkTypeModalOpen, setBulkTypeModalOpen,
        bulkDeleteModalOpen, setBulkDeleteModalOpen,
        importModalOpen, setImportModalOpen,
        bulkEditModalOpen, setBulkEditModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        formModalOpen, setFormModalOpen,
        assignModalOpen, setAssignModalOpen,

        bulkAutoConfirmModalOpen, setBulkAutoConfirmModalOpen,
        bulkAutoConfirmMode, setBulkAutoConfirmMode,
        detailDrawerOpen, setDetailDrawerOpen,
        drawerTarget, setDrawerTarget,

        visibleColumns,
        quickFilter,

        targetToDelete,
        editingTarget,
        targetToAssign, setTargetToAssign,
        dsSearch,
        onlyCompatible,

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
        handleAssignDS: handleAssignPayload,
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

        columnOptions,

        deletePending: deleteTargetMutation.isPending,
        createPending: createTargetMutation.isPending,
        assignPending: assignDSMutation.isPending,
    };
};
