import React, { useEffect } from 'react';
import { Form, Input } from 'antd';
import { StandardModal } from '@/components/patterns';
import { PresetColorPicker } from './PresetColorPicker';
import type { MgmtTag } from '@/api/generated/model';

export interface TagFormValues {
    name: string;
    description?: string;
    colour?: string;
}

export interface TagFormModalProps {
    /** Whether the modal is visible */
    open: boolean;
    /** Mode: create or edit */
    mode: 'create' | 'edit';
    /** Initial data for edit mode */
    initialData?: MgmtTag | null;
    /** Loading state for the submit button */
    loading?: boolean;
    /** Called when form is submitted */
    onSubmit: (values: TagFormValues) => void;
    /** Called when modal is cancelled/closed */
    onCancel: () => void;
    /** Custom translations */
    translations?: {
        createTitle?: string;
        editTitle?: string;
        nameLabel?: string;
        namePlaceholder?: string;
        nameRequired?: string;
        descriptionLabel?: string;
        descriptionPlaceholder?: string;
        colourLabel?: string;
        cancelText?: string;
    };
}

const DEFAULT_TRANSLATIONS = {
    createTitle: 'Create Tag',
    editTitle: 'Edit Tag',
    nameLabel: 'Name',
    namePlaceholder: 'Enter tag name',
    nameRequired: 'Name is required',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Enter description (optional)',
    colourLabel: 'Colour',
    cancelText: 'Cancel',
};

/**
 * TagFormModal - A unified modal component for creating/editing tags
 * 
 * Used for both Target Tags and Distribution Set Tags
 */
export const TagFormModal: React.FC<TagFormModalProps> = ({
    open,
    mode,
    initialData,
    loading = false,
    onSubmit,
    onCancel,
    translations = {},
}) => {
    const t = { ...DEFAULT_TRANSLATIONS, ...translations };
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                form.setFieldsValue({
                    name: initialData.name,
                    description: initialData.description,
                    colour: initialData.colour || 'var(--ant-color-primary)',
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ colour: 'var(--ant-color-primary)' });
            }
        }
    }, [open, mode, initialData, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Handle ColorPicker value - it might be a Color object or string
            const colourValue = typeof values.colour === 'string'
                ? values.colour
                : values.colour?.toHexString?.() || 'var(--ant-color-primary)';

            onSubmit({
                name: values.name,
                description: values.description,
                colour: colourValue,
            });
        } catch {
            // Validation failed
        }
    };

    return (
        <StandardModal
            title={mode === 'create' ? t.createTitle : t.editTitle}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            cancelText={t.cancelText}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label={t.nameLabel}
                    rules={[{ required: true, message: t.nameRequired }]}
                >
                    <Input placeholder={t.namePlaceholder} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={t.descriptionLabel}
                >
                    <Input.TextArea rows={3} placeholder={t.descriptionPlaceholder} />
                </Form.Item>

                <Form.Item
                    name="colour"
                    label={t.colourLabel}
                >
                    <PresetColorPicker />
                </Form.Item>
            </Form>
        </StandardModal>
    );
};

export default TagFormModal;
