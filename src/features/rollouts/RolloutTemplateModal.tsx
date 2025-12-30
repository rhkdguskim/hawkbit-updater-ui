import React, { useState } from 'react';
import {
    Card,
    Button,
    Space,
    Typography,
    Popconfirm,
    Form,
    Input,
    InputNumber,
    Checkbox,
    message,
    Empty,
    Badge,
    Tag,
    Flex,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    StarOutlined,
    CopyOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRolloutTemplateStore, type RolloutTemplate } from '@/stores/useRolloutTemplateStore';
import { StandardModal } from '@/components/patterns';

const { Title, Text } = Typography;

const TemplateCard = styled(Card) <{ $isSelected?: boolean }>`
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid ${props => props.$isSelected ? 'var(--ant-color-primary)' : 'transparent'};
    
    &:hover {
        border-color: var(--ant-color-primary-hover);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .ant-card-body {
        padding: 16px;
    }
`;

const TemplateGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--ant-margin, 16px);
    margin-bottom: var(--ant-margin-lg, 24px);
`;

const ConfigTag = styled(Tag)`
    margin: 2px;
`;

const ActionRow = styled(Flex)`
    margin-bottom: var(--ant-margin, 16px);
`;

const StarIcon = styled(StarOutlined)`
    margin-right: var(--ant-margin-xs, 8px);
    color: var(--ant-color-warning);
`;

const CopyIcon = styled(CopyOutlined)`
    margin-right: var(--ant-margin-xs, 8px);
`;

const TemplateName = styled(Text)`
    && {
        font-size: var(--ant-font-size-lg);
    }
`;

const NameBadge = styled(Badge)`
    && {
        margin-left: var(--ant-margin-xs, 8px);
    }
`;

const DescriptionText = styled(Text)`
    && {
        display: block;
        margin-top: var(--ant-margin-xs, 8px);
        margin-bottom: var(--ant-margin-sm, 12px);
    }
`;

const ConfigRow = styled(Flex)`
    gap: var(--ant-margin, 16px);
`;

const ConfigItem = styled(Form.Item)`
    flex: 1;
    min-width: 0;
`;

const FullWidthInputNumber = styled(InputNumber)`
    && {
        width: 100%;
    }
`;

const EmptyState = styled(Empty)`
    margin-bottom: var(--ant-margin-lg, 24px);
