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
import styled from 'styled-components';

const { Text } = Typography;

interface SetStatisticsTabProps {
    distributionSetId: number;
}

const STATUS_COLORS: Record<string, string> = {
    finished: 'var(--ant-color-success)',
    running: 'var(--ant-color-info)',
    error: 'var(--ant-color-error)',
    warning: 'var(--ant-color-warning)',
    scheduled: 'var(--ant-color-primary)',
    pending: 'var(--ant-color-text-quaternary)',
    canceled: 'var(--ant-color-text-secondary)',
};

const LoadingContainer = styled.div`
    text-align: center;
    padding: var(--ant-padding-xl, 32px);
`;

const StatsWrapper = styled.div`
    padding: var(--ant-padding-xs, 8px);
`;

const StatCard = styled(Card) <{ $bg: string }>`
    border-radius: var(--ant-border-radius-lg, 12px);
    background: ${props => props.$bg};
    border: none;

    .ant-card-body {
        padding: var(--ant-padding-sm, 12px);
    }
`;

const StatValue = styled(Statistic) <{ $color: string }>`
    && {
        .ant-statistic-content {
            color: ${props => props.$color};
            font-weight: 700;
        }
    }
`;

const ChartsRow = styled(Row)`
    margin-top: var(--ant-margin-lg, 24px);
`;

const ChartCard = styled(Card)`
    height: 100%;
    border-radius: var(--ant-border-radius-lg, 12px);
`;

const ChartContainer = styled.div`
    height: 300px;
`;

const FullWidthSpace = styled(Space)`
    width: 100%;
`;

const CenteredBlock = styled.div`
    text-align: center;
    margin-bottom: var(--ant-margin, 16px);
`;

const ProgressCaption = styled.div`
    margin-top: var(--ant-margin-xs, 8px);
`;

const SetStatisticsTab: React.FC<SetStatisticsTabProps> = ({ distributionSetId }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { data, isLoading } = useGetStatisticsForDistributionSet(distributionSetId);

    if (isLoading) return <LoadingContainer><Spin size="large" /></LoadingContainer>;
    if (!data) return <Empty description={t('detail.noStatisticsAvailable')} />;

    const actions = data.actions || {};
    const totalRollouts = Object.values(data.rollouts || {}).reduce((a, b) => a + b, 0);

    // Normalize actions keys to lowercase for easier lookup
    const normalizedActions: Record<string, number> = {};
    Object.entries(actions).forEach(([key, value]) => {
        normalizedActions[key.toLowerCase()] = value as number;
    });

    const aggregateKeys = new Set([
        'total',
        'sum',
        'all',
        'count',
        'totalactions',
        'totalaction',
        'totalcount',
        'totalactionscount',
    ]);
    const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z]/g, '');
    const actionEntries = Object.entries(normalizedActions);
    const statusEntries = actionEntries.filter(([key]) => !aggregateKeys.has(normalizeKey(key)));
    const aggregateEntry = actionEntries.find(([key]) => aggregateKeys.has(normalizeKey(key)));

    const totalActions = aggregateEntry
        ? aggregateEntry[1]
        : statusEntries.reduce((sum, [, value]) => sum + value, 0);
    const successActions = normalizedActions['finished']
        || normalizedActions['completed']
        || normalizedActions['success']
        || normalizedActions['successful']
        || 0;
    const errorActions = (normalizedActions['error'] || 0)
        + (normalizedActions['failed'] || 0)
        + (normalizedActions['canceled'] || 0)
        + (normalizedActions['cancelled'] || 0);
    const completedActions = successActions + errorActions;
    const successRate = completedActions > 0 ? Math.round((successActions / completedActions) * 100) : 0;

    const chartData = statusEntries
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({
            name: t(`common:status.${key}`, key),
            value: value,
            key: key
        }));

    return (
        <StatsWrapper>
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <StatCard variant="borderless" $bg="var(--ant-color-success-bg)">
                        <StatValue
                            title={t('detail.activeRollouts')}
                            value={totalRollouts}
                            prefix={<SyncOutlined spin={totalRollouts > 0} />}
                            $color="var(--ant-color-success)"
                        />
                    </StatCard>
                </Col>
                <Col span={6}>
                    <StatCard variant="borderless" $bg="var(--ant-color-info-bg)">
                        <StatValue
                            title={t('detail.totalActions')}
                            value={totalActions}
                            prefix={<ClockCircleOutlined />}
                            $color="var(--ant-color-info)"
                        />
                    </StatCard>
                </Col>
                <Col span={6}>
                    <StatCard variant="borderless" $bg="var(--ant-color-primary-bg)">
                        <StatValue
                            title={t('detail.autoAssignments')}
                            value={data.totalAutoAssignments || 0}
                            prefix={<GlobalOutlined />}
                            $color="var(--ant-color-primary)"
                        />
                    </StatCard>
                </Col>
                <Col span={6}>
                    <StatCard variant="borderless" $bg="var(--ant-color-warning-bg)">
                        <StatValue
                            title={t('detail.successRate')}
                            value={successRate}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            $color="var(--ant-color-warning)"
                        />
                    </StatCard>
                </Col>
            </Row>

            <ChartsRow gutter={24}>
                <Col span={12}>
                    <ChartCard title={t('detail.actionStatusDistribution')}>
                        <ChartContainer>
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
                                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.key] || 'var(--ant-color-primary)'} />
                                            ))}
                                        </Pie>
                                        <ReTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description={t('detail.noActionsRecorded')} />
                            )}
                        </ChartContainer>
                    </ChartCard>
                </Col>
                <Col span={12}>
                    <ChartCard title={t('detail.overallProgress')}>
                        <FullWidthSpace direction="vertical" size="large">
                            <CenteredBlock>
                                <Progress
                                    type="dashboard"
                                    percent={successRate}
                                    strokeColor={{
                                        '0%': 'var(--ant-color-info)',
                                        '100%': 'var(--ant-color-success)',
                                    }}
                                    width={120}
                                />
                                <ProgressCaption>
                                    <Text strong>{t('detail.overallSuccessRate')}</Text>
                                </ProgressCaption>
                            </CenteredBlock>
                            <FullWidthSpace direction="vertical">
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
                                            strokeColor={STATUS_COLORS[item.key] || 'var(--ant-color-primary)'}
                                            showInfo={false}
                                        />
                                    </div>
                                ))}
                            </FullWidthSpace>
                        </FullWidthSpace>
                    </ChartCard>
                </Col>
            </ChartsRow>
        </StatsWrapper>
    );
};

export default SetStatisticsTab;
