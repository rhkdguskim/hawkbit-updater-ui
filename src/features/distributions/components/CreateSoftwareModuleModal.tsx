import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useCreateSoftwareModules } from '@/api/generated/software-modules/software-modules';
import { useGetTypes } from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleRequestBodyPost } from '@/api/generated/model';

interface CreateSoftwareModuleModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreateSoftwareModuleModal: React.FC<CreateSoftwareModuleModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const { data: typesData, isLoading: isTypesLoading } = useGetTypes({ limit: 100 });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { mutate: createSoftwareModule, isPending: isCreating } = useCreateSoftwareModules({
        mutation: {
            onSuccess: () => {
                message.success('Software Module created successfully');
                form.resetFields();
                onSuccess();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to create Software Module');
            },
        },
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload: MgmtSoftwareModuleRequestBodyPost = {
                name: values.name,
                version: values.version,
                type: values.type,
                description: values.description,
                vendor: values.vendor,
                encrypted: false,
            };
            createSoftwareModule({ data: [payload] });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Create Software Module"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isCreating}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter the name' }]}
                >
                    <Input placeholder="Enter software module name" />
                </Form.Item>
                <Form.Item
                    name="version"
                    label="Version"
                    rules={[{ required: true, message: 'Please enter the version' }]}
                >
                    <Input placeholder="Enter version (e.g., 1.0.0)" />
                </Form.Item>
                <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: 'Please select a type' }]}
                >
                    <Select
                        placeholder="Select type"
                        loading={isTypesLoading}
                        options={typesData?.content?.map((t) => ({ label: t.name, value: t.key }))}
                    />
                </Form.Item>
                <Form.Item name="vendor" label="Vendor">
                    <Input placeholder="Enter vendor name" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={3} placeholder="Enter description" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateSoftwareModuleModal;
