import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Button, Tooltip, Spin, Typography, Flex } from 'antd';
import {
    FullscreenOutlined,
    FullscreenExitOutlined,
    CloudServerOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    FallOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import {
    FailureChart,
    VersionTreemap,
    ActiveRolloutCard,
    LiveTicker,
} from './components';

import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetActions } from '@/api/generated/actions/actions';
import type { LiveTickerLog } from './components/LiveTicker';

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

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const DashboardContainer = styled.div<{ $isFocusMode: boolean }>`
    height: ${(props) => (props.$isFocusMode ? '100vh' : 'calc(100vh - 64px)')};
    width: 100%;
    position: ${(props) => (props.$isFocusMode ? 'fixed' : 'relative')};
    top: 0;
    left: 0;
    z-index: ${(props) => (props.$isFocusMode ? 1000 : 1)};
    background: ${(props) => (props.$isFocusMode ? 'linear-gradient(135deg, #0b1120 0%, #1a1a2e 100%)' : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)')};
    color: ${(props) => (props.$isFocusMode ? '#f8fafc' : 'inherit')};
    padding: 20px;
    display: grid;
    grid-template-rows: auto 120px 1fr 52px;
    gap: 20px;
    overflow: hidden;
    transition: all 0.4s ease;
    animation: ${fadeInUp} 0.5s ease-out;

    & .ant-card {
        background: ${(props) => (props.$isFocusMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)')};
        backdrop-filter: blur(20px);
        color: ${(props) => (props.$isFocusMode ? '#f8fafc' : 'inherit')};
        border: ${(props) => (props.$isFocusMode ? '1px solid rgba(255, 255, 255, 0.08)' : 'none')};
        box-shadow: ${(props) =>
        props.$isFocusMode
            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 20px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)'};
        border-radius: 16px;
    }
`;

const HeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const GradientTitle = styled(Title) <{ $isFocusMode?: boolean }>`
    && {
        margin: 0;
        background: ${props => props.$isFocusMode
        ? 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)'
        : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)'};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const LiveIndicator = styled.div<{ $isFocusMode?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: ${props => props.$isFocusMode
        ? 'rgba(16, 185, 129, 0.15)'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))'};
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 24px;
    font-size: 13px;
    font-weight: 500;
    color: #10b981;

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

const KPISection = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    height: 100%;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const EnterpriseKPICard = styled.div<{ $accentColor: string; $isFocusMode?: boolean; $delay?: number }>`
    background: ${props => props.$isFocusMode
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(255, 255, 255, 0.95)'};
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$isFocusMode
        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 4px 20px rgba(0, 0, 0, 0.06)'};
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
        background: ${props => props.$accentColor};
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
            rgba(255, 255, 255, 0.1) 50%,
            transparent 70%
        );
        transform: rotate(45deg);
        transition: all 0.6s ease;
        opacity: 0;
    }

    &:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: ${props => props.$isFocusMode
        ? '0 16px 40px rgba(0, 0, 0, 0.4)'
        : '0 16px 40px rgba(99, 102, 241, 0.15)'};

        &::after {
            opacity: 1;
            animation: ${shimmer} 0.6s ease;
        }
    }
`;

const KPIValue = styled.div<{ $color?: string }>`
    font-size: 42px;
    font-weight: 700;
    line-height: 1;
    color: ${props => props.$color || 'inherit'};
    margin-top: 8px;
`;

const KPISuffix = styled.span`
    font-size: 20px;
    font-weight: 500;
    margin-left: 4px;
    opacity: 0.7;
`;

const KPIIcon = styled.div<{ $bg: string; $glow?: string }>`
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg};
    font-size: 22px;
    animation: ${float} 4s ease-in-out infinite;
    box-shadow: 0 4px 12px ${props => props.$glow || 'rgba(0, 0, 0, 0.1)'};
`;

const TrendBadge = styled.div<{ $positive?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 12px;
    background: ${props => props.$positive
        ? 'rgba(16, 185, 129, 0.12)'
        : 'rgba(239, 68, 68, 0.12)'};
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const MiddleRow = styled.div`
    display: grid;
    grid-template-columns: 35% 30% 35%;
    gap: 16px;
    min-height: 0;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    & > * {
        min-height: 0;
        border-radius: 20px !important;
    }
`;

const BottomRow = styled.div`
    min-height: 0;
    
    & > * {
        border-radius: 20px !important;
    }
