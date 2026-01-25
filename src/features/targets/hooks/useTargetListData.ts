import { useCallback, useMemo } from 'react';
import type { TFunction } from 'i18next';
import {
    useGetTargetsInfinite,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { buildQueryFromFilterValues, buildWildcardSearch } from '@/utils/fiql';
import { isTargetOnline } from '@/entities/target/model';
import type {
    MgmtTarget,
    MgmtTag,
    MgmtTargetType,
    PagedListMgmtTarget,
} from '@/api/generated/model';
import type { FilterValue, FilterField } from '@/components/patterns';

type UseTargetListDataParams = {
    pagination: { pageSize?: number };
    sort?: string | null;
    debouncedGlobalSearch?: string;
    filters: FilterValue[];
    dsSearch: string;
    onlyCompatible: boolean;
    targetToAssign: MgmtTarget | null;
    assignModalOpen: boolean;
    t: TFunction;
};

export const useTargetListData = ({
    pagination,
    sort,
    debouncedGlobalSearch,
    filters,
    dsSearch,
    onlyCompatible,
    targetToAssign,
    assignModalOpen,
    t,
}: UseTargetListDataParams) => {
    const { data: tagsData } = useGetTargetTags({ limit: 100 }, { query: { staleTime: 60000 } });
    const { data: typesData } = useGetTargetTypes({ limit: 100 }, { query: { staleTime: 60000 } });

    const availableTags = useMemo<MgmtTag[]>(() => tagsData?.content ?? [], [tagsData]);
    const availableTypes = useMemo<MgmtTargetType[]>(() => typesData?.content ?? [], [typesData]);

    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('table.name'), type: 'text' },
        { key: 'controllerId', label: t('table.controllerId'), type: 'text' },
        { key: 'ipAddress', label: t('table.ipAddress'), type: 'text' },
        { key: 'description', label: t('form.description'), type: 'text' },
        {
            key: 'targetType',
            label: t('table.targetType'),
            type: 'select',
            options: availableTypes.map(tp => ({ value: tp.name, label: tp.name || String(tp.id) })),
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
        const serverFilters = targetFilters.filter(filter => filter.field !== 'status');

        const fiql = buildQueryFromFilterValues(serverFilters, {
            fieldMap: {
                tag: 'tag.name',
                targetType: 'targettype.name',
                controllerId: 'controllerid',
                ipAddress: 'ipaddress',
                updateStatus: 'updatestatus',
            },
            rawFields: ['query'],
        });

        if (debouncedGlobalSearch) {
            const searchFields = ['name', 'controllerid', 'ipaddress', 'description'];
            const searchQuery = searchFields
                .map(field => buildWildcardSearch(field, debouncedGlobalSearch))
                .join(',');

            return fiql ? `(${fiql});(${searchQuery})` : `(${searchQuery})`;
        }

        return fiql;
    }, [filters, debouncedGlobalSearch]);

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
            },
        }
    );

    const targetsContent = useMemo<MgmtTarget[]>(() => {
        let content = infiniteData?.pages.flatMap((page: PagedListMgmtTarget) => page.content || []) || [];

        const statusFilter = filters.find(filter => filter.field === 'status')?.value;
        if (statusFilter === 'online') {
            content = content.filter(target => isTargetOnline(target));
        } else if (statusFilter === 'offline') {
            content = content.filter(target => !isTargetOnline(target));
        }

        return content;
    }, [infiniteData, filters]);

    const totalTargets = useMemo(() => infiniteData?.pages[0]?.total || 0, [infiniteData]);

    const dsQuery = useMemo(() => {
        const parts: string[] = [];
        if (dsSearch) parts.push(`name==*${dsSearch}*,description==*${dsSearch}*`);
        if (onlyCompatible && targetToAssign?.targetTypeName) {
            parts.push(`type.key==${targetToAssign.targetTypeName}`);
        }
        return parts.length > 0 ? parts.join(';') : undefined;
    }, [dsSearch, onlyCompatible, targetToAssign]);

    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets(
        { limit: 100, q: dsQuery },
        { query: { enabled: assignModalOpen } }
    );

    return {
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
    };
};
