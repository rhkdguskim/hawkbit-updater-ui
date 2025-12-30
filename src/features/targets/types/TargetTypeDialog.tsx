import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Spin, Typography, Divider, Tag, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MgmtTargetType, MgmtTargetTypeRequestBodyPost, MgmtTargetTypeRequestBodyPut, MgmtDistributionSetType } from '@/api/generated/model';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';
import { useGetCompatibleDistributionSets } from '@/api/generated/target-types/target-types';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';

const { Text } = Typography;

const FullWidthSelect = styled(Select)`
    && {
        width: 100%;
    }
`;

const ColorInput = styled(Input)`
    && {
        width: 60px;
        padding: var(--ant-padding-xxs, 4px);
    }
`;

const SectionDivider = styled(Divider)`
    && {
        margin: var(--ant-margin, 16px) 0;
    }
`;

const HintText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const WarningText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        display: block;
        margin-top: var(--ant-margin-xxs, 4px);
    }
`;

const DsTypeTag = styled(Tag)`
    && {
        margin-right: var(--ant-margin-xxs, 4px);
    }
`;

interface TargetTypeDialogProps {
    open: boolean;
    mode: 'create' | 'edit';
    initialData?: MgmtTargetType | null;
    loading?: boolean;
    onSubmit: (values: MgmtTargetTypeRequestBodyPost | MgmtTargetTypeRequestBodyPut, compatibleDsTypeIds?: number[]) => void;
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
    const [selectedDsTypes, setSelectedDsTypes] = useState<number[]>([]);

    // Fetch all DS Types for the selector
    const { data: dsTypesData, isLoading: isDsTypesLoading } = useGetDistributionSetTypes(
        { limit: 100 },
        { query: { enabled: open } }
    );

    // Fetch compatible DS Types for edit mode
    const { data: compatibleDsTypes, isLoading: isCompatibleLoading } = useGetCompatibleDistributionSets(
        initialData?.id ?? 0,
        { query: { enabled: open && mode === 'edit' && !!initialData?.id } }
    );

    const dsTypes = dsTypesData?.content || [];

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
                setSelectedDsTypes([]); // Clear selection on create mode
            }
        }
    }, [open, mode, initialData, form]);

    // Update selected types when data loads
    useEffect(() => {
        if (open && mode === 'edit' && compatibleDsTypes) {
            setSelectedDsTypes(compatibleDsTypes.map(dt => dt.id));
        }
    }, [open, mode, compatibleDsTypes]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values, selectedDsTypes);
        } catch {
            // Validation failed
        }
    };

    const handleDsTypeChange = (value: number[]) => {
        setSelectedDsTypes(value);
    };

    return (
        <StandardModal
            title={mode === 'create' ? t('typeManagement.createTitle') : t('typeManagement.editTitle')}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnHidden
            width={560}
            cancelText={t('common:actions.cancel')}
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
                    <ColorInput type="color" />
                </Form.Item>

                <SectionDivider />

                <Form.Item
                    label={
                        <Space size="small">
                            <span>{t('typeManagement.compatibleDsTypes', 'Compatible Distribution Set Types')}</span>
                            <HintText type="secondary">
                                ({t('typeManagement.compatibleDsTypesHint', 'Only these DS types can be deployed to targets of this type')})
                            </HintText>
                        </Space>
                    }
                >
                    <Spin spinning={isDsTypesLoading || isCompatibleLoading}>
                        <FullWidthSelect
                            mode="multiple"
                            placeholder={t('typeManagement.selectDsTypes', 'Select compatible DS types...')}
                            value={selectedDsTypes}
                            onChange={(val) => handleDsTypeChange(val as number[])}
                            optionFilterProp="label"
                            options={dsTypes.map((dsType: MgmtDistributionSetType) => ({
                                value: dsType.id,
                                label: dsType.name,
                            }))}
                            tagRender={(props) => {
                                const dsType = dsTypes.find((dt: MgmtDistributionSetType) => dt.id === props.value);
                                return (
                                    <DsTypeTag
                                        color={dsType?.colour || 'blue'}
                                        closable={props.closable}
                                        onClose={props.onClose}
                                    >
                                        {props.label}
                                    </DsTypeTag>
                                );
                            }}
                        />
                    </Spin>
                    {selectedDsTypes.length === 0 && (
                        <WarningText type="warning">
                            {t('typeManagement.noCompatibleWarning', 'If no DS types are selected, targets of this type will be incompatible with all deployments.')}
                        </WarningText>
                    )}
                </Form.Item>
            </Form>
        </StandardModal>
    );
};

export default TargetTypeDialog;
