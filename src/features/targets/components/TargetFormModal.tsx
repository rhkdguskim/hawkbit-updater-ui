import React from 'react';
import { Form, Input, Alert, Select, Tag } from 'antd';
import type { MgmtTarget, MgmtTargetType } from '@/api/generated/model';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';

const InfoAlert = styled(Alert)`
    && {
        margin-bottom: var(--ant-margin, 16px);
        margin-top: calc(var(--ant-margin-xs, 8px) * -1);
    }
`;

interface TargetFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    target?: MgmtTarget | null;
    loading: boolean;
    onSubmit: (values: { controllerId?: string; name?: string; description?: string; targetType?: number }) => void;
    onCancel: () => void;
}

import { useTranslation } from 'react-i18next';
// ...

const TargetFormModal: React.FC<TargetFormModalProps> = ({
    open,
    mode,
    target,
    loading,
    onSubmit,
    onCancel,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    const [form] = Form.useForm();
    
    const { data: typesData, isLoading: typesLoading } = useGetTargetTypes({ limit: 100 });

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            // Show validation feedback - scroll to first error field
            if (error && typeof error === 'object' && 'errorFields' in error) {
                const firstErrorField = (error as { errorFields: Array<{ name: string[] }> }).errorFields[0];
                if (firstErrorField) {
                    form.scrollToField(firstErrorField.name);
                }
            }
        }
    };

    const isEdit = mode === 'edit';

    return (
        <StandardModal
            title={isEdit ? t('modal.editTitle') : t('modal.createTitle')}
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            okText={isEdit ? t('common:actions.update') : t('common:actions.create')}
            cancelText={t('common:actions.cancel')}
            okButtonProps={{ loading }}
            cancelButtonProps={{ disabled: loading }}
            destroyOnHidden
            afterOpenChange={(open) => {
                if (open && isEdit && target) {
                    form.setFieldsValue({
                        controllerId: target.controllerId,
                        name: target.name,
                        description: target.description,
                        targetType: target.targetType,
                    });
                }
            }}
        >
            <Form
                form={form}
                layout="vertical"
                preserve={false}
                initialValues={
                    isEdit && target
                        ? {
                            controllerId: target.controllerId,
                            name: target.name,
                            description: target.description,
                            targetType: target.targetType,
                        }
                        : {}
                }
            >
                <Form.Item
                    name="controllerId"
                    label={t('form.controllerId')}
                    rules={[
                        { required: true, message: t('common:validation.required') },
                        {
                            pattern: /^[a-zA-Z0-9_-]+$/,
                            message: t('form.validation.controllerIdPattern'),
                        },
                    ]}
                >
                    <Input
                        placeholder={t('form.controllerIdPlaceholder')}
                        disabled={isEdit}
                        maxLength={64}
                    />
                </Form.Item>

                {isEdit && (
                    <InfoAlert
                        type="info"
                        message={t('form.controllerIdHelp')}
                    />
                )}

                <Form.Item
                    name="name"
                    label={t('form.name')}
                    rules={[{ max: 128, message: t('form.validation.nameMaxLength') }]}
                >
                    <Input placeholder={t('form.namePlaceholder')} maxLength={128} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={t('form.description')}
                    rules={[{ max: 512, message: t('form.validation.descriptionMaxLength') }]}
                >
                    <Input.TextArea
                        placeholder={t('form.descriptionPlaceholder')}
                        rows={3}
                        maxLength={512}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    name="targetType"
                    label={t('form.targetType')}
                >
                    <Select
                        placeholder={t('form.targetTypePlaceholder')}
                        loading={typesLoading}
                        allowClear
                        options={(typesData?.content as MgmtTargetType[] || []).map(type => ({
                            value: type.id,
                            label: <Tag color={type.colour || 'default'}>{type.name}</Tag>,
                        }))}
                    />
                </Form.Item>
            </Form>
        </StandardModal>
    );
};

export default TargetFormModal;
