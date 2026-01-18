import React, { useState, useMemo, useCallback } from 'react';
import { Space, Button, Typography, Progress, Tooltip, message, Modal } from 'antd';
import { EyeOutlined, EditOutlined, PauseCircleOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetRolloutsInfinite, usePause, useResume } from '@/api/generated/rollouts/rollouts';
import type { MgmtRolloutResponseBody, PagedListMgmtRolloutResponseBody } from '@/api/generated/model';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { DataView, EnhancedTable, FilterBuilder, type FilterValue, type FilterField, type ToolbarAction } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { useServerTable } from '@/hooks/useServerTable';
import dayjs from 'dayjs';
import { buildQueryFromFilterValues } from '@/utils/fiql';
import RolloutCreateModal from './RolloutCreateModal';
import { StatusTag, ListSummary, Highlighter } from '@/components/common';
import type { ColumnsType } from 'antd/es/table';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { axiosInstance } from '@/api/axios-instance';

const { Text } = Typography;

interface RolloutListProps {
    standalone?: boolean;
}

const RolloutList: React.FC<RolloutListProps> = ({ standalone = true }) => {
    const { t } = useTranslation(['rollouts', 'common']);
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // List Filter Store Integration
    const {
        rollouts: rolloutPersistentState,
        setRollouts: setRolloutPersistentState
    } = useListFilterStore();

    const {
        filters: persistentFilters,
        visibleColumns
    } = rolloutPersistentState;

    const filters = persistentFilters;

    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setRolloutPersistentState({ filters: newFilters });
    }, [setRolloutPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setRolloutPersistentState({ visibleColumns: columns });
    }, [setRolloutPersistentState]);

    const {
        pagination,
        sort,
        handleTableChange,
        resetPagination,
        globalSearch,
        setGlobalSearch,
        debouncedGlobalSearch,
    } = useServerTable<MgmtRolloutResponseBody>({ syncToUrl: true });

    // Pause/Resume mutations
    const pauseMutation = usePause({
        mutation: {
            onSuccess: () => {
                message.success(t('detail.messages.pauseSuccess'));
                refetch();
            },
            onError: () => {
                message.error(t('detail.messages.pauseError'));
            },
        },
    });

    const resumeMutation = useResume({
        mutation: {
            onSuccess: () => {
                message.success(t('detail.messages.resumeSuccess'));
                refetch();
            },
            onError: () => {
                message.error(t('detail.messages.resumeError'));
            },
        },
    });

    const handlePauseResume = (record: MgmtRolloutResponseBody) => {
        if (record.status === 'paused') {
            resumeMutation.mutate({ rolloutId: record.id! });
        } else if (record.status === 'running') {
            pauseMutation.mutate({ rolloutId: record.id! });
        }
    };

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('columns.name'), type: 'text' },
        {
            key: 'status',
            label: t('columns.status'),
            type: 'select',
            options: [
                { value: 'creating', label: t('filter.creating') },
                { value: 'ready', label: t('filter.ready') },
                { value: 'starting', label: t('filter.starting') },
                { value: 'running', label: t('filter.running') },
                { value: 'paused', label: t('filter.paused') },
                { value: 'finished', label: t('filter.finished') },
                { value: 'error', label: t('filter.error') },
                { value: 'waiting_for_approval', label: t('filter.waitingForApproval') },
                { value: 'scheduled', label: t('filter.scheduled') },
            ],
        },
    ], [t]);


    // Build RSQL query from filters
    const buildFinalQuery = useCallback(() => {
        const fiql = buildQueryFromFilterValues(filters);

        if (debouncedGlobalSearch) {
            const searchFields = ['name', 'description'];
            const searchQuery = searchFields
                .map(field => `${field}==*${debouncedGlobalSearch}*`)
                .join(',');

            return fiql ? `(${fiql});(${searchQuery})` : `(${searchQuery})`;
        }

        return fiql;
    }, [filters, debouncedGlobalSearch]);

    const query = buildFinalQuery();
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        error,
        refetch,
        dataUpdatedAt,
    } = useGetRolloutsInfinite(
        {
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: query || undefined,
        },
        {
            query: {
                getNextPageParam: (lastPage: PagedListMgmtRolloutResponseBody, allPages: PagedListMgmtRolloutResponseBody[]) => {
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

    const rolloutsContent = useMemo(() => {
        return infiniteData?.pages.flatMap((page: PagedListMgmtRolloutResponseBody) => page.content || []) || [];
    }, [infiniteData]);
    const totalCount = useMemo(() => infiniteData?.pages[0]?.total || 0, [infiniteData]);

    // Handle filter change
    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    const columns: ColumnsType<MgmtRolloutResponseBody> = [
        {
            title: t('common:id'),
            dataIndex: 'id',
            key: 'id',
            width: 60,
            render: (id) => <Text style={{ fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)', color: '#666' }}>{id}</Text>,
        },
        {
            title: t('columns.name'),
            dataIndex: 'name',
            key: 'name',
            width: 200,
            sorter: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
            render: (value: string) => (
                <Text strong ellipsis style={{ maxWidth: 180, fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)' }}>
                    <Highlighter text={value} search={globalSearch} />
                </Text>
            ),
        },
        {
            title: t('columns.totalTargets'),
            dataIndex: 'totalTargets',
            key: 'totalTargets',
            width: 100,
            render: (value: number) => (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{value || 0}</Text>
            ),
        },
        {
            title: t('columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            title: t('common:table.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => date ? (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{dayjs(date).format('YYYY-MM-DD HH:mm')}</Text>
            ) : (
                <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>-</Text>
            ),
        },
        {
            title: t('columns.progress'),
            key: 'progress',
            width: 150,
            render: (_, record) => {
                let percent = 0;
                if (record.status === 'finished') {
                    percent = 100;
                } else {
                    const total = record.totalTargets || 0;
                    const finished = (record.totalTargetsPerStatus as Record<string, number>)?.finished || 0;
                    percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                }
                return (
                    <Progress
                        percent={percent}
                        size="small"
                        status={record.status === 'stopped' ? 'exception' : undefined}
                        strokeColor={record.status === 'stopped' ? undefined : 'var(--ant-color-primary, var(--ant-color-primary))'}
                    />
                );
            },
        },
        {
            title: t('columns.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0} className="action-cell">
                    <Tooltip title={t('actions.view')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/rollouts/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title={t('actions.edit')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/rollouts/${record.id}`)}
                        />
                    </Tooltip>
                    {isAdmin && (record.status === 'running' || record.status === 'paused') && (
                        <Tooltip title={record.status === 'paused' ? t('actions.resume') : t('actions.pause')}>
                            <Button
                                type="text"
                                size="small"
                                icon={record.status === 'paused' ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                                onClick={() => handlePauseResume(record)}
                                loading={pauseMutation.isPending || resumeMutation.isPending}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    // Filter columns based on visibility
    const displayColumns = useMemo(() => {
        if (!visibleColumns || visibleColumns.length === 0) return columns;
        return columns.filter(col =>
            col.key === 'actions' || visibleColumns.includes(col.key as string)
        );
    }, [columns, visibleColumns]);

    // Column options for FilterBuilder
    const columnOptions = useMemo(() => [
        { key: 'id', label: t('common:id'), defaultVisible: false },
        { key: 'name', label: t('columns.name'), defaultVisible: true },
        { key: 'totalTargets', label: t('columns.totalTargets'), defaultVisible: true },
        { key: 'status', label: t('columns.status'), defaultVisible: true },
        { key: 'createdAt', label: t('common:table.createdAt'), defaultVisible: true },
        { key: 'progress', label: t('columns.progress'), defaultVisible: true },
    ], [t]);

    const summary = useMemo(() => (
        <ListSummary
            loaded={rolloutsContent.length}
            total={totalCount}
            filtersCount={filters.length}
            updatedAt={dataUpdatedAt}
            isFetching={isFetching}
        />
    ), [rolloutsContent.length, totalCount, filters.length, dataUpdatedAt, isFetching]);

    const selectionActions: ToolbarAction[] = useMemo(() => {
        const actions: ToolbarAction[] = [
            {
                key: 'pause',
                label: t('actions.pause'),
                icon: <PauseCircleOutlined />,
                onClick: () => {
                    selectedRowKeys.forEach(key => {
                        const rollout = rolloutsContent.find(r => r.id === key);
                        if (rollout && rollout.status === 'running') {
                            pauseMutation.mutate({ rolloutId: Number(key) });
                        }
                    });
                    setSelectedRowKeys([]);
                },
                disabled: !rolloutsContent.some(r => selectedRowKeys.includes(r.id!) && r.status === 'running'),
            },
            {
                key: 'resume',
                label: t('actions.resume'),
                icon: <PlayCircleOutlined />,
                onClick: () => {
                    selectedRowKeys.forEach(key => {
                        const rollout = rolloutsContent.find(r => r.id === key);
                        if (rollout && rollout.status === 'paused') {
                            resumeMutation.mutate({ rolloutId: Number(key) });
                        }
                    });
                    setSelectedRowKeys([]);
                },
                disabled: !rolloutsContent.some(r => selectedRowKeys.includes(r.id!) && r.status === 'paused'),
            },
        ];
        if (isAdmin) {
            actions.push({
                key: 'delete',
                label: t('common:actions.delete'),
                icon: <DeleteOutlined />,
                onClick: () => {
                    Modal.confirm({
                        title: t('detail.deleteRolloutConfirmTitle', { defaultValue: 'Delete Rollouts' }),
                        content: t('detail.deleteRolloutConfirmDesc', { defaultValue: 'Are you sure you want to delete the selected rollouts?' }),
                        okText: t('common:actions.delete'),
                        okType: 'danger',
                        cancelText: t('common:actions.cancel'),
                        onOk: () => {
                            selectedRowKeys.forEach(async (key) => {
                                try {
                                    await axiosInstance({
                                        url: `/rest/v1/rollouts/${key}`,
                                        method: 'DELETE'
                                    });
                                    if (key === selectedRowKeys[selectedRowKeys.length - 1]) {
                                        message.success(t('detail.messages.deleteSuccess', { defaultValue: 'Rollouts deleted successfully' }));
                                        refetch();
                                        setSelectedRowKeys([]);
                                    }
                                } catch (error) {
                                    message.error(t('detail.messages.deleteError', { defaultValue: 'Error deleting rollout' }));
                                }
                            });
                        }
                    });
                },
                danger: true,
            });
        }
        return actions;
    }, [isAdmin, t, selectedRowKeys, rolloutsContent, pauseMutation, resumeMutation, refetch]);

    return (
        <StandardListLayout
            standalone={standalone}
            title={t('list.title')}
            description={t('list.description')}
            searchBar={
                <FilterBuilder
                    fields={filterFields}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onRefresh={refetch}
                    onAdd={() => setIsCreateModalOpen(true)}
                    canAdd={isAdmin}
                    addLabel={t('createRollout')}
                    loading={isFetching}
                    extra={summary}
                    searchValue={globalSearch}
                    onSearchChange={setGlobalSearch}
                    searchPlaceholder={t('search.placeholder', { defaultValue: t('common:actions.search') })}
                    // Integrated Column Customization
                    selection={{
                        count: selectedRowKeys.length,
                        actions: selectionActions,
                        onClear: () => setSelectedRowKeys([]),
                        label: t('common:filter.selected')
                    }}
                    // Integrated Column Customization
                    columns={columnOptions}
                    visibleColumns={visibleColumns}
                    onVisibilityChange={setVisibleColumns}
                />
            }
        >
            <DataView
                loading={isLoading}
                error={error as Error}
                isEmpty={!isLoading && rolloutsContent.length === 0}
                emptyText={t('empty')}
            >
                <EnhancedTable<MgmtRolloutResponseBody>
                    dataSource={rolloutsContent}
                    columns={displayColumns}
                    rowKey="id"
                    loading={isLoading || isFetching}
                    selectedRowKeys={selectedRowKeys}
                    onSelectionChange={setSelectedRowKeys}
                    pagination={false}
                    onChange={handleTableChange}
                    scroll={{ x: 800 }}
                    onFetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                />
            </DataView>

            <RolloutCreateModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(id: number) => {
                    setIsCreateModalOpen(false);
                    navigate(`/rollouts/${id}`);
                }}
            />
        </StandardListLayout>
    );
};

export default RolloutList;
