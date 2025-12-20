import React from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import type { MgmtTarget } from '@/api/generated/model';

interface TargetFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    target?: MgmtTarget | null;
    loading: boolean;
    onSubmit: (values: { controllerId?: string; name?: string; description?: string }) => void;
    onCancel: () => void;
}

const TargetFormModal: React.FC<TargetFormModalProps> = ({
    open,
    mode,
    target,
    loading,
    onSubmit,
    onCancel,
}) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch {
            // Validation error
        }
    };

    const isEdit = mode === 'edit';

    return (
        <Modal
            title={isEdit ? 'Edit Target' : 'Add New Target'}
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            okText={isEdit ? 'Update' : 'Create'}
            okButtonProps={{ loading }}
            cancelButtonProps={{ disabled: loading }}
            destroyOnClose
            afterOpenChange={(open) => {
                if (open && isEdit && target) {
                    form.setFieldsValue({
                        controllerId: target.controllerId,
                        name: target.name,
                        description: target.description,
                    });
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false}
                initialValues={
                    isEdit && target
                        ? {
                            controllerId: target.controllerId,
                            name: target.name,
                            description: target.description,
                        }
                        : {}
                }
            >
                <Form.Item
                    name="controllerId"
                    label="Controller ID"
                    rules={[
                        { required: true, message: 'Controller ID is required' },
                        {
                            pattern: /^[a-zA-Z0-9_-]+$/,
                            message: 'Only alphanumeric characters, underscores, and hyphens allowed',
                        },
                    ]}
                >
                    <Input
                        placeholder="Enter unique controller ID"
                        disabled={isEdit}
                        maxLength={64}
                    />
                </Form.Item>

                {isEdit && (
                    <Alert
                        type="info"
                        message="Controller ID cannot be changed after creation"
                        style={{ marginBottom: 16, marginTop: -8 }}
                    />
                )}

                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ max: 128, message: 'Name cannot exceed 128 characters' }]}
                >
                    <Input placeholder="Enter display name (optional)" maxLength={128} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ max: 512, message: 'Description cannot exceed 512 characters' }]}
                >
                    <Input.TextArea
                        placeholder="Enter description (optional)"
                        rows={3}
                        maxLength={512}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TargetFormModal;
