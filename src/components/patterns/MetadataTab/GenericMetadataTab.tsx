import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, type TableProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TFunction } from 'i18next';

interface MetadataBase {
    key: string;
    value?: string;
}

type MutationHook<TVariables> = (options: {
    mutation: {
        onSuccess: () => void;
        onError: (error: unknown) => void;
    };
}) => {
    mutate: (variables: TVariables) => void;
    isPending: boolean;
};

interface GenericMetadataTabProps<TMetadata extends MetadataBase, TCreateVariables, TUpdateVariables, TDeleteVariables> {
    entityId: number;
    isAdmin: boolean;
    t: TFunction;
    useGetMetadata: (entityId: number) => {
        data?: { content?: TMetadata[] };
        isLoading: boolean;
        refetch: () => void;
    };
    useCreateMetadata: MutationHook<TCreateVariables>;
    useUpdateMetadata: MutationHook<TUpdateVariables>;
    useDeleteMetadata: MutationHook<TDeleteVariables>;
    buildCreateVariables: (entityId: number, values: Record<string, unknown>) => TCreateVariables;
    buildUpdateVariables: (entityId: number, metadataKey: string, values: Record<string, unknown>) => TUpdateVariables;
    buildDeleteVariables: (entityId: number, metadataKey: string) => TDeleteVariables;
    mapRecordToFormValues?: (record: TMetadata) => Record<string, unknown>;
    extraColumns?: TableProps<TMetadata>['columns'];
    extraFormItems?: React.ReactNode;
    rowKey?: TableProps<TMetadata>['rowKey'];
}

export const GenericMetadataTab = <TMetadata extends MetadataBase, TCreateVariables, TUpdateVariables, TDeleteVariables>({
    entityId,
    isAdmin,
    t,
    useGetMetadata,
    useCreateMetadata,
    useUpdateMetadata,
    useDeleteMetadata,
    buildCreateVariables,
    buildUpdateVariables,
    buildDeleteVariables,
    mapRecordToFormValues,
    extraColumns,
    extraFormItems,
    rowKey = 'key',
}: GenericMetadataTabProps<TMetadata, TCreateVariables, TUpdateVariables, TDeleteVariables>) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMetadata, setEditingMetadata] = useState<TMetadata | null>(null);
    const [form] = Form.useForm();

    const openModal = (record?: TMetadata) => {
        if (record) {
            setEditingMetadata(record);
            const formValues = mapRecordToFormValues
                ? mapRecordToFormValues(record)
                : { key: record.key, value: record.value };
            form.setFieldsValue(formValues);
        } else {
            setEditingMetadata(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingMetadata(null);
        form.resetFields();
    };

    const handleDelete = (metadataKey?: string) => {
        if (!metadataKey) return;
        deleteMutation.mutate(buildDeleteVariables(entityId, metadataKey));
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            if (!editingMetadata?.key) return;
            updateMutation.mutate(buildUpdateVariables(entityId, editingMetadata.key, values));
        } catch (error) {
            console.error(error);
        }
    };

    const { data, isLoading, refetch } = useGetMetadata(entityId);

    const createMutation = useCreateMetadata({
        mutation: {
            onSuccess: () => {
                message.success(t('metadataTab.successCreate'));
                handleCancel();
                refetch();
            },
            onError: () => message.error(t('metadataTab.errorCreate')),
        },
    });

    const updateMutation = useUpdateMetadata({
        mutation: {
            onSuccess: () => {
                message.success(t('metadataTab.successUpdate'));
                handleCancel();
                refetch();
            },
            onError: () => message.error(t('metadataTab.errorUpdate')),
        },
    });

    const deleteMutation = useDeleteMetadata({
        mutation: {
            onSuccess: () => {
                message.success(t('metadataTab.successDelete'));
                refetch();
            },
            onError: () => message.error(t('metadataTab.errorDelete')),
        },
    });

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            createMutation.mutate(buildCreateVariables(entityId, values));
        } catch (error) {
            console.error(error);
        }
    };

    const columns: TableProps<TMetadata>['columns'] = [
        {
            title: t('metadataTab.key'),
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: t('metadataTab.value'),
            dataIndex: 'value',
            key: 'value',
        },
        ...(extraColumns || []),
        {
            title: t('list.columns.actions'),
            key: 'actions',
            render: (_: unknown, record: TMetadata) => (
                <Space>
                    {isAdmin && (
                        <>
                            <Button
                                icon={<EditOutlined />}
                                type="text"
                                onClick={() => openModal(record)}
                            />
                            <Popconfirm
                                title={t('metadataTab.deleteTitle')}
                                description={t('metadataTab.deleteDesc')}
                                onConfirm={() => handleDelete(record.key)}
                                okText={t('values.yes')}
                                cancelText={t('values.no')}
                            >
                                <Button icon={<DeleteOutlined />} type="text" danger />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {isAdmin && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    {t('metadataTab.add')}
                </Button>
            )}
            <Table
                dataSource={data?.content || []}
                columns={columns}
                rowKey={rowKey}
                loading={isLoading}
                pagination={false}
            />

            <Modal
                title={editingMetadata ? t('metadataTab.edit') : t('metadataTab.add')}
                open={isModalVisible}
                onOk={editingMetadata ? handleUpdate : handleCreate}
                onCancel={handleCancel}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="key"
                        label={t('metadataTab.key')}
                        rules={[{ required: true, message: t('metadataTab.placeholderKey') }]}
                    >
                        <Input disabled={!!editingMetadata} placeholder={t('metadataTab.key')} />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label={t('metadataTab.value')}
                        rules={[{ required: true, message: t('metadataTab.placeholderValue') }]}
                    >
                        <Input.TextArea rows={3} placeholder={t('metadataTab.value')} />
                    </Form.Item>
                    {extraFormItems}
                </Form>
            </Modal>
        </Space>
    );
};
