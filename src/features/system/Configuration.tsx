import React, { useState, useMemo } from 'react';
import {
    Typography,
    Spin,
    Alert,
    Space,
    Button,
    Breadcrumb,
    Switch,
    Input,
    InputNumber,
    Form,
    Tooltip,
    message,
    Flex,
    Select,
    TimePicker,
} from 'antd';
import {
    ReloadOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    SettingOutlined,
    HomeOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons';
import {
    useGetTenantConfiguration,
    useUpdateTenantConfiguration,
} from '@/api/generated/system-configuration/system-configuration';
import { useAuthStore } from '@/stores/useAuthStore';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
    GradientTitle,
    ConfigGroupsContainer,
    ConfigGroupCard,
    GroupIconBadge,
    ConfigItemRow,
    ConfigItemLabel,
    ConfigKeyText,
    ConfigDescText,
    ConfigItemValue,
    BooleanTag,
    ValueDisplay,
    ArrayValueContainer,
    ArrayTag,
    EmptyValue,
    NoItemsMessage,
    GROUP_THEMES,
    StatusIndicator,
} from './ConfigurationStyles';
import { PageHeader, PageLayout } from '@/components/patterns';
import ApprovalPolicyCard from './components/ApprovalPolicyCard';
import {
    CONFIG_GROUPS,
    ACTION_STATUS_OPTIONS,
    extractValue,
    isValidTimeFormat,
    type ConfigItem,
    type ConfigGroup,
} from './configGroups';

const { Text } = Typography;

