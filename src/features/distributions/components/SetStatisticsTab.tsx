import React from 'react';
import { useGetStatisticsForDistributionSet } from '@/api/generated/distribution-sets/distribution-sets';
import { Card, Row, Col, Statistic, Progress, Typography, Spin, Empty, Space, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    CheckCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';

const { Text } = Typography;

interface SetStatisticsTabProps {
    distributionSetId: number;
}

const COLORS = {
    finished: '#52c41a',
    running: '#1890ff',
    error: '#f5222d',
    warning: '#faad14',
    scheduled: '#13c2c2',
    pending: '#bfbfbf',
    canceled: '#000000'
};

const SetStatisticsTab: React.FC<SetStatisticsTabProps> = ({ distributionSetId }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { data, isLoading } = useGetStatisticsForDistributionSet(distributionSetId);

    if (isLoading) return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
    if (!data) return <Empty description={t('detail.noStatisticsAvailable')} />;

    const actions = data.actions || {};
    const totalRollouts = Object.values(data.rollouts || {}).reduce((a, b) => a + b, 0);
    const totalActions = Object.values(actions).reduce((a, b) => a + (b as number), 0);
    const successActions = (actions as any).finished || 0;
    const successRate = totalActions > 0 ? Math.round((successActions / totalActions) * 100) : 0;

    const chartData = Object.entries(actions)
        .filter(([_, value]) => (value as number) > 0)
        .map(([key, value]) => ({
            name: t(`common:status.${key.toLowerCase()}`, key),
            value: value as number,
            key: key.toLowerCase()
        }));

    return (
        <div style={{ padding: '8px' }}>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card variant="borderless" style={{ background: '#f6ffed', borderRadius: 12 }}>
                        <Statistic
                            title={t('detail.activeRollouts')}
                            value={totalRollouts}
                            prefix={<SyncOutlined spin={totalRollouts > 0} />}
                            styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ background: '#e6f7ff', borderRadius: 12 }}>
                        <Statistic
                            title={t('detail.totalActions')}
                            value={totalActions}
                            prefix={<ClockCircleOutlined />}
                            styles={{ content: { color: '#1890ff', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ background: '#f9f0ff', borderRadius: 12 }}>
                        <Statistic
                            title={t('detail.autoAssignments')}
                            value={data.totalAutoAssignments || 0}
                            prefix={<GlobalOutlined />}
                            styles={{ content: { color: '#722ed1', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card variant="borderless" style={{ background: '#fff7e6', borderRadius: 12 }}>
                        <Statistic
                            title={t('detail.successRate')}
                            value={successRate}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            styles={{ content: { color: '#fa8c16', fontWeight: 700 } }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={24} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Card title={t('detail.actionStatusDistribution') || 'Action Status Distribution'} style={{ height: '100%', borderRadius: 12 }}>
                        <div style={{ height: 300 }}>
                            {totalActions > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.key] || '#8884d8'} />
                                            ))}
                                        </Pie>
                                        <ReTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description={t('detail.noActionsRecorded')} />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title={t('detail.overallProgress') || 'Overall Progress'} style={{ height: '100%', borderRadius: 12 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <Progress
                                    type="dashboard"
                                    percent={successRate}
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }}
                                    width={120}
                                />
                                <div style={{ marginTop: 8 }}>
                                    <Text strong>{t('detail.overallSuccessRate')}</Text>
                                </div>
                            </div>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {chartData.map((item) => (
                                    <div key={item.key}>
                                        <Flex justify="space-between" align="baseline">
                                            <Text type="secondary">{item.name}</Text>
                                            <Text strong>{item.value}</Text>
                                        </Flex>
                                        <Progress
                                            percent={totalActions > 0 ? Math.round((item.value / totalActions) * 100) : 0}
                                            size="small"
                                            status={item.key === 'error' ? 'exception' : 'active'}
                                            strokeColor={(COLORS as any)[item.key]}
                                            showInfo={false}
                                        />
                                    </div>
                                ))}
                            </Space>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SetStatisticsTab;
