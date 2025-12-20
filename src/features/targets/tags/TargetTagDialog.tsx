import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MgmtTag } from '@/api/generated/model';

interface MgmtTagRequestBodyPost {
    name: string;
    description?: string;
    colour?: string;
}

interface TargetTagDialogProps {
    open: boolean;
    mode: 'create' | 'edit';
    initialData?: MgmtTag | null;
    loading?: boolean;
    onSubmit: (values: MgmtTagRequestBodyPost) => void;
    onCancel: () => void;
}

const TargetTagDialog: React.FC<TargetTagDialogProps> = ({
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
                    description: initialData.description,
                    colour: initialData.colour || '#1890ff',
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ colour: '#1890ff' });
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
            title={mode === 'create' ? t('tagManagement.createTitle') : t('tagManagement.editTitle')}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label={t('table.name')}
                    rules={[{ required: true, message: t('common:validation.required') }]}
                >
                    <Input placeholder={t('form.namePlaceholder')} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={t('form.description')}
                >
                    <Input.TextArea rows={3} placeholder={t('form.descriptionPlaceholder')} />
                </Form.Item>

                <Form.Item
                    name="colour"
                    label={t('tagManagement.colour')}
                >
                    <Input type="color" style={{ width: 60, padding: 2 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TargetTagDialog;
