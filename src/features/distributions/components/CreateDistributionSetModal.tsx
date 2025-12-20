import React from 'react';
import { Modal, Form, Input, Select, Checkbox, message } from 'antd';
import { useCreateDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';
import type { MgmtDistributionSetRequestBodyPost } from '@/api/generated/model';

interface CreateDistributionSetModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreateDistributionSetModal: React.FC<CreateDistributionSetModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const { data: typesData, isLoading: isTypesLoading } = useGetDistributionSetTypes({ limit: 100 });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { mutate: createDistributionSet, isPending: isCreating } = useCreateDistributionSets({
        mutation: {
            onSuccess: () => {
                message.success('Distribution Set created successfully');
                form.resetFields();
                onSuccess();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to create Distribution Set');
            },
        },
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload: MgmtDistributionSetRequestBodyPost = {
                name: values.name,
                version: values.version,
                type: values.type,
                description: values.description,
                requiredMigrationStep: values.requiredMigrationStep,
            };
            createDistributionSet({ data: [payload] });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Create Distribution Set"
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
                    <Input placeholder="Enter distribution set name" />
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
                <Form.Item name="description" label="Description">
                    <Input.TextArea rows={3} placeholder="Enter description" />
                </Form.Item>
                <Form.Item name="requiredMigrationStep" valuePropName="checked">
                    <Checkbox>Required Migration Step</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateDistributionSetModal;
