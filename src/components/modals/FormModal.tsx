import React, { useEffect } from 'react';
import { Modal, Form, Button, Space, Spin } from 'antd';
import type { FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export interface FormModalProps<T> {
    /** Whether the modal is visible */
    open: boolean;
    /** Modal title */
    title: React.ReactNode;
    /** Mode: create or edit */
    mode?: 'create' | 'edit';
    /** Initial form values (for edit mode) */
    initialValues?: Partial<T>;
    /** Whether the form is submitting */
    loading?: boolean;
    /** Form content renderer - receives the form instance */
    children: React.ReactNode;
    /** Submit callback */
    onSubmit: (values: T) => void | Promise<void>;
    /** Cancel callback */
    onCancel: () => void;
    /** Submit button text */
    submitText?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Width of the modal */
    width?: number;
    /** Form instance to use externally */
    form?: FormInstance<T>;
    /** Whether to destroy form on close */
    destroyOnClose?: boolean;
    /** Disable submit button */
    disableSubmit?: boolean;
}

const FormWrapper = styled.div`
    .ant-form-item:last-child {
        margin-bottom: 0;
    }
`;

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: var(--ant-padding-lg);
`;

/**
 * Standardized form modal component.
 * Provides consistent form modal behavior across the application.
 */
export function FormModal<T extends object>({
    open,
    title,
    mode = 'create',
    initialValues,
    loading = false,
    children,
    onSubmit,
    onCancel,
    submitText,
    cancelText,
    width = 520,
    form: externalForm,
    destroyOnClose = true,
    disableSubmit = false,
}: FormModalProps<T>) {
    const { t } = useTranslation(['common']);
    const [internalForm] = Form.useForm<T>();
    const form = externalForm || internalForm;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues as T);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
        } catch {
            // Validation errors are handled by Form
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const defaultSubmitText = mode === 'create' ? t('actions.create') : t('actions.save');
    const defaultCancelText = t('actions.cancel');

    return (
        <Modal
            open={open}
            title={title}
            onCancel={handleCancel}
            width={width}
            centered
            destroyOnClose={destroyOnClose}
            closable={!loading}
            maskClosable={!loading}
            footer={
                <Space>
                    <Button onClick={handleCancel} disabled={loading}>
                        {cancelText || defaultCancelText}
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={disableSubmit}
                    >
                        {submitText || defaultSubmitText}
                    </Button>
                </Space>
            }
        >
            {loading && !children ? (
                <LoadingWrapper>
                    <Spin />
                </LoadingWrapper>
            ) : (
                <FormWrapper>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={initialValues}
                    >
                        {children}
                    </Form>
                </FormWrapper>
            )}
        </Modal>
    );
}

export default FormModal;