const Configuration: React.FC = () => {
    const { t } = useTranslation('system');
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [messageApi, contextHolder] = message.useMessage();

    const { data, isLoading, error, refetch } = useGetTenantConfiguration();
    const updateMutation = useUpdateTenantConfiguration();

    const [isEditMode, setIsEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState<Record<string, unknown>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const initialConfigValues = useMemo(() => {
        if (!data) return {} as Record<string, unknown>;
        const vals: Record<string, unknown> = {};
        Object.entries(data).forEach(([key, value]) => {
            vals[key] = extractValue(value);
        });
        return vals;
    }, [data]);

    const allGroups = useMemo(() => {
        if (!data) return CONFIG_GROUPS;

        const knownKeys = new Set(CONFIG_GROUPS.flatMap(g => g.items.map(i => i.key)));
        const allKeys = Object.keys(data);
        const unknownKeys = allKeys.filter(key => !knownKeys.has(key));

        if (unknownKeys.length === 0) return CONFIG_GROUPS;

        const unknownGroup: ConfigGroup = {
            titleKey: 'groups.otherSettings',
            descKey: 'groups.otherSettingsDesc',
            icon: <SettingOutlined />,
            themeKey: 'other',
            items: unknownKeys.map(key => {
                const value = (data as Record<string, { value?: unknown }>)[key]?.value ?? (data as Record<string, unknown>)[key];
                const type = typeof value === 'boolean' ? 'boolean'
                    : typeof value === 'number' ? 'number'
                        : Array.isArray(value) ? 'array'
                            : 'string';
                return { key, type, descKey: key } as ConfigItem;
            })
        };

        return [...CONFIG_GROUPS, unknownGroup];
    }, [data]);

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <Flex justify="center" align="center" style={{ height: '100%', minHeight: 300 }}>
                <Spin size="large" />
            </Flex>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <Alert type="error" message={t('errors.loadFailed')} description={t('errors.loadFailedDesc')} showIcon />
            </div>
        );
    }

    const handleValueChange = (key: string, value: unknown, type: string) => {
        setEditedValues((prev) => ({ ...prev, [key]: value }));

        const errors = { ...validationErrors };
        if (type === 'time' && typeof value === 'string') {
            if (value && !isValidTimeFormat(value)) {
                errors[key] = t('validation.invalidTime');
            } else {
                delete errors[key];
            }
        } else if (type === 'number') {
            if (value !== null && value !== undefined && isNaN(Number(value))) {
                errors[key] = t('validation.invalidNumber');
            } else {
                delete errors[key];
            }
        } else {
            delete errors[key];
        }
        setValidationErrors(errors);
    };

    const handleSave = async () => {
        if (Object.keys(validationErrors).length > 0) {
            messageApi.error(t('validation.invalidNumber'));
            return;
        }

        if (Object.keys(editedValues).length === 0) {
            messageApi.info(t('messages.noChanges'));
            return;
        }

        try {
            await updateMutation.mutateAsync({ data: editedValues as Parameters<typeof updateMutation.mutateAsync>[0]['data'] });
            messageApi.success(t('messages.saveSuccess'));
            setEditedValues({});
            setIsEditMode(false);
            refetch();
        } catch {
            messageApi.error(t('messages.saveError'));
        }
    };

    const handleCancel = () => {
        setEditedValues({});
        setValidationErrors({});
        setIsEditMode(false);
    };

    const renderValue = (item: ConfigItem): React.ReactNode => {
        const value = item.key in editedValues ? editedValues[item.key] : initialConfigValues[item.key];
        const hasError = validationErrors[item.key];
        const themeColor = GROUP_THEMES.polling.color;

        const isActionStatusField = item.key === 'action.cleanup.actionStatus';
        const isExpiryField = item.key === 'action.cleanup.actionExpiry';
        const isSecurityTokenField = item.key === 'authentication.gatewaytoken.key';
        const isTimeField = item.type === 'time';

        if (isEditMode) {
            if (isActionStatusField) {
                return (
                    <Select
                        mode="multiple"
                        style={{ width: 250 }}
                        placeholder={t('placeholders.selectStatus', 'Select statuses')}
                        value={Array.isArray(value) ? value : []}
                        onChange={(vals) => handleValueChange(item.key, vals, item.type)}
                        options={ACTION_STATUS_OPTIONS}
                    />
                );
            }

            if (isExpiryField) {
                const msValue = value as number || 0;
                const daysValue = Math.floor(msValue / (1000 * 60 * 60 * 24));
                return (
                    <Space>
                        <InputNumber
                            value={daysValue}
                            min={0}
                            onChange={(val) => handleValueChange(item.key, (val || 0) * 1000 * 60 * 60 * 24, item.type)}
                            style={{ width: 100 }}
                        />
                        <span style={{ color: '#666', fontSize: 'var(--ant-font-size)' }}>{t('units.days', 'days')}</span>
                    </Space>
                );
            }

            if (isSecurityTokenField) {
                return (
                    <Input.Password
                        value={String(value || '')}
                        onChange={(e) => handleValueChange(item.key, e.target.value, item.type)}
                        style={{ width: 280 }}
                        placeholder="Enter security token..."
                        iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                );
            }

            if (isTimeField) {
                const timeValue = value ? dayjs(value as string, 'HH:mm:ss') : null;
                return (
                    <TimePicker
                        value={timeValue}
                        onChange={(time) => handleValueChange(item.key, time ? time.format('HH:mm:ss') : '', item.type)}
                        format="HH:mm:ss"
                        style={{ width: 150 }}
                    />
                );
            }

            switch (item.type) {
                case 'boolean':
                    return (
                        <Switch
                            checked={Boolean(value)}
                            onChange={(checked) => handleValueChange(item.key, checked, item.type)}
                            checkedChildren={t('values.enabled')}
                            unCheckedChildren={t('values.disabled')}
                            style={{ minWidth: 90 }}
                        />
                    );
                case 'number':
                    return (
                        <Form.Item validateStatus={hasError ? 'error' : undefined} help={hasError} style={{ margin: 0 }}>
                            <InputNumber value={value as number} onChange={(val) => handleValueChange(item.key, val, item.type)} style={{ width: 150 }} />
                        </Form.Item>
                    );
                case 'array':
                    return (
                        <Input
                            value={Array.isArray(value) ? value.join(', ') : String(value || '')}
                            onChange={(e) => handleValueChange(item.key, e.target.value.split(',').map((v) => v.trim()), item.type)}
                            placeholder={t('placeholders.array')}
                            style={{ width: 200 }}
                        />
                    );
                default:
                    return <Input value={String(value || '')} onChange={(e) => handleValueChange(item.key, e.target.value, item.type)} style={{ width: 200 }} />;
            }
        }

        if (isExpiryField && typeof value === 'number') {
            const days = Math.floor(value / (1000 * 60 * 60 * 24));
            return <ValueDisplay style={{ borderColor: `${themeColor}30`, background: `${themeColor}10` }}>{days} {t('units.days', 'days')}</ValueDisplay>;
        }

        if (isSecurityTokenField && value) {
            return <ValueDisplay style={{ borderColor: `${themeColor}30`, background: `${themeColor}10` }}>{'•'.repeat(12)}</ValueDisplay>;
        }

        if (typeof value === 'boolean') {
            return <BooleanTag $enabled={value}>{value && <CheckCircleOutlined />}{value ? t('values.enabled') : t('values.disabled')}</BooleanTag>;
        }

        if (value === null || value === undefined) {
            return <EmptyValue>-</EmptyValue>;
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? (
                <ArrayValueContainer>{value.map((v, i) => <ArrayTag key={i}>{String(v)}</ArrayTag>)}</ArrayValueContainer>
            ) : (
                <EmptyValue>-</EmptyValue>
            );
        }

        return <ValueDisplay style={{ borderColor: `${themeColor}30`, background: `${themeColor}10` }}>{String(value)}</ValueDisplay>;
    };

    const renderConfigItem = (item: ConfigItem, index: number) => {
        if (!(item.key in (data || {}))) return null;

        return (
            <ConfigItemRow key={item.key} $delay={index}>
                <ConfigItemLabel>
                    <ConfigKeyText>{item.key}</ConfigKeyText>
                    <ConfigDescText>{t(item.descKey)}</ConfigDescText>
                </ConfigItemLabel>
                <ConfigItemValue>{renderValue(item)}</ConfigItemValue>
            </ConfigItemRow>
        );
    };

    const renderGroup = (group: ConfigGroup, index: number) => {
        const visibleItems = group.items.filter((item) => item.key in (data || {}));
        if (visibleItems.length === 0) return null;

        return (
            <ConfigGroupCard
                key={index}
                $themeKey={group.themeKey}
                $delay={index}
                title={
                    <Flex align="center" gap={12}>
                        <GroupIconBadge $themeKey={group.themeKey}>{group.icon}</GroupIconBadge>
                        <Flex vertical gap={0}>
                            <span>{t(group.titleKey)}</span>
                            <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)', fontWeight: 400 }}>
                                {visibleItems.length} {t('common:items', 'items')}
                            </Text>
                        </Flex>
                        <Tooltip title={t(group.descKey)}>
                            <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 'var(--ant-font-size)' }} />
                        </Tooltip>
                    </Flex>
                }
            >
                {visibleItems.length > 0 ? visibleItems.map((item, i) => renderConfigItem(item, i)) : <NoItemsMessage>{t('common:messages.noData', 'No items')}</NoItemsMessage>}
            </ConfigGroupCard>
        );
    };

    return (
        <PageLayout>
            {contextHolder}

            <Breadcrumb>
                <Breadcrumb.Item><Link to="/"><HomeOutlined /> {t('common:nav.home')}</Link></Breadcrumb.Item>
                <Breadcrumb.Item><SettingOutlined /> {t('common:nav.system')}</Breadcrumb.Item>
                <Breadcrumb.Item>{t('pageTitle')}</Breadcrumb.Item>
            </Breadcrumb>

            <PageHeader
                title={<GradientTitle level={2}>{t('pageTitle')}</GradientTitle>}
                subtitle={t('subtitle', 'Manage your tenant configuration')}
                subtitleExtra={<StatusIndicator $isEdit={isEditMode}>{isEditMode ? t('editMode') : t('readOnly')}</StatusIndicator>}
                actions={
                    <Space>
                        {isEditMode ? (
                            <>
                                <Button icon={<CloseOutlined />} onClick={handleCancel}>{t('cancel')}</Button>
                                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={updateMutation.isPending} disabled={Object.keys(validationErrors).length > 0}>
                                    {updateMutation.isPending ? t('saving') : t('save')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>{t('refresh')}</Button>
                                <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditMode(true)}>{t('edit')}</Button>
                            </>
                        )}
                    </Space>
                }
            />

            <ConfigGroupsContainer>
                {allGroups.map((group, index) => renderGroup(group, index))}
                <ApprovalPolicyCard isEditMode={isEditMode} />

                <ConfigGroupCard
                    $themeKey="other"
                    $delay={allGroups.length + 1}
                    title={
                        <Flex align="center" gap={12}>
                            <GroupIconBadge $themeKey="other"><InfoCircleOutlined /></GroupIconBadge>
                            <Flex vertical gap={0}>
                                <span>{t('groups.versionInfo', 'Version Info')}</span>
                                <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)', fontWeight: 400 }}>{t('groups.versionInfoDesc', 'Application version and build information')}</Text>
                            </Flex>
                        </Flex>
                    }
                >
                    <ConfigItemRow $delay={0}>
                        <ConfigItemLabel>
                            <ConfigKeyText>version</ConfigKeyText>
                            <ConfigDescText>{t('descriptions.appVersion', 'Current application version')}</ConfigDescText>
                        </ConfigItemLabel>
                        <ConfigItemValue><ValueDisplay>v{__APP_VERSION__}</ValueDisplay></ConfigItemValue>
                    </ConfigItemRow>
                    <ConfigItemRow $delay={1}>
                        <ConfigItemLabel>
                            <ConfigKeyText>buildTime</ConfigKeyText>
                            <ConfigDescText>{t('descriptions.buildTime', 'Build timestamp')}</ConfigDescText>
                        </ConfigItemLabel>
                        <ConfigItemValue><ValueDisplay>{new Date(__BUILD_TIME__).toLocaleString()}</ValueDisplay></ConfigItemValue>
                    </ConfigItemRow>
                </ConfigGroupCard>
            </ConfigGroupsContainer>
        </PageLayout>
    );
};

export default Configuration;
