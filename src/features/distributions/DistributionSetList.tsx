import React, { useMemo } from 'react';
import { Tag, Tooltip, Space, Button, Typography } from 'antd';
import { EyeOutlined, DeleteOutlined, TagOutlined, EditOutlined } from '@ant-design/icons';
import { EditableCell } from '@/components/common';
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

    const columns: ColumnsType<MgmtDistributionSet> = [
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
                <EditableCell
                    value={text || ''}
                    onSave={(val) => model.handleInlineUpdate(record.id, 'name', val)}
                    editable={isAdmin}
                />
            ),
        },
        {
            title: t('list.columns.version'),
            dataIndex: 'version',
            key: 'version',
            sorter: true,
            width: 100,
            render: (text) => <Tag color="blue">{text}</Tag>,
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
                <EditableCell
                    value={text || ''}
                    onSave={(val) => model.handleInlineUpdate(record.id, 'description', val)}
                    editable={isAdmin}
                    secondary
                />
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
            width: 130,
            render: (val: number) => (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}</Text>
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
                    <Tooltip title={t('common:actions.edit')}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
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
    ];

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
                />
            }
        >
            <DataView
                loading={model.isLoading || model.isFetching}
                error={model.error as Error}
                isEmpty={model.data?.content?.length === 0}
                emptyText={t('list.empty')}
            >
                <EnhancedTable<MgmtDistributionSet>
                    columns={columns}
                    dataSource={model.data?.content || []}
                    rowKey="id"
                    pagination={{
                        ...model.pagination,
                        total: model.data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        position: ['topRight'],
                    }}
                    loading={model.isLoading || model.isFetching}
                    onChange={model.handleTableChange}
                    selectedRowKeys={model.selectedSetIds}
                    onSelectionChange={(keys) => model.setSelectedSetIds(keys)}
                    selectionActions={selectionActions}
                    selectionLabel={t('common:filter.selected')}
                    scroll={{ x: 1000 }}
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
                setNames={(model.data?.content || []).filter(ds => model.selectedSetIds.includes(ds.id)).map(ds => `${ds.name} v${ds.version}`)}
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
