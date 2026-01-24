import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation(['targets', 'common']);
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
        } catch (error) {
            // Scroll to first error field
            if (error && typeof error === 'object' && 'errorFields' in error) {
                const firstErrorField = (error as { errorFields: Array<{ name: string[] }> }).errorFields[0];
                if (firstErrorField) {
                    form.scrollToField(firstErrorField.name);
                }
            }
        }
    };

    return (
        <Modal
            title={mode === 'create' ? t('metadata.addTitle') : t('metadata.editTitle')}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnHidden
            okText={mode === 'create' ? t('common:actions.create') : t('common:actions.save')}
            cancelText={t('common:actions.cancel')}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="key"
                    label={t('metadata.keyLabel')}
                    rules={[
                        { required: true, message: t('metadata.keyRequired') },
                        { pattern: /^[a-zA-Z0-9._-]+$/, message: t('metadata.keyPattern') },
                    ]}
                >
                    <Input
                        placeholder={t('metadata.keyPlaceholder')}
                        disabled={mode === 'edit'}
                    />
                </Form.Item>

                <Form.Item
                    name="value"
                    label={t('metadata.valueLabel')}
                    rules={[{ required: true, message: t('metadata.valueRequired') }]}
                >
                    <Input.TextArea
                        placeholder={t('metadata.valuePlaceholder')}
                        rows={3}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MetadataFormModal;
