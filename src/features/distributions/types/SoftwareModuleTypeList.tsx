import React, { useState } from 'react';
import { Tag, Tooltip, Space, Button, message, Modal, Typography } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTypes,
    useDeleteSoftwareModuleType,
} from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleType } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { EnhancedTable } from '@/components/patterns';
import SoftwareModuleTypeDialog from './SoftwareModuleTypeDialog';

const { Text } = Typography;



const SoftwareModuleTypeList: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtSoftwareModuleType | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, refetch } = useGetTypes({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteSoftwareModuleType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.deleteSuccess'));
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || t('typeManagement.deleteError'));
            },
        },
    });

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ softwareModuleTypeId: id }),
        });
    };

    const handleEdit = (record: MgmtSoftwareModuleType) => {
        setEditingType(record);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingType(null);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingType(null);
    };

    const handleDialogSuccess = () => {
        handleDialogClose();
        refetch();
    };

    const handleTableChange: TableProps<MgmtSoftwareModuleType>['onChange'] = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        }));
    };

    const columns: ColumnsType<MgmtSoftwareModuleType> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
            render: (id) => <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{id}</Text>,
        },
        {
            title: t('typeManagement.columns.name'),
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (text) => <Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }}>{text}</Text>,
        },
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            render: (text) => <Tag style={{ fontSize: 'var(--ant-font-size-sm)' }}>{text}</Tag>,
        },
        {
            title: t('typeManagement.columns.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{text || '-'}</Text>,
        },
        {
            title: t('typeManagement.columns.maxAssignments'),
            dataIndex: 'maxAssignments',
            key: 'maxAssignments',
            width: 100,
            render: (val) => <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>{val ?? 1}</Text>,
        },
        {
            title: t('typeManagement.columns.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 120,
            render: (colour) => colour ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 20,
                        height: 20,
                        backgroundColor: colour,
                        borderRadius: 4,
                        border: '1px solid rgba(0,0,0,0.1)',
                    }} />
                    <span style={{
                        fontSize: 'var(--ant-font-size-sm)',
                        fontFamily: 'monospace',
                        color: '#666',
                    }}>
                        {colour}
                    </span>
                </div>
            ) : <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>-</Text>,
        },
        {
            title: t('typeManagement.columns.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            width: 150,
            render: (val: number) => (
                <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>
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
                    {isAdmin && (
                        <>
                            <Tooltip title={t('common:actions.edit')}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record)}
                                />
                            </Tooltip>
                            <Tooltip title={t('common:actions.delete')}>
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                        {t('common:actions.refresh')}
                    </Button>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            {t('typeManagement.addType')}
                        </Button>
                    )}
                </Space>
            </div>
            <EnhancedTable<MgmtSoftwareModuleType>
                columns={columns}
                dataSource={data?.content || []}
                rowKey="id"
                pagination={{
                    ...pagination,
                    total: data?.total || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                loading={isLoading}
                onChange={handleTableChange}
                scroll={{ x: 900 }}
            />
            <SoftwareModuleTypeDialog
                open={dialogOpen}
                editingType={editingType}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </Space>
    );
};

export default SoftwareModuleTypeList;
