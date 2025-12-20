import React from 'react';
import { Modal, Form, Input, message, ColorPicker } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    useCreateDistributionSetTypes,
    useUpdateDistributionSetType,
} from '@/api/generated/distribution-set-types/distribution-set-types';
import type { MgmtDistributionSetType } from '@/api/generated/model';

interface DistributionSetTypeDialogProps {
    open: boolean;
    editingType: MgmtDistributionSetType | null;
    onClose: () => void;
    onSuccess: () => void;
}

const DistributionSetTypeDialog: React.FC<DistributionSetTypeDialogProps> = ({
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
                colour: editingType.colour,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, editingType, form]);

    const createMutation = useCreateDistributionSetTypes({
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

    const updateMutation = useUpdateDistributionSetType({
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
                    distributionSetTypeId: editingType.id,
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
            destroyOnClose
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
                    name="colour"
                    label={t('typeManagement.columns.colour')}
                >
                    <ColorPicker format="hex" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DistributionSetTypeDialog;
