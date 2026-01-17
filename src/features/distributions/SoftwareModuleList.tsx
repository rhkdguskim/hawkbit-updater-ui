import React, { useMemo } from 'react';
import { Tag, Tooltip, Space, Button, Typography } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { EditableCell, Highlighter, ListSummary } from '@/components/common';
import type { MgmtSoftwareModule } from '@/api/generated/model';
import CreateModuleWizard from './components/CreateModuleWizard';
import dayjs from 'dayjs';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { DataView, EnhancedTable, FilterBuilder, type ToolbarAction } from '@/components/patterns';
import type { ColumnsType } from 'antd/es/table';
import { useSoftwareModuleListModel } from './hooks/useSoftwareModuleListModel';

const { Text } = Typography;

interface SoftwareModuleListProps {
    standalone?: boolean;
}

const SoftwareModuleList: React.FC<SoftwareModuleListProps> = ({ standalone = true }) => {
    const model = useSoftwareModuleListModel();
    const { t, isAdmin, navigate } = model;

    // Selection toolbar actions
    const selectionActions: ToolbarAction[] = useMemo(() => {
        const actions: ToolbarAction[] = [];
        if (isAdmin) {
            actions.push({
                key: 'delete',
                label: t('actions.deleteSelected'),
                icon: <DeleteOutlined />,
                onClick: model.handleBulkDelete,
                danger: true,
            });
        }
        return actions;
    }, [t, isAdmin, model]);

    const columns: ColumnsType<MgmtSoftwareModule> = useMemo(() => [
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
                <EditableCell
                    value={text || ''}
                    onSave={(val) => model.handleInlineUpdate(record.id, 'name', val)}
                    editable={isAdmin}
                    renderDisplay={(val) => <Highlighter text={val} search={model.globalSearch} />}
                />
            ),
        },
        {
            title: t('list.columns.version'),
            dataIndex: 'version',
            key: 'version',
            sorter: true,
            width: 80,
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
            render: (text) => (
                <Tag color="blue">
                    <Highlighter text={text || t('common:notSelected')} search={model.globalSearch} />
                </Tag>
            ),
        },
        {
            title: t('list.columns.vendor'),
            dataIndex: 'vendor',
            key: 'vendor',
            width: 120,
            render: (text, record) => (
                <EditableCell
                    value={text || ''}
                    onSave={(val) => model.handleInlineUpdate(record.id, 'vendor', val)}
                    editable={isAdmin}
                    renderDisplay={(val) => <Highlighter text={val} search={model.globalSearch} />}
                />
            ),
        },
        {
            title: t('list.columns.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text, record) => (
                <EditableCell
                    value={text || ''}
                    onSave={(val) => model.handleInlineUpdate(record.id, 'description', val)}
                    editable={isAdmin}
                    secondary
                    renderDisplay={(val) => <Highlighter text={val} search={model.globalSearch} />}
                />
            ),
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
                            onClick={() => navigate(`/distributions/modules/${record.id}`)}
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
        { key: 'vendor', label: t('list.columns.vendor'), defaultVisible: true },
        { key: 'description', label: t('list.columns.description'), defaultVisible: true },
        { key: 'lastModifiedAt', label: t('list.columns.lastModified'), defaultVisible: true },
    ], [t]);

    const summary = useMemo(() => (
        <ListSummary
            loaded={model.data.length}
            total={model.totalCount}
            filtersCount={model.filters.length}
            updatedAt={model.dataUpdatedAt}
            isFetching={model.isFetching}
        />
    ), [model.data.length, model.totalCount, model.filters.length, model.dataUpdatedAt, model.isFetching]);

    return (
        <StandardListLayout
            standalone={standalone}
            title={t('moduleList.title')}
            description={t('moduleList.description')}
            searchBar={
                <FilterBuilder
                    fields={model.filterFields}
                    filters={model.filters}
                    onFiltersChange={model.handleFiltersChange}
                    onRefresh={model.refetch}
                    onAdd={() => model.setIsCreateModalVisible(true)}
                    canAdd={isAdmin}
                    addLabel={t('actions.createModule')}
                    loading={model.isLoading || model.isFetching}
                    extra={summary}
                    searchValue={model.globalSearch}
                    onSearchChange={model.setGlobalSearch}
                    searchPlaceholder={t('list.searchPlaceholder', { field: t('modules.title') })}
                    // Integrated Column Customization
                    columns={columnOptions}
                    visibleColumns={model.visibleColumns}
                    onVisibilityChange={model.setVisibleColumns}
                    selection={{
                        count: model.selectedModuleIds.length,
                        actions: selectionActions,
                        onClear: () => model.setSelectedModuleIds([]),
                        label: t('common:filter.selected')
                    }}
                />
            }
        >
            <DataView
                loading={model.isLoading}
                error={model.error as Error}
                isEmpty={model.data.length === 0}
                emptyText={t('moduleList.empty')}
            >
                <EnhancedTable<MgmtSoftwareModule>
                    columns={displayColumns}
                    dataSource={model.data}
                    rowKey="id"
                    pagination={false}
                    loading={model.isLoading || model.isFetching}
                    onChange={model.handleTableChange}
                    selectedRowKeys={model.selectedModuleIds}
                    onSelectionChange={(keys) => model.setSelectedModuleIds(keys)}
                    scroll={{ x: 1000 }}
                    onFetchNextPage={model.fetchNextPage}
                    hasNextPage={model.hasNextPage}
                    isFetchingNextPage={model.isFetchingNextPage}
                />
            </DataView>
            <CreateModuleWizard
                visible={model.isCreateModalVisible}
                onCancel={() => model.setIsCreateModalVisible(false)}
                onSuccess={() => {
                    model.setIsCreateModalVisible(false);
                    model.refetch();
                }}
            />
        </StandardListLayout>
    );
};

export default SoftwareModuleList;
