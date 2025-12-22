import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MgmtTargetType, MgmtTargetTypeRequestBodyPost, MgmtTargetTypeRequestBodyPut } from '@/api/generated/model';

interface TargetTypeDialogProps {
    open: boolean;
    mode: 'create' | 'edit';
    initialData?: MgmtTargetType | null;
    loading?: boolean;
    onSubmit: (values: MgmtTargetTypeRequestBodyPost | MgmtTargetTypeRequestBodyPut) => void;
    onCancel: () => void;
}

const TargetTypeDialog: React.FC<TargetTypeDialogProps> = ({
    open,
    mode,
    initialData,
    loading = false,
    onSubmit,
    onCancel,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                form.setFieldsValue({
                    name: initialData.name,
                    key: initialData.key,
                    description: initialData.description,
                    colour: initialData.colour,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, mode, initialData, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch {
            // Validation failed
        }
    };

    return (
        <Modal
            title={mode === 'create' ? t('typeManagement.createTitle') : t('typeManagement.editTitle')}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label={t('table.name')}
                    rules={[{ required: true, message: t('common:validation.required') }]}
                >
                    <Input placeholder={t('form.namePlaceholder')} />
                </Form.Item>

                {mode === 'create' && (
                    <Form.Item
                        name="key"
                        label={t('typeManagement.key')}
                        rules={[{ required: true, message: t('common:validation.required') }]}
                    >
                        <Input placeholder={t('typeManagement.keyPlaceholder')} />
                    </Form.Item>
                )}

                <Form.Item
                    name="description"
                    label={t('form.description')}
                >
                    <Input.TextArea rows={3} placeholder={t('form.descriptionPlaceholder')} />
                </Form.Item>

                <Form.Item
                    name="colour"
                    label={t('typeManagement.colour')}
                >
                    <Input type="color" style={{ width: 60, padding: 2 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TargetTypeDialog;
