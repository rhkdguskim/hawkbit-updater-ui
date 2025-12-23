import React, { useState } from 'react';
import { Table, Tag, Tooltip, Space, Button, message, Modal } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
    useGetDistributionSetTags,
    useDeleteDistributionSetTag,
} from '@/api/generated/distribution-set-tags/distribution-set-tags';
import type { MgmtTag } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import DistributionSetTagDialog from './DistributionSetTagDialog';



const DistributionSetTagList: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<MgmtTag | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, refetch } = useGetDistributionSetTags({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteDistributionSetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.deleteSuccess'));
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || t('tagManagement.deleteError'));
            },
        },
    });

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t('tagManagement.deleteConfirmTitle'),
            content: t('tagManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ distributionsetTagId: id }),
        });
    };

    const handleEdit = (record: MgmtTag) => {
        setEditingTag(record);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingTag(null);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingTag(null);
    };

    const handleDialogSuccess = () => {
        handleDialogClose();
        refetch();
    };

    const handleTableChange: TableProps<MgmtTag>['onChange'] = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        }));
    };

    const columns: TableProps<MgmtTag>['columns'] = [
        {
            title: t('tagManagement.columns.name'),
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Tag color={record.colour || 'blue'}>{text}</Tag>
            ),
        },
        {
            title: t('tagManagement.columns.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: t('tagManagement.columns.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 140,
            render: (colour) => colour ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 28,
                        height: 28,
                        backgroundColor: colour,
                        borderRadius: 6,
                        border: '2px solid rgba(0,0,0,0.1)',
                        boxShadow: `0 2px 8px ${colour}40`,
                    }} />
                    <span style={{
                        fontSize: 12,
                        fontFamily: 'monospace',
                        color: '#666',
                    }}>
                        {colour}
                    </span>
                </div>
            ) : <span style={{ color: '#999' }}>-</span>,
        },
        {
            title: t('tagManagement.columns.lastModified'),
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
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                        {t('common:actions.refresh')}
                    </Button>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                            {t('tagManagement.addTag')}
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
                size="small"
            />
            <DistributionSetTagDialog
                open={dialogOpen}
                editingTag={editingTag}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </>
    );
};

export default DistributionSetTagList;
