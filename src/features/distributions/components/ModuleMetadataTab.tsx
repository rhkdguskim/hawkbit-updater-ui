import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Checkbox, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    useGetMetadata1,
    useCreateMetadata1,
    useUpdateMetadata1,
    useDeleteMetadata1,
} from '@/api/generated/software-modules/software-modules';
import type { MgmtSoftwareModuleMetadata, MgmtSoftwareModuleMetadataBodyPut } from '@/api/generated/model';

interface ModuleMetadataTabProps {
    softwareModuleId: number;
    isAdmin: boolean;
}

const ModuleMetadataTab: React.FC<ModuleMetadataTabProps> = ({ softwareModuleId, isAdmin }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMetadata, setEditingMetadata] = useState<MgmtSoftwareModuleMetadata | null>(null);
    const [form] = Form.useForm();

    const { data, isLoading, refetch } = useGetMetadata1(softwareModuleId);

    const createMutation = useCreateMetadata1({
        mutation: {
            onSuccess: () => {
                message.success('Metadata created successfully');
                handleCancel();
                refetch();
            },
            onError: () => message.error('Failed to create metadata'),
        },
    });

    const updateMutation = useUpdateMetadata1({
        mutation: {
            onSuccess: () => {
                message.success('Metadata updated successfully');
                handleCancel();
                refetch();
            },
            onError: () => message.error('Failed to update metadata'),
        },
    });

    const deleteMutation = useDeleteMetadata1({
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
            const payload: MgmtSoftwareModuleMetadata = {
                key: values.key,
                value: values.value,
                targetVisible: values.targetVisible
            };
            createMutation.mutate({ softwareModuleId, data: [payload] });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        if (!editingMetadata) return;
        try {
            const values = await form.validateFields();
            const payload: MgmtSoftwareModuleMetadataBodyPut = {
                value: values.value,
                targetVisible: values.targetVisible
            };
            updateMutation.mutate({
                softwareModuleId,
                metadataKey: editingMetadata.key,
                data: payload,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = (key: string) => {
        deleteMutation.mutate({ softwareModuleId, metadataKey: key });
    };

    const openModal = (metadata?: MgmtSoftwareModuleMetadata) => {
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
            title: 'Target Visible',
            dataIndex: 'targetVisible',
            key: 'targetVisible',
            render: (visible: boolean) => (
                <Tag color={visible ? 'green' : 'default'}>{visible ? 'Yes' : 'No'}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: MgmtSoftwareModuleMetadata) => (
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
                dataSource={data?.content || []}
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
                    <Form.Item name="targetVisible" valuePropName="checked">
                        <Checkbox>Target Visible</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ModuleMetadataTab;
