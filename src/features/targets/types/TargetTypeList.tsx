import React, { useState } from 'react';
import {
    Typography,
    Card,
    Table,
    Button,
    Space,
    message,
    Popconfirm,
    Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTargetTypes,
    useDeleteTargetType,
    useCreateTargetTypes,
    useUpdateTargetType,
    getGetTargetTypesQueryKey,
} from '@/api/generated/target-types/target-types';
import type { MgmtTargetType, MgmtTargetTypeRequestBodyPost, MgmtTargetTypeRequestBodyPut } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import TargetTypeDialog from './TargetTypeDialog';
import styled from 'styled-components';

const { Title } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;

const TargetTypeList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtTargetType | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading } = useGetTargetTypes({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteTargetType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.deleteSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const createMutation = useCreateTargetTypes({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.createSuccess'));
                setDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const updateMutation = useUpdateTargetType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.updateSuccess'));
                setDialogOpen(false);
                setEditingType(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetTypesQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const handleCreate = (values: MgmtTargetTypeRequestBodyPost) => {
        createMutation.mutate({ data: [values] });
    };

    const handleUpdate = (values: MgmtTargetTypeRequestBodyPut) => {
        if (editingType?.id) {
            updateMutation.mutate({ targetTypeId: editingType.id, data: values });
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate({ targetTypeId: id });
    };

    const columns: ColumnsType<MgmtTargetType> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: t('table.name'),
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record) => (
                <Space>
                    {record.colour && (
                        <Tag color={record.colour} style={{ marginRight: 0 }}>
                            {name}
                        </Tag>
                    )}
                    {!record.colour && name}
                </Space>
            ),
        },
        {
            title: t('typeManagement.key'),
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: t('form.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    {isAdmin && (
                        <>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingType(record);
                                    setDialogOpen(true);
                                }}
                            />
                            <Popconfirm
                                title={t('typeManagement.deleteConfirm')}
                                onConfirm={() => handleDelete(record.id)}
                                okText={t('common:confirm')}
                                cancelText={t('common:cancel')}
                            >
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <PageContainer>
            <HeaderRow>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/targets')}>
                        {t('detail.backToTargets')}
                    </Button>
                    <Title level={2} style={{ margin: 0 }}>
                        {t('typeManagement.title')}
                    </Title>
                </Space>
                {isAdmin && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingType(null);
                            setDialogOpen(true);
                        }}
                    >
                        {t('typeManagement.add')}
                    </Button>
                )}
            </HeaderRow>

            <Card>
                <Table<MgmtTargetType>
                    columns={columns}
                    dataSource={data?.content || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                    }}
                />
            </Card>

            <TargetTypeDialog
                open={dialogOpen}
                mode={editingType ? 'edit' : 'create'}
                initialData={editingType}
                loading={createMutation.isPending || updateMutation.isPending}
                onSubmit={editingType ? handleUpdate : handleCreate}
                onCancel={() => {
                    setDialogOpen(false);
                    setEditingType(null);
                }}
            />
        </PageContainer>
    );
};

export default TargetTypeList;
