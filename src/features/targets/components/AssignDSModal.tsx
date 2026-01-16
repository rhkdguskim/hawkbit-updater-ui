import React, { useState } from 'react';
import {
    Form,
    Select,
    Button,
    Space,
    Alert,
    Typography,
    Switch,
    Input,
    InputNumber,
    DatePicker,
    Empty,
    Spin,
    Tag,
    Flex,
    Tooltip,
} from 'antd';
import {
    SendOutlined,
    SearchOutlined,
    FilterOutlined,
    QuestionCircleOutlined,
    ClockCircleOutlined,
    FieldTimeOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import type { MgmtDistributionSet } from '@/api/generated/model';
import type { MgmtMaintenanceWindowRequestBody } from '@/api/generated/model';
import dayjs from 'dayjs';
import { StandardModal } from '@/components/patterns';

const { Text, Title } = Typography;

export type AssignType = 'soft' | 'forced' | 'timeforced' | 'downloadonly';

interface AssignDSModalProps {
    open: boolean;
    targetId: string;
    distributionSets: MgmtDistributionSet[];
    loading: boolean;
    dsLoading?: boolean;
    canForced: boolean;
    onConfirm: (payload: AssignPayload) => void;
    onCancel: () => void;
    searchTerm: string;
    onSearch: (value: string) => void;
    onlyCompatible: boolean;
    onCompatibleChange: (value: boolean) => void;
    hasTargetType: boolean;
}

import { useTranslation } from 'react-i18next';

export interface AssignPayload {
    dsId: number;
    type: AssignType;
    confirmationRequired?: boolean;
    weight?: number;
    forcetime?: number;
    maintenanceWindow?: MgmtMaintenanceWindowRequestBody;
}

const AssignDSModal: React.FC<AssignDSModalProps> = ({
    open,
    targetId,
    distributionSets,
    loading,
    dsLoading,
    canForced,
    onConfirm,
    onCancel,
    searchTerm,
    onSearch,
    onlyCompatible,
    onCompatibleChange,
    hasTargetType,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    const [form] = Form.useForm();
    const [selectedType, setSelectedType] = useState<AssignType>('soft');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const assignTypeOptions = [
        {
            value: 'soft',
            label: t('assign.soft'),
            description: t('assign.softDesc'),
        },
        {
            value: 'forced',
            label: t('assign.forced'),
            description: t('assign.forcedDesc'),
        },
        {
            value: 'timeforced',
            label: t('assign.timeforced'),
            description: t('assign.timeforcedDesc'),
        },
        {
            value: 'downloadonly',
            label: t('assign.downloadOnly'),
            description: t('assign.downloadOnlyDesc'),
        },
    ];

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const includeAdvanced = showAdvanced || values.type === 'timeforced';
            const maintenanceWindow = includeAdvanced ? values.maintenanceWindow : undefined;
            const hasMaintenanceWindow =
                maintenanceWindow &&
                (maintenanceWindow.schedule || maintenanceWindow.duration || maintenanceWindow.timezone);

            onConfirm({
                dsId: values.distributionSetId,
                type: values.type,
                confirmationRequired: includeAdvanced ? values.confirmationRequired : undefined,
                weight: includeAdvanced ? values.weight : undefined,
                forcetime:
                    values.type === 'timeforced' && values.forcetime
                        ? dayjs(values.forcetime).valueOf()
                        : undefined,
                maintenanceWindow: hasMaintenanceWindow ? maintenanceWindow : undefined,
            });
        } catch {
            // Validation error
        }
    };

    const handleTypeChange = (value: AssignType) => {
        setSelectedType(value);
        form.setFieldValue('type', value);
    };

    const handleAdvancedToggle = (checked: boolean) => {
        setShowAdvanced(checked);
        if (!checked) {
            form.setFieldsValue({
                confirmationRequired: undefined,
                weight: undefined,
                forcetime: undefined,
                maintenanceWindow: {
                    schedule: undefined,
                    duration: undefined,
                    timezone: undefined,
                },
            });
        }
    };

    const filteredTypeOptions = canForced
        ? assignTypeOptions
        : assignTypeOptions.filter((opt) => opt.value !== 'forced' && opt.value !== 'timeforced');

    const renderSelectContent = () => {
        if (dsLoading) {
            return (
                <Flex justify="center" align="center" style={{ padding: 24 }}>
                    <Spin />
                </Flex>
            );
        }
        if (distributionSets.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={searchTerm ? t('assign.noSearchResults') : t('assign.noDistributionSets')}
                    style={{ padding: 16 }}
                />
            );
        }
        return null;
    };

    return (
        <StandardModal
            title={t('assign.title')}
            open={open}
            onCancel={onCancel}
            footer={
                <Space>
                    <Button onClick={onCancel} disabled={loading}>
                        {t('common:actions.cancel')}
                    </Button>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        {t('common:actions.assign')}
                    </Button>
                </Space>
            }
            width={560}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ type: 'soft' }}
                preserve={false}
            >
                {/* Target Info Header */}
                <Alert
                    type="info"
                    showIcon
                    message={
                        <Flex justify="space-between" align="center">
                            <span>
                                {t('assign.targetLabel')} <Text strong code>{targetId}</Text>
                            </span>
                        </Flex>
                    }
                    style={{ marginBottom: 16 }}
                />

                {/* Distribution Set Selection Section */}
                <Title level={5} style={{ marginBottom: 12 }}>
                    {t('assign.selectDS')}
                </Title>

                {/* Search and Filter Controls */}
                <Flex gap={8} style={{ marginBottom: 12 }}>
                    <Input.Search
                        placeholder={t('assign.searchDS')}
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        onSearch={onSearch}
                        allowClear
                        style={{ flex: 1 }}
                    />
                    {hasTargetType && (
                        <Button
                            type={onlyCompatible ? 'primary' : 'default'}
                            icon={<FilterOutlined />}
                            onClick={() => onCompatibleChange(!onlyCompatible)}
                        >
                            {t('assign.onlyCompatible')}
                        </Button>
                    )}
                </Flex>

                <Form.Item
                    name="distributionSetId"
                    rules={[{ required: true, message: t('common:validation.required') }]}
                    style={{ marginBottom: 24 }}
                >
                    {distributionSets.length === 0 && !dsLoading ? (
                        renderSelectContent()
                    ) : (
                        <Select
                            placeholder={t('assign.selectDSPlaceholder')}
                            loading={dsLoading}
                            showSearch={false}
                            optionLabelProp="label"
                            notFoundContent={renderSelectContent()}
                            style={{ width: '100%' }}
                        >
                            {distributionSets.map((ds) => (
                                <Select.Option
                                    key={ds.id}
                                    value={ds.id}
                                    label={`${ds.name} v${ds.version}`}
                                >
                                    <Flex justify="space-between" align="center">
                                        <Space direction="vertical" size={0}>
                                            <Text strong>{ds.name}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {ds.description || t('common:noDescription')}
                                            </Text>
                                        </Space>
                                        <Space>
                                            <Tag color="blue">v{ds.version}</Tag>
                                            {ds.typeName && <Tag>{ds.typeName}</Tag>}
                                        </Space>
                                    </Flex>
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>

                {/* Assignment Type Section */}
                <Title level={5} style={{ marginBottom: 12 }}>
                    {t('assign.assignType')}
                </Title>

                <Form.Item
                    name="type"
                    rules={[{ required: true, message: t('common:validation.required') }]}
                    style={{ marginBottom: 16 }}
                >
                    <Select
                        value={selectedType}
                        onChange={handleTypeChange}
                        optionLabelProp="label"
                    >
                        {filteredTypeOptions.map((opt) => (
                            <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                                <Space direction="vertical" size={0}>
                                    <Text strong>{opt.label}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {opt.description}
                                    </Text>
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Advanced Options Toggle */}
                <Flex
                    justify="space-between"
                    align="center"
                    style={{
                        padding: '8px 12px',
                        background: 'var(--ant-color-fill-quaternary)',
                        borderRadius: 6,
                        marginBottom: 16,
                    }}
                >
                    <Text type="secondary">{t('assign.advancedOptions')}</Text>
                    <Switch size="small" checked={showAdvanced} onChange={handleAdvancedToggle} />
                </Flex>

                {(showAdvanced || selectedType === 'timeforced') && (
                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                        {/* Confirmation & Weight Row */}
                        <Flex gap={16}>
                            <Form.Item
                                name="confirmationRequired"
                                label={
                                    <Space>
                                        {t('assign.confirmationRequired')}
                                        <Tooltip title={t('assign.confirmationRequiredTooltip')}>
                                            <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
                                        </Tooltip>
                                    </Space>
                                }
                                valuePropName="checked"
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                name="weight"
                                label={
                                    <Space>
                                        {t('assign.weight')}
                                        <Tooltip title={t('assign.weightTooltip')}>
                                            <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
                                        </Tooltip>
                                    </Space>
                                }
                                style={{ flex: 1, marginBottom: 0 }}
                            >
                                <InputNumber min={1} max={1000} placeholder="1-1000" style={{ width: '100%' }} />
                            </Form.Item>
                        </Flex>

                        {/* Force Time (for timeforced only) */}
                        {selectedType === 'timeforced' && (
                            <Form.Item
                                name="forcetime"
                                label={
                                    <Space>
                                        {t('assign.forcetime')}
                                        <Tooltip title={t('assign.forcetimeTooltip')}>
                                            <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: t('assign.forcetimeRequired') }]}
                                style={{ marginBottom: 0 }}
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    placeholder={t('assign.forcetimePlaceholder')}
                                />
                            </Form.Item>
                        )}

                        {/* Maintenance Window Section */}
                        <div
                            style={{
                                padding: 12,
                                background: 'var(--ant-color-fill-quaternary)',
                                borderRadius: 8,
                                border: '1px dashed var(--ant-color-border)',
                            }}
                        >
                            <Space align="center" style={{ marginBottom: 12 }}>
                                <Text strong style={{ fontSize: 13 }}>
                                    {t('assign.maintenanceWindowLabel')}
                                </Text>
                                <Tooltip title={t('assign.maintenanceWindowTooltip')}>
                                    <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
                                </Tooltip>
                                <Tag color="default">{t('common:optional', { defaultValue: 'Optional' })}</Tag>
                            </Space>

                            <Flex gap={8}>
                                <Form.Item
                                    name={['maintenanceWindow', 'schedule']}
                                    style={{ flex: 1, marginBottom: 0 }}
                                >
                                    <Input
                                        placeholder={t('assign.maintenanceSchedulePlaceholder')}
                                        addonBefore={
                                            <Tooltip title={t('assign.maintenanceScheduleTooltip')}>
                                                <ClockCircleOutlined />
                                            </Tooltip>
                                        }
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={['maintenanceWindow', 'duration']}
                                    style={{ flex: 1, marginBottom: 0 }}
                                >
                                    <Input
                                        placeholder={t('assign.maintenanceDurationPlaceholder')}
                                        addonBefore={
                                            <Tooltip title={t('assign.maintenanceDurationTooltip')}>
                                                <FieldTimeOutlined />
                                            </Tooltip>
                                        }
                                    />
                                </Form.Item>
                                <Form.Item
                                    name={['maintenanceWindow', 'timezone']}
                                    style={{ flex: 1, marginBottom: 0 }}
                                >
                                    <Input
                                        placeholder={t('assign.maintenanceTimezonePlaceholder')}
                                        addonBefore={
                                            <Tooltip title={t('assign.maintenanceTimezoneTooltip')}>
                                                <GlobalOutlined />
                                            </Tooltip>
                                        }
                                    />
                                </Form.Item>
                            </Flex>
                        </div>
                    </Space>
                )}

                {!canForced && (
                    <Alert
                        type="warning"
                        message={t('assign.forcedWarning')}
                        style={{ marginTop: 16 }}
                    />
                )}
            </Form>
        </StandardModal>
    );
};

export default AssignDSModal;

