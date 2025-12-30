import React, { useState } from 'react';
import { Descriptions, Tag, Typography, Skeleton, Empty, Card, Row, Col, Statistic, Select, Space, message } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DesktopOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import type { MgmtTarget } from '@/api/generated/model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styled from 'styled-components';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useAssignTargetType, useUnassignTargetType } from '@/api/generated/targets/targets';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';

dayjs.extend(relativeTime);

const { Text } = Typography;

const StatsRow = styled(Row)`
    margin-bottom: 24px;
`;

const StyledCard = styled(Card)`
    height: 100%;
    .ant-statistic-title {
        font-size: 13px;
    }
`;

interface OverviewTabProps {
    target: MgmtTarget | null | undefined;
    loading: boolean;
}

import { useTranslation } from 'react-i18next';
// ...

const OverviewTab: React.FC<OverviewTabProps> = ({ target, loading }) => {
    const { t } = useTranslation('targets');
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [changingType, setChangingType] = useState(false);

    const { data: typesData } = useGetTargetTypes({ limit: 100 });
    const assignTypeMutation = useAssignTargetType();
    const unassignTypeMutation = useUnassignTargetType();

    if (loading) {
        return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    if (!target) {
        return <Empty description={t('detail.notFound')} />;
    }

    const isOnline = !target.pollStatus?.overdue;

    const currentType = typesData?.content?.find(type => type.id === target.targetType);

    const handleTypeChange = async (value: number | null) => {
        if (!target.controllerId) return;

        setChangingType(true);
        try {
            if (value === null) {
                await unassignTypeMutation.mutateAsync({ targetId: target.controllerId });
                message.success(t('messages.targetTypeRemoved'));
            } else {
                await assignTypeMutation.mutateAsync({
                    targetId: target.controllerId,
                    data: { id: value },
                });
                message.success(t('messages.targetTypeAssigned'));
            }
            queryClient.invalidateQueries();
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        } finally {
            setChangingType(false);
        }
    };

    return (
        <>
            <StatsRow gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title={t('overview.status')}
                            value={isOnline ? t('status.online') : t('status.offline')}
                            styles={{ content: { color: isOnline ? 'var(--ant-color-success)' : 'var(--ant-color-error)' } }}
                            prefix={isOnline ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        />
                    </StyledCard>
                </Col>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title={t('overview.updateStatus')}
                            value={target.updateStatus ? t(`common:status.${target.updateStatus}`, { defaultValue: target.updateStatus }) : t('status.unknown')}
                            prefix={<DesktopOutlined />}
                        />
                    </StyledCard>
                </Col>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title={t('overview.lastPoll')}
                            value={
                                target.pollStatus?.lastRequestAt
                                    ? dayjs(target.pollStatus.lastRequestAt).fromNow()
                                    : t('overview.never')
                            }
                            prefix={<ClockCircleOutlined />}
                        />
                    </StyledCard>
                </Col>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title={t('overview.nextPoll')}
                            value={
                                target.pollStatus?.nextExpectedRequestAt
                                    ? dayjs(target.pollStatus.nextExpectedRequestAt).fromNow()
                                    : '-'
                            }
                            prefix={<ClockCircleOutlined />}
                        />
                    </StyledCard>
                </Col>
            </StatsRow>

            <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                size="middle"
            >
                <Descriptions.Item label={t('table.controllerId')}>
                    <Text strong copyable>
                        {target.controllerId}
                    </Text>
                </Descriptions.Item>
                <Descriptions.Item label={t('table.name')}>
                    {target.name || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('form.description')}>
                    {target.description || <Text type="secondary">{t('overview.noDescription')}</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.address')}>
                    {target.address || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.securityToken')}>
                    {target.securityToken ? (
                        <Text code copyable>
                            {target.securityToken}
                        </Text>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.created')}>
                    {target.createdAt ? (
                        <>
                            {dayjs(target.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            <Tag style={{ marginLeft: 8 }}>{target.createdBy}</Tag>
                        </>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.lastModified')}>
                    {target.lastModifiedAt ? (
                        <>
                            {dayjs(target.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss')}
                            <Tag style={{ marginLeft: 8 }}>{target.lastModifiedBy}</Tag>
                        </>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.requestAttributes')}>
                    <Tag color={target.requestAttributes ? 'blue' : 'default'}>
                        {target.requestAttributes ? t('overview.requested') : t('overview.notRequested')}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.targetType')}>
                    {isAdmin ? (
                        <Select
                            style={{ minWidth: 200 }}
                            value={target.targetType || null}
                            onChange={handleTypeChange}
                            loading={changingType}
                            allowClear
                            placeholder={t('targetType.select')}
                            options={[
                                ...(typesData?.content || []).map(type => ({
                                    value: type.id,
                                    label: (
                                        <Space>
                                            {type.colour && (
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        backgroundColor: type.colour,
                                                        border: '1px solid var(--ant-color-border)',
                                                    }}
                                                />
                                            )}
                                            <span>{type.name}</span>
                                        </Space>
                                    ),
                                })),
                            ]}
                        />
                    ) : currentType ? (
                        <Space>
                            {currentType.colour && (
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: currentType.colour,
                                        border: '1px solid var(--ant-color-border)',
                                    }}
                                />
                            )}
                            <Tag color={currentType.colour || 'default'}>{currentType.name}</Tag>
                        </Space>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </>
    );
};

export default OverviewTab;
