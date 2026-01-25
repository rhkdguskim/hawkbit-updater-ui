import React from 'react';
import { Form, Input, message, InputNumber } from 'antd';
import { PresetColorPicker } from '@/components/common/PresetColorPicker';
import { useTranslation } from 'react-i18next';
import {
    useCreateSoftwareModuleTypes,
    useUpdateSoftwareModuleType,
} from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleType } from '@/api/generated/model';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';

const FullWidthInputNumber = styled(InputNumber)`
    && {
        width: 100%;
    }
`;

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
        <StandardModal
            title={isEditing ? t('typeManagement.editType') : t('typeManagement.addType')}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            destroyOnHidden
            cancelText={t('common:actions.cancel')}
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
                    <FullWidthInputNumber min={1} disabled={isEditing} />
                </Form.Item>
                <Form.Item
                    name="colour"
                    label={t('typeManagement.columns.colour')}
                >
                    <PresetColorPicker />
                </Form.Item>
            </Form>
        </StandardModal>
    );
};

export default SoftwareModuleTypeDialog;
