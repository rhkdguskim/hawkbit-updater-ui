import React, { useState } from 'react';
import { Table, Card, Tag, Tooltip, Space, Button, message, Modal, Typography } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
    useGetTypes,
    useDeleteSoftwareModuleType,
} from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleType } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import SoftwareModuleTypeDialog from './SoftwareModuleTypeDialog';

const { Title } = Typography;

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

    const columns: TableProps<MgmtSoftwareModuleType>['columns'] = [
        {
            title: t('typeManagement.columns.name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            render: (text) => <Tag>{text}</Tag>,
        },
        {
            title: t('typeManagement.columns.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: t('typeManagement.columns.maxAssignments'),
            dataIndex: 'maxAssignments',
            key: 'maxAssignments',
            width: 120,
            render: (val) => val ?? 1,
        },
        {
            title: t('typeManagement.columns.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 100,
            render: (colour) => colour ? (
                <div style={{
                    width: 24,
                    height: 24,
                    backgroundColor: colour,
                    borderRadius: 4,
                    border: '1px solid #d9d9d9'
                }} />
            ) : '-',
        },
        {
            title: t('typeManagement.columns.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            width: 180,
            render: (val: number) => (val ? format(val, 'yyyy-MM-dd HH:mm') : '-'),
        },
        {
            title: t('common:table.actions'),
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    {isAdmin && (
                        <>
                            <Tooltip title={t('common:actions.edit')}>
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(record)}
                                />
                            </Tooltip>
                            <Tooltip title={t('common:actions.delete')}>
                                <Button
                                    type="text"
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
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    {t('typeManagement.smTypeTitle')}
                </Title>
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
            <Table
                columns={columns}
                dataSource={data?.content || []}
                rowKey="id"
                pagination={{
                    ...pagination,
                    total: data?.total || 0,
                    showSizeChanger: true,
                }}
                loading={isLoading}
                onChange={handleTableChange}
            />
            <SoftwareModuleTypeDialog
                open={dialogOpen}
                editingType={editingType}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </Card>
    );
};

export default SoftwareModuleTypeList;
