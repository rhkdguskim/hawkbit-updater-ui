import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import type { MgmtMetadata } from '@/api/generated/model';

interface MetadataFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    metadata?: MgmtMetadata | null;
    loading?: boolean;
    onSubmit: (values: { key: string; value: string }) => void;
    onCancel: () => void;
}

const MetadataFormModal: React.FC<MetadataFormModalProps> = ({
    open,
    mode,
    metadata,
    loading = false,
    onSubmit,
    onCancel,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && metadata) {
                form.setFieldsValue({
                    key: metadata.key,
                    value: metadata.value,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, mode, metadata, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch {
            // Validation error
        }
    };

    return (
        <Modal
            title={mode === 'create' ? 'Add Metadata' : 'Edit Metadata'}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="key"
                    label="Key"
                    rules={[
                        { required: true, message: 'Please enter metadata key' },
                        { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Key must be alphanumeric with dots, underscores, or hyphens' },
                    ]}
                >
                    <Input
                        placeholder="e.g., config.version"
                        disabled={mode === 'edit'}
                    />
                </Form.Item>

                <Form.Item
                    name="value"
                    label="Value"
                    rules={[{ required: true, message: 'Please enter metadata value' }]}
                >
                    <Input.TextArea
                        placeholder="Enter value"
                        rows={3}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MetadataFormModal;
