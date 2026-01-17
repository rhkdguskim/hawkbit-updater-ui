import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Popover, Typography, Tag } from 'antd';
import { QuestionCircleOutlined, AppstoreOutlined, BuildOutlined, HistoryOutlined } from '@ant-design/icons';
import { OverviewCard } from '@/components/shared';
import styled from 'styled-components';
import type { MgmtDistributionSet } from '@/api/generated/model';
import { useNavigate } from 'react-router-dom';

interface DistributionSummaryWidgetProps {
    isLoading: boolean;
    distributionSetsCount: number;
    softwareModulesCount: number;
    recentSets: MgmtDistributionSet[];
}

const { Text } = Typography;

const SummaryLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: 100%;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div`
    background: var(--ant-color-fill-quaternary);
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid var(--ant-color-border-secondary);
`;

const MetricValue = styled.div<{ $color: string }>`
    font-size: 28px;
    font-weight: 700;
    color: ${props => props.$color};
    line-height: 1.2;
`;

const RecentListContainer = styled.div`
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ListItem = styled.div`
    padding: 8px;
    border-radius: 8px;
    border-bottom: 1px solid var(--ant-color-border-secondary);
    cursor: pointer;
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: var(--ant-color-fill-quaternary);
    }
`;

export const DistributionSummaryWidget: React.FC<DistributionSummaryWidgetProps> = ({
    isLoading,
    distributionSetsCount,
    softwareModulesCount,
    recentSets,
}) => {
    const { t } = useTranslation(['dashboard', 'distributions', 'common']);
    const navigate = useNavigate();

    const helpContent = (
        <div style={{ maxWidth: 250 }}>
            <Text>{t('distributions:overview.subtitle')}</Text>
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
                <Flex vertical gap={12}>
                    <MetricCard>
                        <Flex align="center" gap={12}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <AppstoreOutlined style={{ fontSize: 20, color: 'var(--ant-color-primary)' }} />
                            </div>
                            <Flex vertical>
                                <MetricValue $color="var(--ant-color-text)">{distributionSetsCount.toLocaleString()}</MetricValue>
                                <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('distributions:overview.distributionSets')}
                                </Text>
                            </Flex>
                        </Flex>
                    </MetricCard>

                    <MetricCard>
                        <Flex align="center" gap={12}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'rgba(16, 185, 129, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <BuildOutlined style={{ fontSize: 20, color: 'var(--ant-color-success)' }} />
                            </div>
                            <Flex vertical>
                                <MetricValue $color="var(--ant-color-text)">{softwareModulesCount.toLocaleString()}</MetricValue>
                                <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('distributions:overview.softwareModules')}
                                </Text>
                            </Flex>
                        </Flex>
                    </MetricCard>
                </Flex>

                <RecentListContainer>
                    <Flex align="center" gap={6} style={{ marginBottom: 4 }}>
                        <HistoryOutlined style={{ color: 'var(--ant-color-text-tertiary)' }} />
                        <Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }}>{t('distributions:overview.recentSets')}</Text>
                    </Flex>
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 150 }}>
                        {recentSets.length > 0 ? (
                            recentSets.map(set => (
                                <ListItem
                                    key={set.id}
                                    onClick={() => navigate(`/distributions/${set.id}`)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            navigate(`/distributions/${set.id}`);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={set.name || String(set.id)}
                                    className="dashboard-clickable"
                                >
                                    <Flex vertical gap={2}>
                                        <Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }} ellipsis>{set.name}</Text>
                                        <Flex justify="space-between" align="center">
                                            <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>v{set.version}</Text>
                                            <Tag color={set.complete ? 'success' : 'warning'} style={{ fontSize: 9, margin: 0, height: 16, lineHeight: '14px' }}>
                                                {set.complete ? t('distributions:status.complete') : t('distributions:status.incomplete')}
                                            </Tag>
                                        </Flex>
                                    </Flex>
                                </ListItem>
                            ))
                        ) : (
                            <Flex justify="center" align="center" style={{ height: 100 }}>
                                <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{t('common:messages.noData')}</Text>
                            </Flex>
                        )}
                    </div>
                </RecentListContainer>
            </SummaryLayout>
        </OverviewCard>
    );
};
