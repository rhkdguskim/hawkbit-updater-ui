import React from 'react';
import { Typography, Space, Switch, InputNumber, Input, TimePicker, Flex, Tooltip } from 'antd';
import {
    InfoCircleOutlined,
    TeamOutlined,
    TagOutlined,
    AppstoreOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useApprovalPolicyStore, type ApprovalRule } from '@/stores/useApprovalPolicyStore';
import { ConfigGroupCard, GroupIconBadge, ConfigItemRow, ConfigItemLabel, ConfigKeyText, ConfigDescText, ConfigItemValue } from '../ConfigurationStyles';
import dayjs from 'dayjs';

const { Text } = Typography;

const ApprovalPolicyCard: React.FC<{ isEditMode: boolean }> = ({ isEditMode }) => {
    const { t } = useTranslation('system');
    const { rules, toggleRule, updateRule } = useApprovalPolicyStore();

    const getIcon = (type: ApprovalRule['type']) => {
        switch (type) {
            case 'target_count': return <TeamOutlined />;
            case 'tag': return <TagOutlined />;
            case 'target_type': return <AppstoreOutlined />;
            case 'time_range': return <ClockCircleOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const renderConditionInput = (rule: ApprovalRule) => {
        if (!isEditMode) {
            switch (rule.type) {
                case 'target_count':
                    return <Text strong>{(rule.condition as any).threshold} {t('common:targets', 'targets')}</Text>;
                case 'tag':
                    return <Text strong>"{(rule.condition as any).tag}"</Text>;
                case 'target_type':
                    return <Text strong>{(rule.condition as any).targetType}</Text>;
                case 'time_range':
                    return <Text strong>{(rule.condition as any).start} - {(rule.condition as any).end}</Text>;
                default:
                    return null;
            }
        }

        switch (rule.type) {
            case 'target_count':
                return (
                    <InputNumber
                        value={(rule.condition as any).threshold}
                        onChange={(val) => updateRule(rule.id, { ...rule.condition, threshold: val })}
                        min={0}
                        style={{ width: 120 }}
                    />
                );
            case 'tag':
                return (
                    <Input
                        value={(rule.condition as any).tag}
                        onChange={(e) => updateRule(rule.id, { ...rule.condition, tag: e.target.value })}
                        placeholder="Tag name"
                        style={{ width: 150 }}
                    />
                );
            case 'target_type':
                return (
                    <Input
                        value={(rule.condition as any).targetType}
                        onChange={(e) => updateRule(rule.id, { ...rule.condition, targetType: e.target.value })}
                        placeholder="Target type"
                        style={{ width: 150 }}
                    />
                );
            case 'time_range':
                return (
                    <Space>
                        <TimePicker
                            value={dayjs((rule.condition as any).start, 'HH:mm')}
                            format="HH:mm"
                            onChange={(time) => updateRule(rule.id, { ...rule.condition, start: time?.format('HH:mm') })}
                            style={{ width: 100 }}
                        />
                        <Text>-</Text>
                        <TimePicker
                            value={dayjs((rule.condition as any).end, 'HH:mm')}
                            format="HH:mm"
                            onChange={(time) => updateRule(rule.id, { ...rule.condition, end: time?.format('HH:mm') })}
                            style={{ width: 100 }}
                        />
                    </Space>
                );
            default:
                return null;
        }
    };

    return (
        <ConfigGroupCard
            $themeKey="auth"
            title={
                <Flex align="center" gap={12}>
                    <GroupIconBadge $themeKey="auth">
                        <SafetyCertificateOutlined />
                    </GroupIconBadge>
                    <Flex vertical gap={0}>
                        <span>{t('approvalPolicy.title', 'Approval Policies')}</span>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
                            {rules.filter(r => r.enabled).length} {t('common:active', 'active')}
                        </Text>
                    </Flex>
                    <Tooltip title={t('approvalPolicy.desc', 'Conditional approval rules for rollouts')}>
                        <InfoCircleOutlined style={{ color: '#94a3b8', fontSize: 14 }} />
                    </Tooltip>
                </Flex>
            }
        >
            {rules.map((rule, index) => (
                <ConfigItemRow key={rule.id} $delay={index}>
                    <ConfigItemLabel>
                        <Space>
                            <span style={{ color: '#10b981' }}>{getIcon(rule.type)}</span>
                            <ConfigKeyText>{t(`approvalPolicy.rules.${rule.type}.title`)}</ConfigKeyText>
                        </Space>
                        <ConfigDescText>{t(`approvalPolicy.rules.${rule.type}.desc`)}</ConfigDescText>
                    </ConfigItemLabel>
                    <ConfigItemValue>
                        <Space size="middle">
                            {renderConditionInput(rule)}
                            <Switch
                                size="small"
                                checked={rule.enabled}
                                onChange={(checked) => toggleRule(rule.id, checked)}
                                disabled={!isEditMode}
                            />
                        </Space>
                    </ConfigItemValue>
                </ConfigItemRow>
            ))}
        </ConfigGroupCard>
    );
};

export default ApprovalPolicyCard;
