import React from 'react';
import { Descriptions, Tag, Typography, Skeleton, Empty, Card, Row, Col, Statistic } from 'antd';
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

const OverviewTab: React.FC<OverviewTabProps> = ({ target, loading }) => {
    if (loading) {
        return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    if (!target) {
        return <Empty description="Target not found" />;
    }

    const isOnline = !target.pollStatus?.overdue;

    return (
        <>
            <StatsRow gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title="Status"
                            value={isOnline ? 'Online' : 'Offline'}
                            valueStyle={{ color: isOnline ? '#52c41a' : '#ff4d4f' }}
                            prefix={isOnline ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        />
                    </StyledCard>
                </Col>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title="Update Status"
                            value={target.updateStatus || 'Unknown'}
                            prefix={<DesktopOutlined />}
                        />
                    </StyledCard>
                </Col>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title="Last Poll"
                            value={
                                target.pollStatus?.lastRequestAt
                                    ? dayjs(target.pollStatus.lastRequestAt).fromNow()
                                    : 'Never'
                            }
                            prefix={<ClockCircleOutlined />}
                        />
                    </StyledCard>
                </Col>
                <Col xs={12} sm={6}>
                    <StyledCard>
                        <Statistic
                            title="Next Poll"
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
                <Descriptions.Item label="Controller ID">
                    <Text strong copyable>
                        {target.controllerId}
                    </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Name">
                    {target.name || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                    {target.description || <Text type="secondary">No description</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                    {target.address || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Security Token">
                    {target.securityToken ? (
                        <Text code copyable>
                            {target.securityToken}
                        </Text>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                    {target.createdAt ? (
                        <>
                            {dayjs(target.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            <Tag style={{ marginLeft: 8 }}>{target.createdBy}</Tag>
                        </>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Last Modified">
                    {target.lastModifiedAt ? (
                        <>
                            {dayjs(target.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss')}
                            <Tag style={{ marginLeft: 8 }}>{target.lastModifiedBy}</Tag>
                        </>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Request Attributes">
                    <Tag color={target.requestAttributes ? 'blue' : 'default'}>
                        {target.requestAttributes ? 'Requested' : 'Not Requested'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Target Type">
                    {target.targetType ? (
                        <Tag color="purple">{target.targetType}</Tag>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </>
    );
};

export default OverviewTab;
