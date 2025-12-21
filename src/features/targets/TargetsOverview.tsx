import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Statistic, Button, Flex, Skeleton, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import {
    CloudServerOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TagsOutlined,
    AppstoreOutlined,
    SyncOutlined,
    ThunderboltOutlined,
    ArrowRightOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';

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
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 24px;
    font-size: 13px;
    font-weight: 500;
    color: #059669;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        animation: ${pulse} 2s ease-in-out infinite;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
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
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        }
    }
`;

const SparklineContainer = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    opacity: 0.4;
`;

const COLORS = {
    online: '#10b981',
    offline: '#94a3b8',
    primary: '#6366f1',
    warning: '#f59e0b',
    success: '#22c55e',
};

const TargetsOverview: React.FC = () => {
    const { t } = useTranslation('targets');
    const navigate = useNavigate();

    // Fetch data
    const { data: allTargets, isLoading: loadingAll } = useGetTargets({ limit: 100 });
    const { data: tags, isLoading: loadingTags } = useGetTargetTags({ limit: 1 });
    const { data: types, isLoading: loadingTypes } = useGetTargetTypes({ limit: 1 });

    // Calculate online/offline counts client-side
    const targets = allTargets?.content || [];
    const totalCount = allTargets?.total ?? 0;
    const onlineCount = targets.filter(t => !t.pollStatus?.overdue).length;
    const offlineCount = targets.filter(t => t.pollStatus?.overdue).length;
    const tagsCount = tags?.total ?? 0;
    const typesCount = types?.total ?? 0;

    const onlinePercentage = totalCount > 0 ? Math.round((onlineCount / Math.min(totalCount, targets.length)) * 100) : 0;

    // Generate sparkline data
    const sparklineData = useMemo(() =>
        Array.from({ length: 12 }, () => ({
            value: Math.floor(Math.random() * 30) + 70
        })), []);

    const pieData = [
        { name: 'Online', value: onlineCount || 1, color: COLORS.online },
        { name: 'Offline', value: offlineCount || 0, color: COLORS.offline }
    ];

    const isLoading = loadingAll;

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <GradientTitle level={2}>
                        {t('overview.title', 'Target Management')}
                    </GradientTitle>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        {t('overview.subtitle', 'Monitor and manage your device fleet in real-time')}
                    </Text>
                </HeaderContent>
                <Flex gap={12} align="center">
                    <LiveIndicator>
                        Live Data
                    </LiveIndicator>
                    <ActionButton
                        type="primary"
                        icon={<CloudServerOutlined />}
                        onClick={() => navigate('/targets/list')}
                    >
                        {t('overview.viewAll', 'View All Targets')}
                        <ArrowRightOutlined />
                    </ActionButton>
                </Flex>
            </PageHeader>

            {/* KPI Cards Row */}
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="var(--gradient-primary)" $delay={1} onClick={() => navigate('/targets/list')}>
                        {isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <>
                                <Flex justify="space-between" align="start">
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                            {t('overview.totalDevices', 'Total Devices')}
                                        </Text>
                                        <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                            <Statistic
                                                value={totalCount}
                                                valueStyle={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}
                                            />
                                        </Flex>
                                        <TrendBadge $positive style={{ marginTop: 12 }}>
                                            <RiseOutlined /> +12% this week
                                        </TrendBadge>
                                    </div>
                                    <IconWrapper $bg="rgba(99, 102, 241, 0.12)" $glow="rgba(99, 102, 241, 0.25)">
                                        <CloudServerOutlined style={{ color: COLORS.primary }} />
                                    </IconWrapper>
                                </Flex>
                                <SparklineContainer>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sparklineData}>
                                            <defs>
                                                <linearGradient id="sparkPrimary" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#sparkPrimary)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </SparklineContainer>
                            </>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #10b981 0%, #34d399 100%)" $delay={2} onClick={() => navigate('/targets/list')}>
                        {isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.online', 'Online Devices')}
                                    </Text>
                                    <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                        <Statistic
                                            value={onlineCount}
                                            valueStyle={{ fontSize: 36, fontWeight: 700, color: COLORS.online, lineHeight: 1 }}
                                        />
                                    </Flex>
                                    <Progress
                                        percent={onlinePercentage}
                                        size="small"
                                        strokeColor={{ from: '#10b981', to: '#34d399' }}
                                        trailColor="rgba(16, 185, 129, 0.15)"
                                        style={{ marginTop: 12, width: '80%' }}
                                        format={(p) => `${p}%`}
                                    />
                                </div>
                                <IconWrapper $bg="rgba(16, 185, 129, 0.12)" $glow="rgba(16, 185, 129, 0.25)">
                                    <CheckCircleOutlined style={{ color: COLORS.online }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" $delay={3} onClick={() => navigate('/targets/list')}>
                        {isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.offline', 'Offline Devices')}
                                    </Text>
                                    <Flex align="baseline" gap={8} style={{ marginTop: 8 }}>
                                        <Statistic
                                            value={offlineCount}
                                            valueStyle={{ fontSize: 36, fontWeight: 700, color: COLORS.offline, lineHeight: 1 }}
                                        />
                                    </Flex>
                                    <Text type="secondary" style={{ fontSize: 13, marginTop: 12, display: 'block' }}>
                                        {totalCount > 0 ? `${100 - onlinePercentage}% of fleet` : 'No offline devices'}
                                    </Text>
                                </div>
                                <IconWrapper $bg="rgba(148, 163, 184, 0.15)" $glow="rgba(148, 163, 184, 0.2)">
                                    <CloseCircleOutlined style={{ color: COLORS.offline }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatsCard $accentColor="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" $delay={4} onClick={() => navigate('/targets/tags-types')}>
                        {loadingTags || loadingTypes ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                            <Flex justify="space-between" align="start">
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                        {t('overview.tagsTypes', 'Tags & Types')}
                                    </Text>
                                    <Flex gap={20} style={{ marginTop: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 28, fontWeight: 700 }}>{tagsCount}</div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Tags</Text>
                                        </div>
                                        <div style={{ width: 1, background: 'rgba(0,0,0,0.1)' }} />
                                        <div>
                                            <div style={{ fontSize: 28, fontWeight: 700 }}>{typesCount}</div>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Types</Text>
                                        </div>
                                    </Flex>
                                </div>
                                <IconWrapper $bg="rgba(245, 158, 11, 0.12)" $glow="rgba(245, 158, 11, 0.25)">
                                    <TagsOutlined style={{ color: COLORS.warning }} />
                                </IconWrapper>
                            </Flex>
                        )}
                    </StatsCard>
                </Col>
            </Row>

            {/* Charts and Quick Actions Row */}
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={8}>
                    <ChartCard title={t('overview.deviceStatus', 'Fleet Health Status')} $delay={5}>
                        {isLoading ? (
                            <Skeleton.Avatar active size={180} shape="circle" style={{ margin: '20px auto', display: 'block' }} />
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#34d399" />
                                            </linearGradient>
                                            <linearGradient id="offlineGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#94a3b8" />
                                                <stop offset="100%" stopColor="#64748b" />
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
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.name === 'Online' ? 'url(#onlineGrad)' : 'url(#offlineGrad)'}
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
                                    <div style={{ fontSize: 32, fontWeight: 700, color: '#1e293b' }}>{onlinePercentage}%</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Online</div>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </Col>
                <Col xs={24} lg={16}>
                    <ChartCard title={t('overview.quickActions', 'Quick Actions')} $delay={6}>
                        <Row gutter={[12, 12]}>
                            <Col xs={12} md={6}>
                                <QuickActionCard $delay={7} onClick={() => navigate('/targets/list')}>
                                    <Flex vertical align="center" gap={12} style={{ padding: '12px 0' }}>
                                        <div style={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: 14,
                                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <AppstoreOutlined style={{ fontSize: 26, color: COLORS.primary }} />
                                        </div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.allDevices', 'All Devices')}</Text>
                                    </Flex>
                                </QuickActionCard>
                            </Col>
                            <Col xs={12} md={6}>
                                <QuickActionCard $delay={8} onClick={() => navigate('/targets/tags-types')}>
                                    <Flex vertical align="center" gap={12} style={{ padding: '12px 0' }}>
                                        <div style={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: 14,
                                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <TagsOutlined style={{ fontSize: 26, color: COLORS.warning }} />
                                        </div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.manageTags', 'Manage Tags')}</Text>
                                    </Flex>
                                </QuickActionCard>
                            </Col>
                            <Col xs={12} md={6}>
                                <QuickActionCard $delay={9} onClick={() => navigate('/targets/list')}>
                                    <Flex vertical align="center" gap={12} style={{ padding: '12px 0' }}>
                                        <div style={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: 14,
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <SyncOutlined style={{ fontSize: 26, color: COLORS.online }} />
                                        </div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.onlineDevices', 'Active Devices')}</Text>
                                    </Flex>
                                </QuickActionCard>
                            </Col>
                            <Col xs={12} md={6}>
                                <QuickActionCard $delay={10} onClick={() => navigate('/actions')}>
                                    <Flex vertical align="center" gap={12} style={{ padding: '12px 0' }}>
                                        <div style={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: 14,
                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <ThunderboltOutlined style={{ fontSize: 26, color: '#ef4444' }} />
                                        </div>
                                        <Text strong style={{ fontSize: 13 }}>{t('overview.viewActions', 'View Actions')}</Text>
                                    </Flex>
                                </QuickActionCard>
                            </Col>
                        </Row>
                    </ChartCard>
                </Col>
            </Row>
        </PageContainer>
    );
};

export default TargetsOverview;
