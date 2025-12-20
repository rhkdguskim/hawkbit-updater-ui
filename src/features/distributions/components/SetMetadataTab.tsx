import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    useGetMetadata2,
    useCreateMetadata2,
    useUpdateMetadata2,
    useDeleteMetadata2,
} from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtMetadata, MgmtMetadataBodyPut } from '@/api/generated/model';

interface SetMetadataTabProps {
    distributionSetId: number;
    isAdmin: boolean;
}

const SetMetadataTab: React.FC<SetMetadataTabProps> = ({ distributionSetId, isAdmin }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMetadata, setEditingMetadata] = useState<MgmtMetadata | null>(null);
    const [form] = Form.useForm();

    const { data, isLoading, refetch } = useGetMetadata2(distributionSetId);

    const createMutation = useCreateMetadata2({
        mutation: {
            onSuccess: () => {
                message.success('Metadata created successfully');
                handleCancel();
                refetch();
            },
            onError: () => message.error('Failed to create metadata'),
        },
    });

    const updateMutation = useUpdateMetadata2({
        mutation: {
            onSuccess: () => {
                message.success('Metadata updated successfully');
                handleCancel();
                refetch();
            },
            onError: () => message.error('Failed to update metadata'),
        },
    });

    const deleteMutation = useDeleteMetadata2({
        mutation: {
            onSuccess: () => {
                message.success('Metadata deleted successfully');
                refetch();
            },
            onError: () => message.error('Failed to delete metadata'),
        },
    });

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            const payload: MgmtMetadata = { key: values.key, value: values.value };
            createMutation.mutate({ distributionSetId, data: [payload] });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        if (!editingMetadata) return;
        try {
            const values = await form.validateFields();
            const payload: MgmtMetadataBodyPut = { value: values.value };
            updateMutation.mutate({
                distributionSetId,
                metadataKey: editingMetadata.key,
                data: payload,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = (key: string) => {
        deleteMutation.mutate({ distributionSetId, metadataKey: key });
    };

    const openModal = (metadata?: MgmtMetadata) => {
        if (metadata) {
            setEditingMetadata(metadata);
            form.setFieldsValue(metadata);
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

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: MgmtMetadata) => (
                <Space>
                    {isAdmin && (
                        <>
                            <Button
                                icon={<EditOutlined />}
                                type="text"
                                onClick={() => openModal(record)}
                            />
                            <Popconfirm
                                title="Delete Metadata"
                                description="Are you sure you want to delete this metadata?"
                                onConfirm={() => handleDelete(record.key)}
                                okText="Yes"
                                cancelText="No"
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
        <div>
            {isAdmin && (
                <div style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                        Add Metadata
                    </Button>
                </div>
            )}
            <Table
                dataSource={data?.content || []} // Assuming content is the array
                columns={columns}
                rowKey="key"
                loading={isLoading}
                pagination={false}
            />

            <Modal
                title={editingMetadata ? 'Edit Metadata' : 'Add Metadata'}
                open={isModalVisible}
                onOk={editingMetadata ? handleUpdate : handleCreate}
                onCancel={handleCancel}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="key"
                        label="Key"
                        rules={[{ required: true, message: 'Please enter key' }]}
                    >
                        <Input disabled={!!editingMetadata} placeholder="Key" />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="Value"
                        rules={[{ required: true, message: 'Please enter value' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Value" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SetMetadataTab;
