import React, { useCallback, useState, useMemo } from 'react';
import { Tag, Button, Tooltip, message, Typography, Space } from 'antd';
import {
    EyeOutlined,
    StopOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetActionsInfinite } from '@/api/generated/actions/actions';
import { useCancelAction, useGetTargets } from '@/api/generated/targets/targets';
import type { MgmtAction, PagedListMgmtAction } from '@/api/generated/model';
import { useTranslation } from 'react-i18next';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useServerTable } from '@/hooks/useServerTable';
import { StatusTag } from '@/components/common';
import { DataView, EnhancedTable, FilterBuilder, type ToolbarAction, type FilterValue, type FilterField } from '@/components/patterns';
import type { ColumnsType } from 'antd/es/table';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import { getActionDisplayStatus, isActionInProgress, isActionCanceled } from '@/utils/statusUtils';
import { useListFilterStore } from '@/stores/useListFilterStore';

dayjs.extend(relativeTime);

const { Text } = Typography;

const ActionList: React.FC = () => {
    const { t } = useTranslation(['actions', 'common']);
    const navigate = useNavigate();

    const {
        pagination,
        offset,
        sort,
        handleTableChange,
        resetPagination,
    } = useServerTable<MgmtAction>({ syncToUrl: true });

    const [selectedActionIds, setSelectedActionIds] = useState<React.Key[]>([]);
    const [selectedActions, setSelectedActions] = useState<MgmtAction[]>([]);
    const [selectedTargetIdsMap, setSelectedTargetIdsMap] = useState<Record<number, string>>({});

    // List Filter Store Integration
    const {
        actions: actionsPersistentState,
        setActions: setActionsPersistentState
    } = useListFilterStore();

    const {
        filters,
        quickFilter,
        visibleColumns
    } = actionsPersistentState;

    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setActionsPersistentState({ filters: newFilters });
    }, [setActionsPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setActionsPersistentState({ visibleColumns: columns });
    }, [setActionsPersistentState]);

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        {
            key: 'status',
            label: t('columns.status'),
            type: 'select',
            options: [
                { value: 'running', label: t('common:status.running') },
                { value: 'pending', label: t('common:status.pending') },
                { value: 'finished', label: t('common:status.finished') },
                { value: 'error', label: t('common:status.error') },
                { value: 'canceled', label: t('common:status.canceled') },
            ],
        },
        {
            key: 'type',
            label: t('columns.type'),
            type: 'select',
            options: [
                { value: 'update', label: t('typeLabels.update') },
                { value: 'forced', label: t('typeLabels.forced') },
                { value: 'download_only', label: t('typeLabels.download_only') },
            ],
        },
    ], [t]);

    // Build RSQL query from filters
    const buildFinalQuery = useCallback(() => buildQueryFromFilterValues(filters), [filters]);

    const query = buildFinalQuery();
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        error,
        refetch
    } = useGetActionsInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: query || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtAction, allPages: PagedListMgmtAction[]) => {
                    const total = lastPage.total || 0;
                    const currentOffset = allPages.length * (pagination.pageSize || 20);
                    return currentOffset < total ? currentOffset : undefined;
                },
                initialPageParam: 0,
                refetchOnWindowFocus: true,
                staleTime: 5000,
                refetchInterval: (queryResult) => {
                    // Poll faster if there are active actions in the current view
                    const hasActive = queryResult.state.data?.pages.some((page: PagedListMgmtAction) =>
                        page.content?.some((action: MgmtAction) => isActionInProgress(action.status))
                    );
                    return hasActive ? 5000 : 20000;
                }
            },
        }
    );

    const actionsContent = useMemo(() => {
        return infiniteData?.pages.flatMap((page: PagedListMgmtAction) => page.content || []) || [];
    }, [infiniteData]);

    const getTypeLabel = useCallback((type?: string) => {
        if (!type) return '-';
        const key = type.toLowerCase();
        return t(`actions:typeLabels.${key}`, { defaultValue: type.toUpperCase() });
    }, [t]);

    // Extract target ID from action links
    const getTargetId = useCallback((action: MgmtAction) => {
        let targetId = action._links?.target?.href?.split('/').pop();
        if (!targetId && action._links?.self?.href) {
            const match = action._links.self.href.match(/targets\/([^/]+)\/actions/);
            if (match) targetId = match[1];
        }
        return targetId;
    }, []);

    const targetIds = useMemo(() => {
        const ids = new Set<string>();
        actionsContent.forEach(action => {
            const targetId = getTargetId(action);
            if (targetId) ids.add(targetId);
        });
        return Array.from(ids);
    }, [actionsContent, getTargetId]);

    const targetQuery = useMemo(() => {
        if (targetIds.length === 0) return undefined;
        const encoded = targetIds.map(id => `"${id.replace(/"/g, '\\"')}"`);
        return encoded.map(id => `controllerId==${id}`).join(',');
    }, [targetIds]);

    const { data: targetsData } = useGetTargets(
        {
            offset: 0,
            limit: targetIds.length || 1,
            q: targetQuery,
        },
        {
            query: {
                enabled: !!targetQuery,
            },
        }
    );

    const targetMap = useMemo(() => {
        return new Map((targetsData?.content || []).map(target => [target.controllerId, target]));
    }, [targetsData]);

    // Extract distribution set info
    const getDistributionInfo = useCallback((action: MgmtAction) => {
        const dsLink = action._links?.distributionset || action._links?.distributionSet;
        if (!dsLink) return null;
        const id = dsLink.href?.split('/').pop();
        const name = dsLink.name || dsLink.title || id;
        return { id, name };
    }, []);

    const cancelMutation = useCancelAction();

    const handleBulkCancel = useCallback(async () => {
        if (selectedActions.length === 0) return;

        const cancelableIds = selectedActions
            .filter(action => isActionInProgress(action.status))
            .map(action => action.id)
            .filter((id): id is number => typeof id === 'number');

        if (cancelableIds.length === 0) {
            return;
        }

        const promises = cancelableIds.map(id => {
            const targetId = selectedTargetIdsMap[id];
            if (!targetId) {
                return Promise.reject(new Error(`Target ID not found for action ${id}`));
            }
            return cancelMutation.mutateAsync({ targetId, actionId: id });
        });

        try {
            const results = await Promise.allSettled(promises);
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                message.success(t('bulk.cancelSuccess', { count: successCount }));
                refetch();
                setSelectedActionIds([]);
                setSelectedActions([]);
                setSelectedTargetIdsMap({});
            }

            if (failCount > 0) {
                message.error(t('bulk.cancelError', { count: failCount }));
            }
        } catch (error) {
            console.error('Bulk cancel failed:', error);
            message.error(t('common:apiErrors.generic.unknown'));
        }
    }, [selectedActions, selectedTargetIdsMap, cancelMutation, t, refetch]);

    // Handle filter change
    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    const cancelableSelectionCount = useMemo(
        () => selectedActions.filter(action => isActionInProgress(action.status)).length,
        [selectedActions]
    );

    // Selection toolbar actions
    const selectionActions: ToolbarAction[] = useMemo(() => [
        {
            key: 'cancel',
            label: t('bulk.cancel', { defaultValue: 'Cancel' }),
            icon: <StopOutlined />,
            onClick: handleBulkCancel,
            danger: true,
            disabled: cancelableSelectionCount === 0,
        },
        {
            key: 'force',
            label: t('bulk.force', { defaultValue: 'Force' }),
            icon: <ThunderboltOutlined />,
            onClick: () => { },
            disabled: true,
        },
    ], [t, handleBulkCancel, cancelableSelectionCount]);

    const columns: ColumnsType<MgmtAction> = useMemo(() => [
        {
            title: t('columns.target', { defaultValue: 'Target' }),
            key: 'target',
            width: 160,
            render: (_, record) => {
                const targetId = getTargetId(record);
                if (!targetId) return <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>-</Text>;
                const target = targetMap.get(targetId);
                const targetName = target?.name || record._links?.target?.name || targetId;
                const targetIp = target?.ipAddress;
                return (
                    <a
                        onClick={(e) => { e.stopPropagation(); navigate(`/targets/${targetId}`); }}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <Space size={4} align="baseline">
                            <Text strong style={{ fontSize: '13px', lineHeight: '20px' }}>
                                {targetName}
                            </Text>
                            {targetIp ? (
                                <Text type="secondary" style={{ fontSize: '11px', fontWeight: 400 }}>
                                    {targetIp}
                                </Text>
                            ) : null}
                        </Space>
                    </a>
                );
            },
        },
        {
            title: t('columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (_, record) => {
                const displayStatus = getActionDisplayStatus(record);
                return <StatusTag status={displayStatus} showIcon />;
            },
        },
        {
            title: t('columns.type'),
            dataIndex: 'type',
            key: 'type',
            width: 90,
            render: (type: string) => (
                <Tag color={type === 'forced' ? 'red' : 'blue'} style={{ borderRadius: 8 }}>
                    {getTypeLabel(type)}
                </Tag>
            ),
        },
        {
            title: t('columns.distributionSet'),
            key: 'distributionSet',
            width: 180,
            render: (_, record) => {
                const ds = getDistributionInfo(record);
                if (!ds) return <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>-</Text>;
                return (
                    <a
                        onClick={(e) => { e.stopPropagation(); navigate(`/distributions/sets/${ds.id}`); }}
                        style={{ cursor: 'pointer' }}
                    >
                        <Text ellipsis style={{ maxWidth: 160, fontSize: 'var(--ant-font-size-sm)' }}>{ds.name}</Text>
                    </a>
                );
            },
        },
        {
            title: t('columns.createdAt', { defaultValue: 'Created' }),
            key: 'createdAt',
            width: 100,
            render: (_, record) => (
                <Tooltip title={record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}>
                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{record.createdAt ? dayjs(record.createdAt).fromNow() : '-'}</Text>
                </Tooltip>
            ),
        },
        {
            title: t('columns.actions', { defaultValue: 'Actions' }),
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0} className="action-cell">
                    <Tooltip title={t('actions.view')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={(e) => { e.stopPropagation(); navigate(`/actions/${record.id}`); }}
                        />
                    </Tooltip>
                    <Tooltip title={t('actions.cancel', { defaultValue: 'Cancel' })}>
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<StopOutlined />}
                            disabled={
                                !isActionInProgress(record.status) ||
                                isActionCanceled(record) ||
                                record.type?.toLowerCase() === 'cancel'
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                const targetId = getTargetId(record);
                                if (targetId && record.id) {
                                    cancelMutation.mutate(
                                        { targetId, actionId: record.id },
                                        {
                                            onSuccess: () => {
                                                message.success(t('actions:detail.messages.cancelSuccess'));
                                                refetch();
                                            },
                                            // onError intentionally omitted to avoid double alert (handled by global interceptor)
                                        }
                                    );
                                }
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ], [t, getTargetId, targetMap, navigate, getTypeLabel, getDistributionInfo, cancelMutation, refetch]);

    // Filter columns based on visibility
    const displayColumns = useMemo(() => {
        if (!visibleColumns || visibleColumns.length === 0) return columns;
        return columns.filter(col =>
            col.key === 'actions' || visibleColumns.includes(col.key as string)
        );
    }, [columns, visibleColumns]);

    // Column options for FilterBuilder
    const columnOptions = useMemo(() => [
        { key: 'target', label: t('columns.target'), defaultVisible: true },
        { key: 'status', label: t('columns.status'), defaultVisible: true },
        { key: 'type', label: t('columns.type'), defaultVisible: true },
        { key: 'distributionSet', label: t('columns.distributionSet'), defaultVisible: true },
        { key: 'createdAt', label: t('columns.createdAt'), defaultVisible: true },
    ], [t]);

    const handleSelectionChange = useCallback((keys: React.Key[], selectedRows: MgmtAction[]) => {
        setSelectedActionIds(keys);
        setSelectedActions(selectedRows);
        const finalMap: Record<number, string> = {};
        selectedRows.forEach(row => {
            const tid = getTargetId(row);
            if (tid && row.id) finalMap[row.id] = tid;
        });
        setSelectedTargetIdsMap(finalMap);
    }, [getTargetId]);

    return (
        <StandardListLayout
            title={t('list.title')}
            description={t('list.description')}
            searchBar={
                <FilterBuilder
                    fields={filterFields}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onRefresh={refetch}
                    loading={isLoading || isFetching}
                    // Integrated Column Customization
                    columns={columnOptions}
                    visibleColumns={visibleColumns}
                    onVisibilityChange={setVisibleColumns}
                    selection={{
                        count: selectedActionIds.length,
                        actions: selectionActions,
                        onClear: () => setSelectedActionIds([]),
                        label: t('common:filter.selected')
                    }}
                />
            }
        >
            <DataView
                loading={isLoading}
                error={error as Error}
                isEmpty={actionsContent.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtAction>
                    dataSource={actionsContent}
                    columns={displayColumns}
                    rowKey="id"
                    loading={isLoading || isFetching}
                    selectedRowKeys={selectedActionIds}
                    onSelectionChange={handleSelectionChange}
                    onRow={(record) => ({
                        onClick: () => navigate(`/actions/${record.id}`),
                        style: { cursor: 'pointer' },
                    })}
                    pagination={false}
                    onChange={handleTableChange}
                    scroll={{ x: 800 }}
                    onFetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                />
            </DataView>
        </StandardListLayout>
    );
};

export default ActionList;
