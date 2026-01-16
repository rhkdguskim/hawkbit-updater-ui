import React, { useMemo } from 'react';
import { Tag, Tooltip, Space, Button, Typography, Flex } from 'antd';
import { EyeOutlined, DeleteOutlined, TagOutlined } from '@ant-design/icons';
import { EditableCell, Highlighter } from '@/components/common';
import type { MgmtDistributionSet } from '@/api/generated/model';
import CreateDistributionSetWizard from './components/CreateDistributionSetWizard';
import dayjs from 'dayjs';
import { DistributionSetTagsCell } from './components/DistributionSetTagsCell';
import BulkManageSetTagsModal from './components/BulkManageSetTagsModal';
import BulkDeleteDistributionSetModal from './components/BulkDeleteDistributionSetModal';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { DataView, EnhancedTable, FilterBuilder, type ToolbarAction } from '@/components/patterns';
import type { ColumnsType } from 'antd/es/table';
import { useDistributionSetListModel } from './hooks/useDistributionSetListModel';

const { Text } = Typography;

const DistributionSetList: React.FC = () => {
    const model = useDistributionSetListModel();
    const { t, isAdmin, navigate } = model;

    // Selection toolbar actions
    const selectionActions: ToolbarAction[] = useMemo(() => {
        const actions: ToolbarAction[] = [
            {
                key: 'manageTags',
                label: t('bulkAssignment.manageTags'),
                icon: <TagOutlined />,
                onClick: () => model.setBulkTagsModalOpen(true),
            },
        ];
        if (isAdmin) {
            actions.push({
                key: 'delete',
                label: t('common:actions.delete'),
                icon: <DeleteOutlined />,
                onClick: () => model.setBulkDeleteModalOpen(true),
                danger: true,
            });
        }
        return actions;
    }, [t, isAdmin, model]);

    const columns: ColumnsType<MgmtDistributionSet> = useMemo(() => [
        {
            title: t('common:table.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <Text style={{ fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)', color: '#666' }}>{id}</Text>,
        },
        {
            title: t('list.columns.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            width: 200,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Highlighter text={text} search={model.globalSearch} />
                    {isAdmin && (
                        <EditableCell
                            value={text || ''}
                            onSave={(val) => model.handleInlineUpdate(record.id, 'name', val)}
                            editable={isAdmin}
                            style={{ marginLeft: 'auto' }}
                        />
                    )}
                </div>
            ),
        },
        {
            title: t('list.columns.version'),
            dataIndex: 'version',
            key: 'version',
            sorter: true,
            width: 100,
            render: (text) => (
                <Tag color="blue">
                    <Highlighter text={text} search={model.globalSearch} />
                </Tag>
            ),
        },
        {
            title: t('list.columns.type'),
            dataIndex: 'typeName',
            key: 'typeName',
            width: 120,
            render: (text) => <Tag color="blue">{text || t('common:notSelected')}</Tag>,
        },
        {
            title: t('list.columns.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Highlighter text={text} search={model.globalSearch} />
                    {isAdmin && (
                        <EditableCell
                            value={text || ''}
                            onSave={(val) => model.handleInlineUpdate(record.id, 'description', val)}
                            editable={isAdmin}
                            secondary
                            style={{ marginLeft: 'auto' }}
                        />
                    )}
                </div>
            ),
        },
        {
            title: t('list.columns.completeness'),
            dataIndex: 'complete',
            key: 'complete',
            width: 100,
            render: (complete: boolean) => (
                <Tag color={complete ? 'success' : 'warning'}>
                    {complete ? t('tags.complete') : t('tags.incomplete')}
                </Tag>
            ),
        },
        {
            title: t('list.columns.tags'),
            key: 'tags',
            width: 160,
            render: (_, record) => <DistributionSetTagsCell distributionSetId={record.id} />,
        },
        {
            title: t('list.columns.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            sorter: true,
            width: 160,
            render: (val: number) => (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}
                </Text>
            ),
        },
        {
            title: t('common:table.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0} className="action-cell">
                    <Tooltip title={t('actions.viewDetails')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/distributions/sets/${record.id}`)}
                        />
                    </Tooltip>

                    {isAdmin && (
                        <Tooltip title={t('actions.delete')}>
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => model.handleDelete(record.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ], [t, isAdmin, model.globalSearch, model.handleInlineUpdate, navigate]);

    // Filter columns based on visibility
    const displayColumns = useMemo(() => {
        if (!model.visibleColumns || model.visibleColumns.length === 0) return columns;
        return columns.filter(col =>
            col.key === 'actions' || model.visibleColumns.includes(col.key as string)
        );
    }, [columns, model.visibleColumns]);

    // Column options for FilterBuilder
    const columnOptions = useMemo(() => [
        { key: 'id', label: t('common:table.id'), defaultVisible: false },
        { key: 'name', label: t('list.columns.name'), defaultVisible: true },
        { key: 'version', label: t('list.columns.version'), defaultVisible: true },
        { key: 'typeName', label: t('list.columns.type'), defaultVisible: true },
        { key: 'description', label: t('list.columns.description'), defaultVisible: true },
        { key: 'complete', label: t('list.columns.completeness'), defaultVisible: true },
        { key: 'tags', label: t('list.columns.tags'), defaultVisible: true },
        { key: 'lastModifiedAt', label: t('list.columns.lastModified'), defaultVisible: true },
    ], [t, model.visibleColumns]);

    return (
        <StandardListLayout
            title={t('list.title')}
            description={t('list.description')}
            searchBar={
                <FilterBuilder
                    fields={model.filterFields}
                    filters={model.filters}
                    onFiltersChange={model.handleFiltersChange}
                    onRefresh={model.refetch}
                    onAdd={() => model.setIsCreateModalVisible(true)}
                    canAdd={isAdmin}
                    addLabel={t('actions.createSet')}
                    loading={model.isLoading || model.isFetching}
                    searchValue={model.globalSearch}
                    onSearchChange={model.setGlobalSearch}
                    searchPlaceholder={t('list.searchDescription', { defaultValue: 'Search sets...' })}
                    // Integrated Column Customization
                    columns={columnOptions}
                    visibleColumns={model.visibleColumns}
                    onVisibilityChange={model.setVisibleColumns}
                    selection={{
                        count: model.selectedSetIds.length,
                        actions: selectionActions,
                        onClear: () => model.setSelectedSetIds([]),
                        label: t('common:filter.selected')
                    }}
                />
            }
        >
            <DataView
                loading={model.isLoading}
                error={model.error as Error}
                isEmpty={model.data.length === 0}
                emptyText={t('list.empty')}
            >
                <EnhancedTable<MgmtDistributionSet>
                    columns={displayColumns}
                    dataSource={model.data}
                    rowKey="id"
                    pagination={false}
                    loading={model.isLoading || model.isFetching}
                    onChange={model.handleTableChange}
                    selectedRowKeys={model.selectedSetIds}
                    onSelectionChange={(keys) => model.setSelectedSetIds(keys)}
                    scroll={{ x: 1000 }}
                    onFetchNextPage={model.fetchNextPage}
                    hasNextPage={model.hasNextPage}
                    isFetchingNextPage={model.isFetchingNextPage}
                />
            </DataView>
            <CreateDistributionSetWizard
                visible={model.isCreateModalVisible}
                onCancel={() => model.setIsCreateModalVisible(false)}
                onSuccess={() => {
                    model.setIsCreateModalVisible(false);
                    model.refetch();
                }}
            />
            <BulkManageSetTagsModal
                open={model.bulkTagsModalOpen}
                setIds={model.selectedSetIds as number[]}
                onCancel={() => model.setBulkTagsModalOpen(false)}
                onSuccess={() => {
                    model.setBulkTagsModalOpen(false);
                    model.setSelectedSetIds([]);
                    model.refetch();
                }}
            />
            <BulkDeleteDistributionSetModal
                open={model.bulkDeleteModalOpen}
                setIds={model.selectedSetIds as number[]}
                setNames={(model.data || []).filter((ds: MgmtDistributionSet) => model.selectedSetIds.includes(ds.id)).map((ds: MgmtDistributionSet) => `${ds.name} v${ds.version}`)}
                onCancel={() => model.setBulkDeleteModalOpen(false)}
                onSuccess={() => {
                    model.setBulkDeleteModalOpen(false);
                    model.setSelectedSetIds([]);
                    model.refetch();
                }}
            />
        </StandardListLayout>
    );
};

export default DistributionSetList;
