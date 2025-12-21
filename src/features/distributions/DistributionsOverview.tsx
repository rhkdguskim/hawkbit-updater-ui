import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Flex, Skeleton, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import {
    AppstoreOutlined,
    CodeOutlined,
    TagsOutlined,
    BlockOutlined,
    ArrowRightOutlined,
    SettingOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetSoftwareModules } from '@/api/generated/software-modules/software-modules';
import { useGetDistributionSetTags } from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';

const { Title, Text } = Typography;

// Premium animations
const fadeInUp = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
`;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: ${fadeInUp} 0.5s ease-out;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const GradientTitle = styled(Title)`
    && {
        margin: 0;
        background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .dark-mode & {
        background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
        -webkit-background-clip: text;
        background-clip: text;
    }
`;

const StatsCard = styled(Card) <{ $accentColor?: string; $delay?: number }>`
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 10px 15px -3px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.1}s;
    animation-fill-mode: both;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: ${props => props.$accentColor || 'var(--gradient-primary)'};
    }

    &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 70%
        );
        transform: rotate(45deg);
        transition: all 0.6s ease;
        opacity: 0;
    }

    &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1),
            0 0 30px ${props => props.$accentColor?.includes('#') ? props.$accentColor + '30' : 'rgba(99, 102, 241, 0.2)'};

        &::after {
            opacity: 1;
            animation: ${shimmer} 0.6s ease;
        }
    }

    .dark-mode & {
        background: rgba(30, 41, 59, 0.8);
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.2),
            0 10px 15px -3px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
`;

const QuickActionCard = styled(Card) <{ $delay?: number }>`
    border: none;
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.08}s;
    animation-fill-mode: both;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15);
        background: linear-gradient(145deg, #ffffff, #f8fafc);
    }

    .dark-mode & {
        background: linear-gradient(145deg, rgba(51, 65, 85, 0.9), rgba(30, 41, 59, 0.95));
        
        &:hover {
            background: linear-gradient(145deg, rgba(71, 85, 105, 0.95), rgba(51, 65, 85, 0.9));
        }
    }