`;

interface RolloutTemplateModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (template: RolloutTemplate) => void;
    currentConfig?: {
        amountGroups: number;
        successThreshold: number;
        errorThreshold: number;
        startImmediately: boolean;
    };
}

const RolloutTemplateModal: React.FC<RolloutTemplateModalProps> = ({
    open,
    onClose,
    onSelect,
    currentConfig,
}) => {
    const { t } = useTranslation(['rollouts', 'common']);
    const { templates, addTemplate, deleteTemplate } = useRolloutTemplateStore();
    const [isCreating, setIsCreating] = useState(false);
    const [form] = Form.useForm();

    const handleSelectTemplate = (template: RolloutTemplate) => {
        onSelect(template);
        message.success(t('templates.applySuccess', { name: template.name }));
        onClose();
    };

    const handleSaveCurrentConfig = () => {
        if (!currentConfig) {
            message.warning(t('templates.noConfigToSave'));
            return;
        }
        setIsCreating(true);
        form.setFieldsValue({
            name: '',
            description: '',
            ...currentConfig,
        });
    };

    const handleCreateTemplate = async () => {
        try {
            const values = await form.validateFields();
            addTemplate({
                name: values.name,
                description: values.description,
                config: {
                    amountGroups: values.amountGroups,
                    successThreshold: values.successThreshold,
                    errorThreshold: values.errorThreshold,
                    startImmediately: values.startImmediately || false,
                },
            });
            message.success(t('templates.createSuccess'));
            setIsCreating(false);
            form.resetFields();
        } catch {
            // Validation error
        }
    };

    const handleDeleteTemplate = (id: string) => {
        deleteTemplate(id);
        message.success(t('templates.deleteSuccess'));
    };

    const defaultTemplates = templates.filter(t => t.isDefault);
    const customTemplates = templates.filter(t => !t.isDefault);

    return (
        <StandardModal
            title={t('templates.title')}
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnClose
        >
            {isCreating ? (
                <div>
                    <Title level={5}>{t('templates.createNew')}</Title>
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="name"
                            label={t('templates.name')}
                            rules={[{ required: true, message: t('templates.nameRequired') }]}
                        >
                            <Input placeholder={t('templates.namePlaceholder')} />
                        </Form.Item>
                        <Form.Item name="description" label={t('templates.description')}>
                            <Input.TextArea rows={2} placeholder={t('templates.descriptionPlaceholder')} />
                        </Form.Item>
                        <ConfigRow>
                            <ConfigItem name="amountGroups" label={t('wizard.groupSettings.amountGroups')}>
                                <FullWidthInputNumber min={1} max={100} />
                            </ConfigItem>
                            <ConfigItem name="successThreshold" label={t('wizard.groupSettings.successThreshold')}>
                                <FullWidthInputNumber min={0} max={100} formatter={v => `${v}%`} parser={v => v?.replace('%', '') as any} />
                            </ConfigItem>
                            <ConfigItem name="errorThreshold" label={t('wizard.groupSettings.errorThreshold')}>
                                <FullWidthInputNumber min={0} max={100} formatter={v => `${v}%`} parser={v => v?.replace('%', '') as any} />
                            </ConfigItem>
                        </ConfigRow>
                        <Form.Item name="startImmediately" valuePropName="checked">
                            <Checkbox>{t('wizard.groupSettings.startImmediately')}</Checkbox>
                        </Form.Item>
                        <Space>
                            <Button onClick={() => setIsCreating(false)}>{t('common:actions.cancel')}</Button>
                            <Button type="primary" icon={<SaveOutlined />} onClick={handleCreateTemplate}>
                                {t('templates.saveTemplate')}
                            </Button>
                        </Space>
                    </Form>
                </div>
            ) : (
                <>
                    <ActionRow justify="flex-end">
                        {currentConfig && (
                            <Button icon={<SaveOutlined />} onClick={handleSaveCurrentConfig}>
                                {t('templates.saveCurrentAsTemplate')}
                            </Button>
                        )}
                    </ActionRow>

                    <Title level={5}>
                        <StarIcon />
                        {t('templates.defaultTemplates')}
                    </Title>
                    <TemplateGrid>
                        {defaultTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                hoverable
                                onClick={() => handleSelectTemplate(template)}
                            >
                                <Flex justify="space-between" align="flex-start">
                                    <div>
                                        <TemplateName strong>{template.name}</TemplateName>
                                        <NameBadge status="default" />
                                    </div>
                                    <Tag color="gold">{t('templates.default')}</Tag>
                                </Flex>
                                <DescriptionText type="secondary">
                                    {template.description}
                                </DescriptionText>
                                <Space wrap>
                                    <ConfigTag>
                                        {t('templates.groups')}: {template.config.amountGroups}
                                    </ConfigTag>
                                    <ConfigTag color="green">
                                        {t('templates.success')}: {template.config.successThreshold}%
                                    </ConfigTag>
                                    <ConfigTag color="red">
                                        {t('templates.error')}: {template.config.errorThreshold}%
                                    </ConfigTag>
                                </Space>
                            </TemplateCard>
                        ))}
                    </TemplateGrid>

                    <Title level={5}>
                        <CopyIcon />
                        {t('templates.customTemplates')}
                    </Title>
                    {customTemplates.length > 0 ? (
                        <TemplateGrid>
                            {customTemplates.map(template => (
                                <TemplateCard
                                    key={template.id}
                                    hoverable
                                onClick={() => handleSelectTemplate(template)}
                            >
                                <Flex justify="space-between" align="flex-start">
                                    <TemplateName strong>{template.name}</TemplateName>
                                    <Popconfirm
                                        title={t('templates.deleteConfirm')}
                                            onConfirm={(e) => {
                                                e?.stopPropagation();
                                                handleDeleteTemplate(template.id);
                                            }}
                                            onCancel={(e) => e?.stopPropagation()}
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Popconfirm>
                                    </Flex>
                                    <DescriptionText type="secondary">
                                        {template.description || t('templates.noDescription')}
                                    </DescriptionText>
                                    <Space wrap>
                                        <ConfigTag>
                                            {t('templates.groups')}: {template.config.amountGroups}
                                        </ConfigTag>
                                        <ConfigTag color="green">
                                            {t('templates.success')}: {template.config.successThreshold}%
                                        </ConfigTag>
                                        <ConfigTag color="red">
                                            {t('templates.error')}: {template.config.errorThreshold}%
                                        </ConfigTag>
                                    </Space>
                                </TemplateCard>
                            ))}
                        </TemplateGrid>
                    ) : (
                        <EmptyState
                            description={t('templates.noCustomTemplates')}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleSaveCurrentConfig}
                                disabled={!currentConfig}
                            >
                                {t('templates.createFirst')}
                            </Button>
                        </EmptyState>
                    )}
                </>
            )}
        </StandardModal>
    );
};

export default RolloutTemplateModal;
