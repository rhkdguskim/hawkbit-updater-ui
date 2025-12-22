import React from 'react';
import { Modal, Form, Input, message, ColorPicker } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    useCreateDistributionSetTags,
    useUpdateDistributionSetTag,
} from '@/api/generated/distribution-set-tags/distribution-set-tags';
import type { MgmtTag } from '@/api/generated/model';

interface DistributionSetTagDialogProps {
    open: boolean;
    editingTag: MgmtTag | null;
    onClose: () => void;
    onSuccess: () => void;
}

const DistributionSetTagDialog: React.FC<DistributionSetTagDialogProps> = ({
    open,
    editingTag,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation(['distributions', 'common']);
    const [form] = Form.useForm();
    const isEditing = !!editingTag;

    React.useEffect(() => {
        if (open && editingTag) {
            form.setFieldsValue({
                name: editingTag.name,
                description: editingTag.description,
                colour: editingTag.colour,
            });
        } else if (open) {
            form.resetFields();
        }
    }, [open, editingTag, form]);

    const createMutation = useCreateDistributionSetTags({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.createSuccess'));
                onSuccess();
            },
            onError: (error) => {
                message.error((error as Error).message || t('tagManagement.createError'));
            },
        },
    });

    const updateMutation = useUpdateDistributionSetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.updateSuccess'));
                onSuccess();
            },
            onError: (error) => {
                message.error((error as Error).message || t('tagManagement.updateError'));
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
                    distributionsetTagId: editingTag.id,
                    data: {
                        name: values.name,
                        description: values.description,
                        colour: colourValue,
                    },
                });
            } else {
                createMutation.mutate({
                    data: [{
                        name: values.name,
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
            title={isEditing ? t('tagManagement.editTag') : t('tagManagement.addTag')}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label={t('tagManagement.columns.name')}
                    rules={[{ required: true, message: t('tagManagement.nameRequired') }]}
                >
                    <Input placeholder={t('tagManagement.namePlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="description"
                    label={t('tagManagement.columns.description')}
                >
                    <Input.TextArea rows={3} placeholder={t('tagManagement.descriptionPlaceholder')} />
                </Form.Item>
                <Form.Item
                    name="colour"
                    label={t('tagManagement.columns.colour')}
                >
                    <ColorPicker format="hex" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DistributionSetTagDialog;
