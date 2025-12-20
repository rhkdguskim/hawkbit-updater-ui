import React from 'react';
import { useGetStatisticsForDistributionSet } from '@/api/generated/distribution-sets/distribution-sets';
import { Card, Row, Col, Statistic, Progress, Typography, Divider, Spin, Empty, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    GlobalOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SetStatisticsTabProps {
    distributionSetId: number;
}

const SetStatisticsTab: React.FC<SetStatisticsTabProps> = ({ distributionSetId }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { data, isLoading } = useGetStatisticsForDistributionSet(distributionSetId);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
    if (!data) return <Empty description="No statistics available" />;

    // hawkBit Statistics properties:
    // data.rollouts (MgmtDistributionSetStatisticsRollouts)
    // data.actions (MgmtDistributionSetStatisticsActions)
    // data.totalAutoAssignments

    // We can sum up the counts from the maps
    const totalRollouts = Object.values(data.rollouts || {}).reduce((a, b) => a + b, 0);
    const totalActions = Object.values(data.actions || {}).reduce((a, b) => a + (b as number), 0);
    const successActions = (data.actions as any)?.finished || 0;
    const successRate = totalActions > 0 ? Math.round((successActions / totalActions) * 100) : 0;

    return (
        <div style={{ padding: '16px' }}>
            <Title level={4}>{t('detail.monitoring') || 'Distribution Monitoring'}</Title>
            <Divider />

            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic
                            title="Active Rollouts"
                            value={totalRollouts}
                            prefix={<SyncOutlined spin={totalRollouts > 0} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic
                            title="Total Actions"
                            value={totalActions}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#f9f0ff' }}>
                        <Statistic
                            title="Auto Assignments"
                            value={data.totalAutoAssignments || 0}
                            prefix={<GlobalOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#fff7e6' }}>
                        <Statistic
                            title="Success Rate"
                            value={successRate}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider>Deployment Success Rate</Divider>
            <Row gutter={24} align="middle">
                <Col span={12}>
                    <div style={{ textAlign: 'center' }}>
                        <Progress
                            type="dashboard"
                            percent={successRate}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text strong>Overall Success Rate</Text>
                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Text type="secondary">Successful Deployments</Text>
                            <Progress percent={successRate} size="small" status="active" />
                        </div>
                        <div>
                            <Text type="secondary">In Progress</Text>
                            <Progress
                                percent={totalActions > 0 ? Math.round((((data.actions as any)?.running || 0) / totalActions) * 100) : 0}
                                size="small"
                                status="active"
                                strokeColor="#1890ff"
                            />
                        </div>
                        <div>
                            <Text type="secondary">Failed / Retrying</Text>
                            <Progress
                                percent={totalActions > 0 ? Math.round((((data.actions as any)?.error || 0) / totalActions) * 100) : 0}
                                size="small"
                                status="exception"
                            />
                        </div>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default SetStatisticsTab;
