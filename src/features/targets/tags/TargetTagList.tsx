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
    useGetTargetTags,
    useDeleteTargetTag,
    useCreateTargetTags,
    useUpdateTargetTag,
    getGetTargetTagsQueryKey,
} from '@/api/generated/target-tags/target-tags';
import type { MgmtTag } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import TargetTagDialog from './TargetTagDialog';
import styled from 'styled-components';

const { Title } = Typography;

interface MgmtTagRequestBodyPost {
    name: string;
    description?: string;
    colour?: string;
}

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

const TargetTagList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<MgmtTag | null>(null);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading } = useGetTargetTags({
        offset,
        limit: pagination.pageSize,
    });

    const deleteMutation = useDeleteTargetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.deleteSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const createMutation = useCreateTargetTags({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.createSuccess'));
                setDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const updateMutation = useUpdateTargetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.updateSuccess'));
                setDialogOpen(false);
                setEditingTag(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const handleCreate = (values: MgmtTagRequestBodyPost) => {
        createMutation.mutate({ data: [values] });
    };

    const handleUpdate = (values: MgmtTagRequestBodyPost) => {
        if (editingTag?.id) {
            updateMutation.mutate({ targetTagId: editingTag.id, data: values });
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate({ targetTagId: id });
    };

    const columns: ColumnsType<MgmtTag> = [
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
                <Tag color={record.colour || 'default'}>{name}</Tag>
            ),
        },
        {
            title: t('form.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: t('tagManagement.colour'),
            dataIndex: 'colour',
            key: 'colour',
            width: 100,
            render: (colour: string) =>
                colour ? (
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            backgroundColor: colour,
                            borderRadius: 4,
                            border: '1px solid #d9d9d9',
                        }}
                    />
                ) : (
                    '-'
                ),
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingTag(record);
                            setDialogOpen(true);
                        }}
                    />
                    {isAdmin && (
                        <Popconfirm
                            title={t('tagManagement.deleteConfirm')}
                            onConfirm={() => handleDelete(record.id)}
                            okText={t('common:confirm')}
                            cancelText={t('common:cancel')}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
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
                        {t('tagManagement.title')}
                    </Title>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingTag(null);
                        setDialogOpen(true);
                    }}
                >
                    {t('tagManagement.add')}
                </Button>
            </HeaderRow>

            <Card>
                <Table<MgmtTag>
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

            <TargetTagDialog
                open={dialogOpen}
                mode={editingTag ? 'edit' : 'create'}
                initialData={editingTag}
                loading={createMutation.isPending || updateMutation.isPending}
                onSubmit={editingTag ? handleUpdate : handleCreate}
                onCancel={() => {
                    setDialogOpen(false);
                    setEditingTag(null);
                }}
            />
        </PageContainer>
    );
};

export default TargetTagList;
