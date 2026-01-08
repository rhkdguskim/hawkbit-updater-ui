import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Popover, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { OverviewCard } from '@/components/shared';
import { DonutChart } from '@/components/charts';
import styled from 'styled-components';

interface DistributionSummaryWidgetProps {
    isLoading: boolean;
    distributionSetsCount: number;
    softwareModulesCount: number;
    completenessData: { name: string; value: number; color: string; statusKey?: 'complete' | 'incomplete' }[];
}

const { Text } = Typography;

const SummaryLayout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    gap: 14px;
    align-items: center;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const MetricStack = styled.div`
    display: grid;
    gap: 10px;
`;

const MetricRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.25);

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(148, 163, 184, 0.12);
        border-color: rgba(148, 163, 184, 0.2);
    }
`;

const MetricLabel = styled(Text)`
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
`;

const MetricValue = styled.span`
    font-size: 20px;
    font-weight: 700;
    color: var(--ant-color-text);
`;

const LegendList = styled.div`
    display: grid;
    gap: 8px;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.18);

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(148, 163, 184, 0.12);
        border-color: rgba(148, 163, 184, 0.2);
    }
`;

const LegendDot = styled.span<{ $color: string }>`
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: ${props => props.$color};
    box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.04);
`;

export const DistributionSummaryWidget: React.FC<DistributionSummaryWidgetProps> = ({
    isLoading,
    distributionSetsCount,
    softwareModulesCount,
    completenessData,
}) => {
    const { t } = useTranslation(['dashboard', 'distributions', 'common']);
    const totalCount = completenessData.reduce((acc, cur) => acc + cur.value, 0);
    const completeCount = completenessData.find(item => item.statusKey === 'complete')?.value
        ?? completenessData.find(item => item.name === t('distributions:status.complete', 'Complete'))?.value
        ?? completenessData.find(item => item.name === 'Complete')?.value
        ?? 0;
    const completionRate = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0;

    const helpContent = (
        <div>
            <p>{t('distributions:overview.subtitle')}</p>
        </div>
    );

    return (
        <OverviewCard
            loading={isLoading}
            title={(
                <Flex align="center" gap={8}>
                    <span>{t('dashboard:kpi.distributions')}</span>
                    <Popover content={helpContent} placement="bottom">
                        <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-tertiary)' }} />
                    </Popover>
                </Flex>
            )}
        >
            <SummaryLayout>
                <MetricStack>
                    <MetricRow>
                        <MetricLabel type="secondary">{t('distributions:overview.distributionSets')}</MetricLabel>
                        <MetricValue>{distributionSetsCount.toLocaleString()}</MetricValue>
                    </MetricRow>
                    <MetricRow>
                        <MetricLabel type="secondary">{t('distributions:overview.softwareModules')}</MetricLabel>
                        <MetricValue>{softwareModulesCount.toLocaleString()}</MetricValue>
                    </MetricRow>
                    <LegendList>
                        {completenessData.length > 0 ? (
                            completenessData.map(item => (
                                <LegendItem key={item.statusKey ?? item.name}>
                                    <Flex align="center" gap={8}>
                                        <LegendDot $color={item.color} />
                                        <Text>{item.name}</Text>
                                    </Flex>
                                    <Text strong>{item.value.toLocaleString()}</Text>
                                </LegendItem>
                            ))
                        ) : (
                            <LegendItem>
                                <Text type="secondary">{t('common:messages.noData')}</Text>
                            </LegendItem>
                        )}
                    </LegendList>
                </MetricStack>
                <Flex vertical align="center" justify="center" gap={8} style={{ minHeight: 140 }}>
                    <div style={{ height: 120, width: 120, position: 'relative' }}>
                        <DonutChart
                            data={completenessData}
                            height={120}
                            showLegend={false}
                            tooltipTitle={t('distributions:overview.completeness')}
                            centerLabel={`${completionRate}%`}
                        />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {t('distributions:overview.completeness')}
                    </Text>
                </Flex>
            </SummaryLayout>
        </OverviewCard>
    );
};
