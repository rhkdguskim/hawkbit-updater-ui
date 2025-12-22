import React from 'react';
import { Modal, Form, Input, message, ColorPicker, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    useCreateSoftwareModuleTypes,
    useUpdateSoftwareModuleType,
} from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleType } from '@/api/generated/model';

interface SoftwareModuleTypeDialogProps {
    open: boolean;
    editingType: MgmtSoftwareModuleType | null;
    onClose: () => void;
    onSuccess: () => void;
}

const SoftwareModuleTypeDialog: React.FC<SoftwareModuleTypeDialogProps> = ({
    open,
    editingType,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation(['distributions', 'common']);
    const [form] = Form.useForm();
    const isEditing = !!editingType;

    React.useEffect(() => {
        if (open && editingType) {
            form.setFieldsValue({
                name: editingType.name,
                key: editingType.key,
                description: editingType.description,
                maxAssignments: editingType.maxAssignments ?? 1,
                colour: editingType.colour,
            });
        } else if (open) {
            form.resetFields();
            form.setFieldsValue({ maxAssignments: 1 });
        }
    }, [open, editingType, form]);

    const createMutation = useCreateSoftwareModuleTypes({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.createSuccess'));
                onSuccess();
            },
            onError: (error) => {
                message.error((error as Error).message || t('typeManagement.createError'));
            },
        },
    });

    const updateMutation = useUpdateSoftwareModuleType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.updateSuccess'));
                onSuccess();
            },
            onError: (error) => {
                message.error((error as Error).message || t('typeManagement.updateError'));
            },
        },
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const colourValue = typeof values.colour === 'string'
                ? values.colour
                : values.colour?.toHexString?.() || undefined;

            if (isEditing) {
                updateMutation.mutate({
                    softwareModuleTypeId: editingType.id,
                    data: {
                        description: values.description,
                        colour: colourValue,
                    },
                });
            } else {
                createMutation.mutate({
                    data: [{
                        name: values.name,
                        key: values.key,
                        description: values.description,
                        maxAssignments: values.maxAssignments,
                        colour: colourValue,
                    }],
                });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEditing ? t('typeManagement.editType') : t('typeManagement.addType')}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label={t('typeManagement.columns.name')}
                    rules={[{ required: true, message: t('typeManagement.nameRequired') }]}
                >
                    <Input disabled={isEditing} placeholder={t('typeManagement.namePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="key"
                    label={t('typeManagement.columns.key')}
                    rules={[{ required: true, message: t('typeManagement.keyRequired') }]}
                >
                    <Input disabled={isEditing} placeholder={t('typeManagement.keyPlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="description"
                    label={t('typeManagement.columns.description')}
                >
                    <Input.TextArea rows={3} placeholder={t('typeManagement.descriptionPlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="maxAssignments"
                    label={t('typeManagement.columns.maxAssignments')}
                >
                    <InputNumber min={1} disabled={isEditing} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="colour"
                    label={t('typeManagement.columns.colour')}
                >
                    <ColorPicker format="hex" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SoftwareModuleTypeDialog;
