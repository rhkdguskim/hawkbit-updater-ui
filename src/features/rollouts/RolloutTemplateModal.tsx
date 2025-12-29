import React, { useState } from 'react';
import {
    Modal,
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
    gap: 16px;
    margin-bottom: 24px;
`;

const ConfigTag = styled(Tag)`
    margin: 2px;
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
        <Modal
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
                        <Flex gap={16}>
                            <Form.Item name="amountGroups" label={t('wizard.groupSettings.amountGroups')} style={{ flex: 1 }}>
                                <InputNumber min={1} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="successThreshold" label={t('wizard.groupSettings.successThreshold')} style={{ flex: 1 }}>
                                <InputNumber min={0} max={100} formatter={v => `${v}%`} parser={v => v?.replace('%', '') as any} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="errorThreshold" label={t('wizard.groupSettings.errorThreshold')} style={{ flex: 1 }}>
                                <InputNumber min={0} max={100} formatter={v => `${v}%`} parser={v => v?.replace('%', '') as any} style={{ width: '100%' }} />
                            </Form.Item>
                        </Flex>
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
                    <Flex justify="flex-end" style={{ marginBottom: 16 }}>
                        {currentConfig && (
                            <Button icon={<SaveOutlined />} onClick={handleSaveCurrentConfig}>
                                {t('templates.saveCurrentAsTemplate')}
                            </Button>
                        )}
                    </Flex>

                    <Title level={5}>
                        <StarOutlined style={{ marginRight: 8, color: '#faad14' }} />
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
                                        <Text strong style={{ fontSize: 16 }}>{template.name}</Text>
                                        <Badge status="default" style={{ marginLeft: 8 }} />
                                    </div>
                                    <Tag color="gold">{t('templates.default')}</Tag>
                                </Flex>
                                <Text type="secondary" style={{ display: 'block', marginTop: 8, marginBottom: 12 }}>
                                    {template.description}
                                </Text>
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
                        <CopyOutlined style={{ marginRight: 8 }} />
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
                                        <Text strong style={{ fontSize: 16 }}>{template.name}</Text>
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
                                    <Text type="secondary" style={{ display: 'block', marginTop: 8, marginBottom: 12 }}>
                                        {template.description || t('templates.noDescription')}
                                    </Text>
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
                        <Empty
                            description={t('templates.noCustomTemplates')}
                            style={{ marginBottom: 24 }}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleSaveCurrentConfig}
                                disabled={!currentConfig}
                            >
                                {t('templates.createFirst')}
                            </Button>
                        </Empty>
                    )}
                </>
            )}
        </Modal>
    );
};

export default RolloutTemplateModal;
