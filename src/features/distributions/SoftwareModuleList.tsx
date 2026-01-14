import React, { useMemo } from 'react';
import { Tag, Tooltip, Space, Button, Typography } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { EditableCell } from '@/components/common';
import type { MgmtSoftwareModule } from '@/api/generated/model';
import CreateModuleWizard from './components/CreateModuleWizard';
import dayjs from 'dayjs';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { DataView, EnhancedTable, FilterBuilder, type ToolbarAction } from '@/components/patterns';
import type { ColumnsType } from 'antd/es/table';
import { useSoftwareModuleListModel } from './hooks/useSoftwareModuleListModel';

const { Text } = Typography;

const SoftwareModuleList: React.FC = () => {
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

    const columns: ColumnsType<MgmtSoftwareModule> = [
        {
            title: t('common:table.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <Text style={{ fontSize: 'var(--ant-font-size-sm)', color: '#666' }}>{id}</Text>,
        },
        {
            title: t('list.columns.name'),
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            width: 200,
            render: (text, record) => (
                <Text strong style={{ fontSize: 12 }}>
                    <a onClick={() => navigate(`/distributions/modules/${record.id}`)}>{text}</a>
                </Text>
            ),
        },
        {
            title: t('list.columns.version'),
            dataIndex: 'version',
            key: 'version',
            sorter: true,
            width: 80,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: t('list.columns.type'),
            dataIndex: 'typeName',
            key: 'typeName',
            width: 120,
            render: (text) => <Tag color="cyan">{text || t('common:notSelected')}</Tag>,
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
                />
            ),
        },
        {
            title: t('list.columns.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            sorter: true,
            width: 130,
            render: (val: number) => (
                <Text style={{ fontSize: 12 }}>{val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}</Text>
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
    ];

    return (
        <StandardListLayout
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
                />
            }
        >
            <DataView
                loading={model.isLoading || model.isFetching}
                error={model.error as Error}
                isEmpty={model.data?.content?.length === 0}
                emptyText={t('moduleList.empty')}
            >
                <EnhancedTable<MgmtSoftwareModule>
                    columns={columns}
                    dataSource={model.data?.content || []}
                    rowKey="id"
                    pagination={{
                        current: model.pagination.current,
                        pageSize: model.pagination.pageSize,
                        total: model.data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        position: ['topRight'],
                    }}
                    loading={model.isLoading || model.isFetching}
                    onChange={model.handleTableChange}
                    selectedRowKeys={model.selectedModuleIds}
                    onSelectionChange={(keys) => model.setSelectedModuleIds(keys)}
                    selectionActions={selectionActions}
                    selectionLabel={t('common:filter.selected')}
                    scroll={{ x: 1000 }}
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