`;

const FloatingActionButton = styled(Button) <{ $isFocusMode?: boolean }>`
    && {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1001;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: ${props => props.$isFocusMode
        ? 'rgba(99, 102, 241, 0.2)'
        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'};
        border: ${props => props.$isFocusMode
        ? '1px solid rgba(99, 102, 241, 0.3)'
        : 'none'};
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        transition: all 0.3s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }
    }
`;

const LoadingContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
`;

const Dashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const [isFocusMode, setIsFocusMode] = useState(false);

    const { data: targetsData, isLoading: targetsLoading } = useGetTargets({ limit: 500 });
    const { data: actionsData, isLoading: actionsLoading } = useGetActions(
        { limit: 200 },
        { query: { refetchInterval: 15000 } }
    );

    const totalTargets = targetsData?.total ?? targetsData?.content?.length ?? 0;
    const sampleSize = targetsData?.content?.length ?? 0;
    const onlineSample = targetsData?.content
        ? targetsData.content.filter((target) => target.pollStatus?.overdue === false).length
        : 0;
    const estimatedOnlineTotal =
        sampleSize > 0 && totalTargets > sampleSize
            ? Math.round((onlineSample / sampleSize) * totalTargets)
            : onlineSample;
    const availability = totalTargets > 0 ? (estimatedOnlineTotal / totalTargets) * 100 : 0;

    const recentActions = useMemo(() => {
        if (!actionsData?.content) return [];
        const threshold = dayjs().subtract(24, 'hour');
        return actionsData.content.filter(
            (action) => action.createdAt && dayjs(action.createdAt).isAfter(threshold)
        );
    }, [actionsData]);

    const pendingActions = useMemo(
        () =>
            recentActions.filter((action) =>
                ['scheduled', 'pending', 'retrieving', 'ready'].includes(action.status?.toLowerCase() || '')
            ).length,
        [recentActions]
    );

    const { finishedCount, errorCount, errorItems } = useMemo(() => {
        let finished = 0;
        const errors: typeof recentActions = [];
        recentActions.forEach((action) => {
            const status = action.status?.toLowerCase();
            if (status === 'finished') finished += 1;
            if (status === 'error' || status === 'failed') {
                errors.push(action);
            }
        });

        return { finishedCount: finished, errorCount: errors.length, errorItems: errors };
    }, [recentActions]);

    const successRate = finishedCount + errorCount > 0 ? (finishedCount / (finishedCount + errorCount)) * 100 : 0;
    const criticalErrorCount = errorCount;

    const failureData = useMemo(() => {
        const bucketCount = 6;
        const bucketHours = 4;
        const start = dayjs().subtract(bucketCount * bucketHours, 'hour');

        const buckets = Array.from({ length: bucketCount }, (_, index) => {
            const bucketStart = start.add(index * bucketHours, 'hour');
            return {
                time: bucketStart.format('HH:mm'),
                timeout: 0,
                installError: 0,
                networkError: 0,
            };
        });

        const categorizeError = (detail?: string, statusCode?: number) => {
            const normalized = detail?.toLowerCase() || '';
            if (normalized.includes('network') || (statusCode && statusCode >= 500)) return 'networkError';
            if (normalized.includes('install')) return 'installError';
            if (normalized.includes('timeout') || normalized.includes('time')) return 'timeout';
            return 'installError';
        };

        errorItems.forEach((action) => {
            if (!action.createdAt) return;
            const created = dayjs(action.createdAt);
            if (created.isBefore(start)) return;
            const diffHours = Math.max(created.diff(start, 'hour'), 0);
            const bucketIndex = Math.min(bucketCount - 1, Math.floor(diffHours / bucketHours));
            const category = categorizeError(action.detailStatus, action.lastStatusCode);
            buckets[bucketIndex][category as 'timeout' | 'installError' | 'networkError'] += 1;
        });

        return buckets;
    }, [errorItems]);

    const liveLogs = useMemo<LiveTickerLog[]>(() => {
        return recentActions
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, 12)
            .map((action) => {
                const status = action.status?.toLowerCase() || 'info';
                const targetId = action._links?.target?.href?.split('/')?.pop();
                return {
                    id: action.id || Number(Math.random().toString().slice(2, 8)),
                    time: action.createdAt ? dayjs(action.createdAt).format('HH:mm:ss') : '--:--',
                    type: status === 'error' ? 'error' : status === 'finished' ? 'success' : 'info',
                    message: `${action.rolloutName || 'Action'} #${action.id} • ${status.toUpperCase()} ${targetId ? `@${targetId}` : ''}`,
                    link: action.id ? `/actions?q=id==${action.id}` : undefined,
                };
            });
    }, [recentActions]);

    const versionDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        targetsData?.content?.forEach((target) => {
            const descriptor = target.description || target.name || '';
            const versionMatch = descriptor.match(/v[\d.]+/i);
            const bucket = versionMatch ? versionMatch[0].toUpperCase() : target.targetTypeName || 'Unknown';
            counts[bucket] = (counts[bucket] || 0) + 1;
        });
        return counts;
    }, [targetsData]);

    const versionTreemapData = useMemo(() => {
        const palette = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
        return Object.entries(versionDistribution)
            .map(([name, size], index) => ({
                name,
                size,
                fill: palette[index % palette.length],
            }))
            .sort((a, b) => b.size - a.size);
    }, [versionDistribution]);

    const uniqueVersions = Object.keys(versionDistribution).length;
    const fragmentationScore =
        totalTargets > 0 ? Math.min(100, (uniqueVersions / totalTargets) * 100) : 0;

    const availabilityTrendRef = useRef<number | null>(null);
    const [availabilityTrend, setAvailabilityTrend] = useState<number>();
    useEffect(() => {
        if (availabilityTrendRef.current !== null && totalTargets > 0) {
            const delta = estimatedOnlineTotal - availabilityTrendRef.current;
            setAvailabilityTrend(Number(((delta / totalTargets) * 100).toFixed(1)));
        }
        availabilityTrendRef.current = estimatedOnlineTotal;
    }, [estimatedOnlineTotal, totalTargets]);

    const successTrendRef = useRef<number | null>(null);
    const [successRateTrend, setSuccessRateTrend] = useState<number>();
    useEffect(() => {
        if (successTrendRef.current !== null) {
            setSuccessRateTrend(Number((successRate - successTrendRef.current).toFixed(1)));
        }
        successTrendRef.current = successRate;
    }, [successRate]);

    const toggleFocusMode = () => {
        setIsFocusMode((prev) => !prev);
        if (!isFocusMode) {
            document.documentElement.requestFullscreen().catch(() => null);
        } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => null);
        }
    };

    const handleTickerClick = useCallback(
        (log: LiveTickerLog) => {
            if (log.link) {
                navigate(log.link);
            }
        },
        [navigate]
    );

    if (targetsLoading || actionsLoading) {
        return (
            <LoadingContainer>
                <Spin size="large" />
                <Text type="secondary">Loading Dashboard Data...</Text>
            </LoadingContainer>
        );
    }

    return (
        <DashboardContainer $isFocusMode={isFocusMode}>
            <Tooltip title={isFocusMode ? t('focus.exit') : t('focus.enter')}>
                <FloatingActionButton
                    type="primary"
                    $isFocusMode={isFocusMode}
                    icon={isFocusMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    onClick={toggleFocusMode}
                />
            </Tooltip>

            <HeaderSection>
                <HeaderContent>
                    <GradientTitle level={3} $isFocusMode={isFocusMode}>
                        {t('title', 'Operations Dashboard')}
                    </GradientTitle>
                    <Text type="secondary" style={{ color: isFocusMode ? 'rgba(255,255,255,0.6)' : undefined }}>
                        Real-time fleet monitoring and deployment insights
                    </Text>
                </HeaderContent>
                <LiveIndicator $isFocusMode={isFocusMode}>
                    Live Data • {totalTargets} devices
                </LiveIndicator>
            </HeaderSection>

            <KPISection>
                <EnterpriseKPICard
                    $accentColor="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                    $isFocusMode={isFocusMode}
                    $delay={1}
                    onClick={() => navigate('/targets')}
                >
                    <Flex justify="space-between" align="start">
                        <div>
                            <Text type="secondary" style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 600,
                                color: isFocusMode ? 'rgba(255,255,255,0.6)' : undefined
                            }}>
                                {t('charts.availability')}
                            </Text>
                            <KPIValue $color="#10b981">
                                {availability.toFixed(1)}<KPISuffix>%</KPISuffix>
                            </KPIValue>
                            {availabilityTrend !== undefined && (
                                <TrendBadge $positive={availabilityTrend >= 0}>
                                    {availabilityTrend >= 0 ? <RiseOutlined /> : <FallOutlined />}
                                    {Math.abs(availabilityTrend).toFixed(1)}%
                                </TrendBadge>
                            )}
                        </div>
                        <KPIIcon $bg="rgba(16, 185, 129, 0.12)" $glow="rgba(16, 185, 129, 0.25)">
                            <CloudServerOutlined style={{ color: '#10b981' }} />
                        </KPIIcon>
                    </Flex>
                </EnterpriseKPICard>

                <EnterpriseKPICard
                    $accentColor="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                    $isFocusMode={isFocusMode}
                    $delay={2}
                    onClick={() => navigate('/actions')}
                >
                    <Flex justify="space-between" align="start">
                        <div>
                            <Text type="secondary" style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 600,
                                color: isFocusMode ? 'rgba(255,255,255,0.6)' : undefined
                            }}>
                                {t('charts.successRate')}
                            </Text>
                            <KPIValue $color="#3b82f6">
                                {successRate.toFixed(1)}<KPISuffix>%</KPISuffix>
                            </KPIValue>
                            {successRateTrend !== undefined && (
                                <TrendBadge $positive={successRateTrend >= 0}>
                                    {successRateTrend >= 0 ? <RiseOutlined /> : <FallOutlined />}
                                    {Math.abs(successRateTrend).toFixed(1)}%
                                </TrendBadge>
                            )}
                        </div>
                        <KPIIcon $bg="rgba(59, 130, 246, 0.12)" $glow="rgba(59, 130, 246, 0.25)">
                            <CheckCircleOutlined style={{ color: '#3b82f6' }} />
                        </KPIIcon>
                    </Flex>
                </EnterpriseKPICard>

                <EnterpriseKPICard
                    $accentColor="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                    $isFocusMode={isFocusMode}
                    $delay={3}
                    onClick={() => navigate('/jobs')}
                >
                    <Flex justify="space-between" align="start">
                        <div>
                            <Text type="secondary" style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 600,
                                color: isFocusMode ? 'rgba(255,255,255,0.6)' : undefined
                            }}>
                                {t('charts.pendingActions')}
                            </Text>
                            <KPIValue $color="#f59e0b">
                                {pendingActions}
                            </KPIValue>
                            <Text type="secondary" style={{
                                fontSize: 12,
                                marginTop: 12,
                                display: 'block',
                                color: isFocusMode ? 'rgba(255,255,255,0.5)' : undefined
                            }}>
                                Last 24 hours
                            </Text>
                        </div>
                        <KPIIcon $bg="rgba(245, 158, 11, 0.12)" $glow="rgba(245, 158, 11, 0.25)">
                            <ClockCircleOutlined style={{ color: '#f59e0b' }} />
                        </KPIIcon>
                    </Flex>
                </EnterpriseKPICard>

                <EnterpriseKPICard
                    $accentColor="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                    $isFocusMode={isFocusMode}
                    $delay={4}
                    onClick={() => navigate('/actions')}
                >
                    <Flex justify="space-between" align="start">
                        <div>
                            <Text type="secondary" style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 600,
                                color: isFocusMode ? 'rgba(255,255,255,0.6)' : undefined
                            }}>
                                {t('kpi.criticalErrors')}
                            </Text>
                            <KPIValue $color="#ef4444">
                                {criticalErrorCount}
                            </KPIValue>
                            {criticalErrorCount > 0 && (
                                <TrendBadge $positive={false}>
                                    <WarningOutlined /> Requires attention
                                </TrendBadge>
                            )}
                            {criticalErrorCount === 0 && (
                                <TrendBadge $positive>
                                    <CheckCircleOutlined /> All clear
                                </TrendBadge>
                            )}
                        </div>
                        <KPIIcon $bg="rgba(239, 68, 68, 0.12)" $glow="rgba(239, 68, 68, 0.25)">
                            <WarningOutlined style={{ color: '#ef4444' }} />
                        </KPIIcon>
                    </Flex>
                </EnterpriseKPICard>
            </KPISection>

            <MiddleRow>
                <FailureChart data={failureData} />
                <ActiveRolloutCard />
                <VersionTreemap
                    data={versionTreemapData}
                    fragmentationScore={fragmentationScore}
                    uniqueVersions={uniqueVersions}
                />
            </MiddleRow>

            <BottomRow>
                <LiveTicker
                    logs={liveLogs}
                    title={t('ticker.title')}
                    emptyText={t('ticker.empty')}
                    onLogClick={handleTickerClick}
                />
            </BottomRow>
        </DashboardContainer>
    );
};

export default Dashboard;
