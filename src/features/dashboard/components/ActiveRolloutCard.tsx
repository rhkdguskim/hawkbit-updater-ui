import React from 'react';
import { Card, Statistic, Typography, Flex, Progress, Spin, Empty } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const ActiveRolloutCard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const { data: rolloutsData, isLoading } = useGetRollouts({ q: 'status==running', limit: 1 });

    const activeRollout = rolloutsData?.content?.[0];

    if (isLoading) {
        return <Card style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></Card>;
    }

    if (!activeRollout) {
        return (
            <Card title={t('rollout.activeMonitor')} style={{ height: '100%' }}>
                <Empty description={t('rollout.noActiveRollout')} />
            </Card>
        );
    }

    // Calculate percentages
    const total = activeRollout.totalTargets || 1;
    const successCount = activeRollout.totalTargetsPerStatus?.['finished'] || 0;
    const errorCount = activeRollout.totalTargetsPerStatus?.['error'] || 0;

    const successPercent = Math.round((successCount / total) * 100);
    const errorPercent = Math.round((errorCount / total) * 100);
    const progressPercent = Math.round(((successCount + errorCount) / total) * 100);

    return (
        <Card
            title={`${t('rollout.activeMonitor')}: ${activeRollout.name}`}
            extra={<RocketOutlined style={{ color: '#1890ff' }} />}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, minHeight: 0 } }}
        >
            <div>
                <Flex justify="space-between">
                    <Text type="secondary">Overall Progress</Text>
                    <Text strong>{progressPercent}%</Text>
                </Flex>
                <Progress
                    percent={progressPercent}
                    success={{ percent: successPercent }}
                    status="active"
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                />
            </div>

            <Flex gap="small" style={{ marginTop: 16 }}>
                <Card size="small" styles={{ body: { padding: 12 } }} style={{ flex: 1, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                    <Statistic
                        title="Success"
                        value={successCount}
                        suffix={`(${successPercent}%)`}
                        styles={{ content: { color: '#3f8600', fontSize: 16 } }}
                    />
                </Card>
                <Card size="small" styles={{ body: { padding: 12 } }} style={{ flex: 1, background: '#fff1f0', borderColor: '#ffa39c' }}>
                    <Statistic
                        title="Error"
                        value={errorCount}
                        suffix={`(${errorPercent}%)`}
                        styles={{ content: { color: '#cf1322', fontSize: 16 } }}
                    />
                </Card>
            </Flex>

            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>ID: {activeRollout.id}</Text>
            </div>
        </Card>
    );
};

export default ActiveRolloutCard;