`;

const ChartCard = styled(Card) <{ $delay?: number }>`
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.1}s;
    animation-fill-mode: both;
    
    .ant-card-head {
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    .ant-card-head-title {
        font-size: 15px;
        font-weight: 600;
        color: #334155;
    }

    .dark-mode & {
        background: rgba(30, 41, 59, 0.9);
        
        .ant-card-head {
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .ant-card-head-title {
            color: #e2e8f0;
        }
    }
`;

const IconWrapper = styled.div<{ $bg?: string; $glow?: string }>`
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || 'rgba(99, 102, 241, 0.1)'};
    font-size: 26px;
    transition: all 0.3s ease;
    animation: ${float} 4s ease-in-out infinite;
    box-shadow: 0 4px 12px ${props => props.$glow || 'rgba(99, 102, 241, 0.2)'};

    &:hover {
        transform: scale(1.1) rotate(5deg);
    }
`;

const TrendBadge = styled.div<{ $positive?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: ${props => props.$positive
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1))'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1))'};
    color: ${props => props.$positive ? '#059669' : '#dc2626'};
    border: 1px solid ${props => props.$positive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

const LiveIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.05));
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 24px;
    font-size: 13px;
    font-weight: 500;
    color: #3b82f6;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #3b82f6;
        animation: ${pulse} 2s ease-in-out infinite;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
    }
`;

const ActionButton = styled(Button)`
    && {
        height: 44px;
        padding: 0 24px;
        border-radius: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
        border: none;
        box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
        }
    }
`;

const COLORS = {
    primary: '#6366f1',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    warning: '#f59e0b',
    success: '#10b981',
};

const DistributionsOverview: React.FC = () => {
    const { t } = useTranslation('distributions');
    const navigate = useNavigate();

    // Fetch data
    const { data: dsData, isLoading: loadingDS } = useGetDistributionSets({ limit: 100 });
    const { data: smData, isLoading: loadingSM } = useGetSoftwareModules({ limit: 100 });
    const { data: tagsData, isLoading: loadingTags } = useGetDistributionSetTags({ limit: 1 });
    const { data: typesData, isLoading: loadingTypes } = useGetDistributionSetTypes({ limit: 1 });

    const dsCount = dsData?.total ?? 0;
    const smCount = smData?.total ?? 0;
    const tagsCount = tagsData?.total ?? 0;
    const typesCount = typesData?.total ?? 0;

    // Chart data
    const pieData = useMemo(() => [
        { name: 'Distribution Sets', value: dsCount || 1, color: COLORS.blue },
        { name: 'Software Modules', value: smCount || 1, color: COLORS.cyan },
    ], [dsCount, smCount]);

    const barData = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => ({
            name: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 10) + 2
        })), []);

    const isLoading = loadingDS || loadingSM;

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <GradientTitle level={2}>
                        {t('overview.title', 'Distribution Management')}
                    </GradientTitle>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        {t('overview.subtitle', 'Manage software distribution sets and modules')}
                    </Text>
                </HeaderContent>
                <Flex gap={12} align="center">
                    <LiveIndicator>
                        {dsCount + smCount} Assets
                    </LiveIndicator>
                    <ActionButton
                        type="primary"
                        icon={<AppstoreOutlined />}
                        onClick={() => navigate('/distributions/sets')}
                    >
                        {t('overview.viewSets', 'View Sets')}
                        <ArrowRightOutlined />
                    </ActionButton>
                </Flex>
            </PageHeader>

            {/* KPI Cards Row */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" $delay={1} onClick={() => navigate('/distributions/sets')}>
                        {isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.distributionSets', 'Distribution Sets')}
                                    </Text>
                                    <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                        <Statistic
                                            value={dsCount}
                                            valueStyle={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}
                                        />
                                    </Flex>
                                    <TrendBadge $positive style={{ marginTop: 12 }}>
                                        <RiseOutlined /> +3 this month
                                    </TrendBadge>
                                </div>
                                <IconWrapper $bg="rgba(59, 130, 246, 0.12)" $glow="rgba(59, 130, 246, 0.25)">
                                    <AppstoreOutlined style={{ color: COLORS.blue }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)" $delay={2} onClick={() => navigate('/distributions/modules')}>
                        {isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.softwareModules', 'Software Modules')}
                                    </Text>
                                    <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                        <Statistic
                                            value={smCount}
                                            valueStyle={{ fontSize: 36, fontWeight: 700, color: COLORS.cyan, lineHeight: 1 }}
                                        />
                                    </Flex>
                                    <Progress
                                        percent={75}
                                        size="small"
                                        strokeColor={{ from: '#06b6d4', to: '#22d3ee' }}
                                        trailColor="rgba(6, 182, 212, 0.15)"
                                        style={{ marginTop: 12, width: '80%' }}
                                        format={() => 'Active'}
                                    />
                                </div>
                                <IconWrapper $bg="rgba(6, 182, 212, 0.12)" $glow="rgba(6, 182, 212, 0.25)">
                                    <CodeOutlined style={{ color: COLORS.cyan }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" $delay={3} onClick={() => navigate('/distributions/ds-types-tags')}>
                        {loadingTags ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.dsTags', 'DS Tags')}
                                    </Text>
                                    <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                        <Statistic
                                            value={tagsCount}
                                            valueStyle={{ fontSize: 36, fontWeight: 700, color: COLORS.purple, lineHeight: 1 }}
                                        />
                                    </Flex>
                                    <Text type="secondary" style={{ fontSize: 13, marginTop: 12, display: 'block' }}>
                                        For organization
                                    </Text>
                                </div>
                                <IconWrapper $bg="rgba(139, 92, 246, 0.12)" $glow="rgba(139, 92, 246, 0.25)">
                                    <TagsOutlined style={{ color: COLORS.purple }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" $delay={4} onClick={() => navigate('/distributions/ds-types-tags')}>
                        {loadingTypes ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.dsTypes', 'DS Types')}
                                    </Text>
                                    <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                        <Statistic
                                            value={typesCount}
                                            valueStyle={{ fontSize: 36, fontWeight: 700, color: COLORS.warning, lineHeight: 1 }}
                                        />
                                    </Flex>
                                    <Text type="secondary" style={{ fontSize: 13, marginTop: 12, display: 'block' }}>
                                        Defined schemas
                                    </Text>
                                </div>
                                <IconWrapper $bg="rgba(245, 158, 11, 0.12)" $glow="rgba(245, 158, 11, 0.25)">
                                    <BlockOutlined style={{ color: COLORS.warning }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
            </Row>

            {/* Charts and Quick Actions Row */}
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={8}>
                    <ChartCard title={t('overview.assetDistribution', 'Asset Distribution')} $delay={5}>
                        {isLoading ? (
                            <Skeleton.Avatar active size={180} shape="circle" style={{ margin: '20px auto', display: 'block' }} />
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="dsGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                            <linearGradient id="smGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#06b6d4" />
                                                <stop offset="100%" stopColor="#22d3ee" />
                                            </linearGradient>
                                        </defs>
                                        <Pie
                                            data={pieData}
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {pieData.map((_entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={index === 0 ? 'url(#dsGrad)' : 'url(#smGrad)'}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b' }}>{dsCount + smCount}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Total Assets</div>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </Col>
                <Col xs={24} lg={8}>
                    <ChartCard title="Weekly Activity" $delay={6}>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={barData} barCategoryGap="20%">
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col xs={24} lg={8}>
                    <ChartCard title={t('overview.quickActions', 'Quick Actions')} $delay={7}>
                        <Flex vertical gap={12}>
                            <QuickActionCard $delay={8} onClick={() => navigate('/distributions/sets')}>
                                <Flex align="center" gap={12} style={{ padding: '4px 0' }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <AppstoreOutlined style={{ fontSize: 22, color: COLORS.blue }} />
                                    </div>
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.allSets', 'All Sets')}</Text>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Browse distribution sets</Text>
                                    </div>
                                </Flex>
                            </QuickActionCard>
                            <QuickActionCard $delay={9} onClick={() => navigate('/distributions/modules')}>
                                <Flex align="center" gap={12} style={{ padding: '4px 0' }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(34, 211, 238, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CodeOutlined style={{ fontSize: 22, color: COLORS.cyan }} />
                                    </div>
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.allModules', 'All Modules')}</Text>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Manage software modules</Text>
                                    </div>
                                </Flex>
                            </QuickActionCard>
                            <QuickActionCard $delay={10} onClick={() => navigate('/distributions/ds-types-tags')}>
                                <Flex align="center" gap={12} style={{ padding: '4px 0' }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <SettingOutlined style={{ fontSize: 22, color: COLORS.purple }} />
                                    </div>
                                    <div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.manageTags', 'Types & Tags')}</Text>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Configure metadata</Text>
                                    </div>
                                </Flex>
                            </QuickActionCard>
                        </Flex>
                    </ChartCard>
                </Col>
            </Row>
        </PageContainer>
    );
};

export default DistributionsOverview;
