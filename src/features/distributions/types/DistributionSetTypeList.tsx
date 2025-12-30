import React, { useState } from 'react';
import { Tag, Tooltip, Space, Button, message, Modal, Typography } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetDistributionSetTypes,
    useDeleteDistributionSetType,
} from '@/api/generated/distribution-set-types/distribution-set-types';
import type { MgmtDistributionSetType } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { EnhancedTable } from '@/components/patterns';
import DistributionSetTypeDialog from './DistributionSetTypeDialog';
import { ColorSwatch } from '@/components/common';
import styled from 'styled-components';

const { Text } = Typography;

const ListStack = styled(Space)`
    width: 100%;
`;

const ActionRow = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
`;

const SmallText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const SmallSecondaryText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const KeyTag = styled(Tag)`
    && {
        font-size: var(--ant-font-size-sm);
        margin: 0;
    }
`;

const DistributionSetTypeList: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtDistributionSetType | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, refetch } = useGetDistributionSetTypes({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteDistributionSetType({
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
            onOk: () => deleteMutation.mutate({ distributionSetTypeId: id }),
        });
    };

    const handleEdit = (record: MgmtDistributionSetType) => {
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

    const handleTableChange: TableProps<MgmtDistributionSetType>['onChange'] = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        }));
    };

    const columns: ColumnsType<MgmtDistributionSetType> = [
        {
            title: t('common:id', { defaultValue: 'ID' }),
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
            render: (id) => <SmallText>{id}</SmallText>,
        },
        {
            title: t('typeManagement.columns.name'),
            dataIndex: 'name',
            key: 'name',
            width: 180,
            render: (text) => <SmallText strong>{text}</SmallText>,
        },
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            render: (text) => <KeyTag>{text}</KeyTag>,
        },
        {
            title: t('typeManagement.columns.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => <SmallSecondaryText type="secondary">{text || '-'}</SmallSecondaryText>,
        },
        {
            title: t('typeManagement.columns.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 120,
            render: (colour) => <ColorSwatch color={colour} size="small" />,
        },
        {
            title: t('typeManagement.columns.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            width: 150,
            render: (val: number) => (
                <SmallText>
                    {val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'}
                </SmallText>
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
        <ListStack direction="vertical" size="middle">
            <ActionRow>
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
            </ActionRow>
            <EnhancedTable<MgmtDistributionSetType>
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
                scroll={{ x: 800 }}
            />
            <DistributionSetTypeDialog
                open={dialogOpen}
                editingType={editingType}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </ListStack>
    );
};

export default DistributionSetTypeList;
