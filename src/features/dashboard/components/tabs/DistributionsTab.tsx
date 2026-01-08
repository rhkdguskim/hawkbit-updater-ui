import React from 'react';
import { Typography, Flex, Skeleton, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AppstoreOutlined,
    CodeOutlined,
    TagsOutlined,
    BlockOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import dayjs from 'dayjs';
import { AirportSlideList } from '@/components/common';
import type { MgmtDistributionSet, MgmtSoftwareModule } from '@/api/generated/model';
import {
    OverviewScrollContent,
    TopRow,
    BottomRow,
    KPIGridContainer,
    ChartsContainer,
    OverviewStatsCard,
    OverviewChartCard,
    OverviewListCard,
    IconBadge,
    BigNumber,
    ChartLegendItem,
    ActivityItem,
    COLORS,
} from '@/components/shared/OverviewStyles';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

const { Text } = Typography;
const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const DistributionsTab: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const navigate = useNavigate();
    const metrics = useDashboardMetrics();

    const {
        isLoading,
        distributionSets: sets,
        softwareModulesCount,
        distributionSetsCount: setsCount,
        incompleteSetsCount,
        completeSetsCount,
        recentDistributionSets: recentSets,
        recentSoftwareModules: recentModules,
    } = metrics;

    // Distribution by type for pie chart
    const typeDistribution = React.useMemo(() => {
        const counts = new Map<string, number>();
        const unknownLabel = t('common:status.unknown');

        sets.forEach(ds => {
            const typeName = ds.typeName || unknownLabel;
            counts.set(typeName, (counts.get(typeName) || 0) + 1);
        });

        let fallbackIndex = 0;
        return Array.from(counts.entries()).map(([name, value]) => {
            const color = PIE_COLORS[fallbackIndex % PIE_COLORS.length];
            fallbackIndex += 1;
            return { name, value, color };
        });
    }, [sets, t]);

    // Completeness distribution
    const completenessData = React.useMemo(() => {
        return [
            { name: t('status.complete', 'Complete'), value: completeSetsCount, color: '#10b981' },
            { name: t('status.incomplete', 'Incomplete'), value: incompleteSetsCount, color: '#f59e0b' },
        ].filter(d => d.value > 0);
    }, [completeSetsCount, incompleteSetsCount, t]);

    // Custom Legend Renderer
    const renderCustomLegend = (data: { name: string; value: number; color: string }[]) => (
        <Flex vertical gap={4} style={{ marginTop: 4 }}>
            {data.map(entry => (
                <ChartLegendItem key={entry.name}>
                    <Flex align="center" gap={6}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, boxShadow: `0 1px 3px ${entry.color}40` }} />
                        <Text style={{ fontSize: 11, color: '#475569' }}>{entry.name}</Text>
                    </Flex>
                    <Text strong style={{ fontSize: 12, color: entry.color }}>{entry.value}</Text>
                </ChartLegendItem>
            ))}
        </Flex>
    );

    return (
        <OverviewScrollContent>
            {/* Top Row: KPI Cards + 3 Pie Charts */}
            <TopRow>
                <KPIGridContainer>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                        $delay={1}
                        onClick={() => navigate('/distributions/sets')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $theme="distributions">
                                    <AppstoreOutlined />
                                </IconBadge>
                                <BigNumber $color={COLORS.distributions}>{setsCount}</BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('overview.distributionSets')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
                        $delay={2}
                        onClick={() => navigate('/distributions/modules')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)">
                                    <CodeOutlined />
                                </IconBadge>
                                <BigNumber $color="#3b82f6">{softwareModulesCount}</BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('overview.softwareModules')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                        $delay={3}
                        onClick={() => navigate('/distributions/sets')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, #10b981 0%, #34d399 100%)">
                                    <TagsOutlined />
                                </IconBadge>
                                <BigNumber $color="#10b981">{completeSetsCount}</BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('status.complete')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                    <OverviewStatsCard
                        $accentColor="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                        $delay={4}
                        onClick={() => navigate('/distributions/sets')}
                    >
                        {isLoading ? <Skeleton.Avatar active size={40} /> : (
                            <Flex vertical align="center" gap={4}>
                                <IconBadge $color="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)">
                                    <BlockOutlined />
                                </IconBadge>
                                <BigNumber $color="#f59e0b">{incompleteSetsCount}</BigNumber>
                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                                    {t('status.incomplete')}
                                </Text>
                            </Flex>
                        )}
                    </OverviewStatsCard>
                </KPIGridContainer>

                <ChartsContainer>
                    <OverviewChartCard
                        $theme="distributions"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $theme="distributions">
                                    <BlockOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t('overview.distributionByType', 'By Type')}</span>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{setsCount} sets</Text>
                                </Flex>
                            </Flex>
                        }
                        $delay={5}
                    >
                        {isLoading ? (
                            <Skeleton.Avatar active size={60} shape="circle" style={{ margin: '8px auto', display: 'block' }} />
                        ) : typeDistribution.length > 0 ? (
                            <Flex vertical style={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={typeDistribution} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {typeDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {renderCustomLegend(typeDistribution.slice(0, 3))}
                            </Flex>
                        ) : (
                            <Flex justify="center" align="center" style={{ flex: 1 }}>
                                <Text type="secondary">{t('common:messages.noData')}</Text>
                            </Flex>
                        )}
                    </OverviewChartCard>

                    <OverviewChartCard
                        $theme="distributions"
                        title={
                            <Flex align="center" gap={10}>
                                <IconBadge $color="linear-gradient(135deg, #10b981 0%, #34d399 100%)">
                                    <AppstoreOutlined />
                                </IconBadge>
                                <Flex vertical gap={0}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t('overview.completeness', 'Completeness')}</span>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{setsCount} sets</Text>
                                </Flex>
                            </Flex>
                        }
                        $delay={7}
                    >
                        {isLoading ? (
                            <Skeleton.Avatar active size={60} shape="circle" style={{ margin: '8px auto', display: 'block' }} />
                        ) : completenessData.length > 0 ? (
                            <Flex vertical style={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height={100}>
                                    <PieChart>
                                        <Pie data={completenessData} innerRadius={28} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                            {completenessData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {renderCustomLegend(completenessData)}
                            </Flex>
                        ) : (
                            <Flex justify="center" align="center" style={{ flex: 1 }}>
                                <Text type="secondary">{t('common:messages.noData')}</Text>
                            </Flex>
                        )}
                    </OverviewChartCard>
                </ChartsContainer>
            </TopRow>

            {/* Bottom Row: Recent Sets + Recent Modules */}
            <BottomRow>
                <OverviewListCard
                    $theme="distributions"
                    title={
                        <Flex align="center" gap={10}>
                            <IconBadge $theme="distributions">
                                <AppstoreOutlined />
                            </IconBadge>
                            <Flex vertical gap={0}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{t('overview.recentSets', 'Recent Distribution Sets')}</span>
                                <Text type="secondary" style={{ fontSize: 11 }}>{recentSets.length} sets</Text>
                            </Flex>
                        </Flex>
                    }
                    $delay={8}
                >
                    {isLoading ? (
                        <Skeleton active paragraph={{ rows: 5 }} />
                    ) : recentSets.length > 0 ? (
                        <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <AirportSlideList
                                items={recentSets}
                                itemHeight={52}
                                visibleCount={5}
                                fullHeight={true}
                                renderItem={(record: MgmtDistributionSet) => (
                                    <ActivityItem
                                        key={record.id}
                                        onClick={() => navigate(`/distributions/sets/${record.id}`)}
                                    >
                                        <Flex align="center" gap={10} style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <AppstoreOutlined style={{ fontSize: 16, color: COLORS.distributions }} />
                                            </div>
                                            <Flex vertical gap={0} style={{ minWidth: 0 }}>
                                                <Text strong style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {record.name}
                                                </Text>
                                                <Flex gap={4} align="center">
                                                    <Tag color="blue" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 999 }}>v{record.version}</Tag>
                                                    <Text type="secondary" style={{ fontSize: 10 }}>{record.typeName}</Text>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                        <Tag color={record.complete ? 'green' : 'orange'} style={{ margin: 0, fontSize: 10, borderRadius: 999 }}>
                                            {record.complete ? t('status.complete') : t('status.incomplete')}
                                        </Tag>
                                    </ActivityItem>
                                )}
                            />
                        </div>
                    ) : (
                        <Flex justify="center" align="center" style={{ flex: 1 }}>
                            <Text type="secondary">{t('common:messages.noData')}</Text>
                        </Flex>
                    )}
                </OverviewListCard>

                <OverviewListCard
                    $theme="distributions"
                    title={
                        <Flex align="center" gap={10}>
                            <IconBadge $color="linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)">
                                <CodeOutlined />
                            </IconBadge>
                            <Flex vertical gap={0}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{t('overview.recentModules', 'Recent Software Modules')}</span>
                                <Text type="secondary" style={{ fontSize: 11 }}>{recentModules.length} modules</Text>
                            </Flex>
                        </Flex>
                    }
                    $delay={9}
                >
                    {isLoading ? (
                        <Skeleton active paragraph={{ rows: 5 }} />
                    ) : recentModules.length > 0 ? (
                        <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <AirportSlideList
                                items={recentModules}
                                itemHeight={52}
                                visibleCount={5}
                                fullHeight={true}
                                renderItem={(record: MgmtSoftwareModule) => (
                                    <ActivityItem
                                        key={record.id}
                                        onClick={() => navigate(`/distributions/modules/${record.id}`)}
                                    >
                                        <Flex align="center" gap={10} style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <CodeOutlined style={{ fontSize: 16, color: '#3b82f6' }} />
                                            </div>
                                            <Flex vertical gap={0} style={{ minWidth: 0 }}>
                                                <Text strong style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {record.name}
                                                </Text>
                                                <Flex gap={4} align="center">
                                                    <Tag color="cyan" style={{ margin: 0, fontSize: 10, padding: '0 4px', borderRadius: 999 }}>v{record.version}</Tag>
                                                    <Text type="secondary" style={{ fontSize: 10 }}>{record.typeName}</Text>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                        <Text type="secondary" style={{ fontSize: 10 }}>
                                            {record.createdAt ? dayjs(record.createdAt).format('MM-DD HH:mm') : '-'}
                                        </Text>
                                    </ActivityItem>
                                )}
                            />
                        </div>
                    ) : (
                        <Flex justify="center" align="center" style={{ flex: 1 }}>
                            <Text type="secondary">{t('common:messages.noData')}</Text>
                        </Flex>
                    )}
                </OverviewListCard>
            </BottomRow>
        </OverviewScrollContent>
    );
};
