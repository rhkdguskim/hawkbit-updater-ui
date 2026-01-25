import React, { useState, useCallback, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Typography, Button, Flex, Dropdown, Badge, Tooltip } from 'antd';
import { 
    ReloadOutlined, 
    DashboardOutlined, 
    DownOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    SettingOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/patterns';
import { WebSocketIndicator } from '@/components/shared/WebSocketIndicator';
import { DASHBOARD_COLORS, TYPOGRAPHY, SPACING, SHADOWS, TRANSITIONS, MEDIA_QUERIES } from '@/theme/dashboard-design-system';

const { Title, Text } = Typography;

const pulseAnimation = keyframes`
    0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    70% {
        box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
`;

const shimmerAnimation = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`;

const EnterpriseHeader = styled.div`
    position: relative;
    padding: ${SPACING[4]} ${SPACING[6]};
    border-radius: 16px;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(248, 250, 252, 0.95) 100%
    );
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: ${SHADOWS.md};
    backdrop-filter: blur(20px);
    margin-bottom: 0;
    transition: ${TRANSITIONS.default};

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${DASHBOARD_COLORS.gradients.primary};
        border-radius: 16px 16px 0 0;
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: linear-gradient(
            135deg,
            rgba(17, 24, 39, 0.95) 0%,
            rgba(31, 41, 55, 0.9) 100%
        );
        border-color: rgba(75, 85, 99, 0.3);
        box-shadow: ${SHADOWS.lg};
    }

    ${MEDIA_QUERIES.maxMd} {
        padding: ${SPACING[3]} ${SPACING[4]};
        border-radius: 12px;
    }
`;

const HeaderTopRow = styled(Flex)`
    width: 100%;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${SPACING[6]};
    margin-bottom: ${SPACING[4]};

    ${MEDIA_QUERIES.maxMd} {
        flex-direction: column;
        gap: ${SPACING[3]};
    }
`;

const TitleSection = styled.div`
    flex: 1;
    min-width: 0;
`;

const EnterpriseTitle = styled(Title)`
    && {
        margin: 0 0 ${SPACING[1]} 0;
        font-size: ${TYPOGRAPHY.components.h1.fontSize};
        font-weight: ${TYPOGRAPHY.components.h1.fontWeight};
        line-height: ${TYPOGRAPHY.components.h1.lineHeight};
        letter-spacing: ${TYPOGRAPHY.components.h1.letterSpacing};
        color: var(--ant-color-text);
        font-family: ${TYPOGRAPHY.fontFamily.display};

        background: ${DASHBOARD_COLORS.gradients.primary};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    ${MEDIA_QUERIES.maxMd} {
        font-size: ${TYPOGRAPHY.fontSize['2xl']};
    }
`;

const Subtitle = styled(Text)`
    display: block;
    font-size: ${TYPOGRAPHY.fontSize.sm};
    color: var(--ant-color-text-secondary);
    margin-top: ${SPACING[1]};
`;

const ActionsBar = styled(Flex)`
    align-items: center;
    gap: ${SPACING[3]};
    flex-shrink: 0;

    ${MEDIA_QUERIES.maxMd} {
        width: 100%;
        justify-content: flex-end;
    }
`;

const LiveBadge = styled.div<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${SPACING[2]};
    padding: ${SPACING[2]} ${SPACING[3]};
    border-radius: 20px;
    background: ${props => props.$active
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(107, 114, 128, 0.1)'
    };
    border: 1px solid ${props => props.$active
        ? 'rgba(16, 185, 129, 0.3)'
        : 'rgba(107, 114, 128, 0.2)'
    };
    font-size: ${TYPOGRAPHY.fontSize.xs};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    text-transform: uppercase;
    letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
    color: ${props => props.$active
        ? DASHBOARD_COLORS.status.success
        : DASHBOARD_COLORS.status.neutral
    };
    transition: ${TRANSITIONS.default};

    ${props => props.$active && css`
        animation: ${pulseAnimation} 2s ease-in-out infinite;
    `}
`;

const PulseDot = styled.div<{ $active: boolean }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.$active
        ? DASHBOARD_COLORS.status.success
        : DASHBOARD_COLORS.status.neutral
    };
`;

const QuickStatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: ${SPACING[3]};
    width: 100%;
    margin-top: ${SPACING[3]};

    ${MEDIA_QUERIES.maxMd} {
        display: none;
    }
`;

const StatCard = styled.button<{ $tone?: 'neutral' | 'good' | 'warn' | 'info' | 'error' }>`
    all: unset;
    position: relative;
    padding: ${SPACING[3]} ${SPACING[4]};
    border-radius: 12px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border);
    cursor: pointer;
    transition: ${TRANSITIONS.default};
    overflow: hidden;
    min-height: 68px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => {
            switch (props.$tone) {
                case 'good': return DASHBOARD_COLORS.status.success;
                case 'warn': return DASHBOARD_COLORS.status.warning;
                case 'error': return DASHBOARD_COLORS.status.critical;
                case 'info': return DASHBOARD_COLORS.status.info;
                default: return 'transparent';
            }
        }};
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${SHADOWS.md};
        border-color: var(--ant-color-primary-border);

        &::before {
            transform: scaleX(1);
        }
    }

    &:focus-visible {
        outline: 3px solid var(--ant-color-primary);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px var(--ant-color-primary-bg);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        cursor: default;
        opacity: 0.6;
        transform: none;
        box-shadow: none;

        &:hover::before {
            transform: scaleX(0);
        }
    }

    ${props => props.$tone && css`
        background: ${() => {
            switch (props.$tone) {
                case 'good': return 'rgba(16, 185, 129, 0.05)';
                case 'warn': return 'rgba(245, 158, 11, 0.05)';
                case 'error': return 'rgba(220, 38, 38, 0.05)';
                case 'info': return 'rgba(59, 130, 246, 0.05)';
                default: return 'var(--ant-color-bg-container)';
            }
        }};
    `}
`;

const StatLabel = styled(Text)`
    display: block;
    font-size: ${TYPOGRAPHY.components.metricLabel.fontSize};
    font-weight: ${TYPOGRAPHY.components.metricLabel.fontWeight};
    color: var(--ant-color-text-tertiary);
    text-transform: ${TYPOGRAPHY.components.metricLabel.textTransform};
    letter-spacing: ${TYPOGRAPHY.components.metricLabel.letterSpacing};
    margin-bottom: ${SPACING[1]};
`;

const StatValue = styled(Text)<{ $tone?: string }>`
    display: block;
    font-size: ${TYPOGRAPHY.fontSize.xl};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
    color: ${props => {
        switch (props.$tone) {
            case 'good': return DASHBOARD_COLORS.status.success;
            case 'warn': return DASHBOARD_COLORS.status.warning;
            case 'error': return DASHBOARD_COLORS.status.critical;
            case 'info': return DASHBOARD_COLORS.status.info;
            default: return 'var(--ant-color-text)';
        }
    }};
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    line-height: 1.2;
`;

const MobileStatsButton = styled(Button)`
    display: none;

    ${MEDIA_QUERIES.maxMd} {
        display: inline-flex;
    }
`;

const MetaInfo = styled(Flex)`
    align-items: center;
    gap: ${SPACING[3]};
    padding: ${SPACING[2]} ${SPACING[4]};
    border-radius: 8px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border);

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(31, 41, 55, 0.5);
        border-color: rgba(75, 85, 99, 0.3);
    }
`;

const UpdateTimestamp = styled(Text)`
    font-size: ${TYPOGRAPHY.fontSize.xs};
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    color: var(--ant-color-text-secondary);
    white-space: nowrap;
`;

const ActionButton = styled(Button)`
    border-radius: 8px;
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
    transition: ${TRANSITIONS.default};

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${SHADOWS.sm};
    }

    &:active {
        transform: translateY(0);
    }
`;

interface QuickStat {
    key: string;
    label: string;
    value: string | number;
    tone?: 'neutral' | 'good' | 'warn' | 'info' | 'error';
    onClick?: () => void;
    badge?: number;
}

interface DashboardHeaderProps {
    lastUpdated?: string;
    isActivePolling?: boolean;
    isLoading?: boolean;
    onRefresh?: () => void;
    stats?: QuickStat[];
    onFullscreenToggle?: () => void;
    isFullscreen?: boolean;
    notificationCount?: number;
    onSettingsClick?: () => void;
}

export const DashboardHeader = React.memo<DashboardHeaderProps>(({
    lastUpdated = '',
    isActivePolling = false,
    isLoading = false,
    onRefresh,
    stats = [],
    onFullscreenToggle,
    isFullscreen = false,
    notificationCount = 0,
    onSettingsClick,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const [hoveredStat, setHoveredStat] = useState<string | null>(null);

    const mobileStatsMenuItems = useMemo(() => stats.map(stat => ({
        key: stat.key,
        label: (
            <Flex justify="space-between" align="center" style={{ minWidth: 200 }}>
                <Text type="secondary">{stat.label}</Text>
                <Text strong>{stat.value}</Text>
            </Flex>
        ),
        onClick: stat.onClick,
    })), [stats]);

    const handleStatClick = useCallback((stat: QuickStat) => {
        if (stat.onClick) {
            stat.onClick();
        }
    }, []);

    const handleStatKeyDown = useCallback((e: React.KeyboardEvent, stat: QuickStat) => {
        if ((e.key === 'Enter' || e.key === ' ') && stat.onClick) {
            e.preventDefault();
            stat.onClick();
        }
    }, []);

    return (
        <EnterpriseHeader role="banner" aria-label="Dashboard header">
            <HeaderTopRow>
                <TitleSection>
                    <EnterpriseTitle level={2}>
                        {t('title')}
                    </EnterpriseTitle>
                    <Subtitle>
                        {t('subtitle')}
                    </Subtitle>
                </TitleSection>

                <ActionsBar>
                    <WebSocketIndicator showLabel={true} />

                    <MobileStatsButton
                        icon={<DashboardOutlined />}
                        type="default"
                    >
                        <Dropdown
                            menu={{ items: mobileStatsMenuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Flex align="center" gap={4}>
                                <span>{t('quick.stats', 'Stats')}</span>
                                <DownOutlined style={{ fontSize: '10px' }} />
                            </Flex>
                        </Dropdown>
                    </MobileStatsButton>

                    <MetaInfo>
                        {onRefresh && (
                            <Tooltip title={t('refresh', 'Manual refresh')}>
                                <ActionButton
                                    type="text"
                                    icon={<ReloadOutlined spin={isLoading} />}
                                    onClick={onRefresh}
                                    loading={isLoading}
                                    size="small"
                                    aria-label="Manual refresh dashboard data"
                                />
                            </Tooltip>
                        )}

                        {notificationCount > 0 && (
                            <Tooltip title={t('notifications', 'Notifications')}>
                                <Badge count={notificationCount} size="small">
                                    <ActionButton
                                        type="text"
                                        icon={<BellOutlined />}
                                        size="small"
                                        aria-label={`${notificationCount} notifications`}
                                    />
                                </Badge>
                            </Tooltip>
                        )}

                        {onFullscreenToggle && (
                            <Tooltip title={isFullscreen ? t('exitFullscreen', 'Exit fullscreen') : t('enterFullscreen', 'Enter fullscreen')}>
                                <ActionButton
                                    type="text"
                                    icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                    onClick={onFullscreenToggle}
                                    size="small"
                                    aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
                                />
                            </Tooltip>
                        )}

                        {onSettingsClick && (
                            <Tooltip title={t('settings', 'Dashboard settings')}>
                                <ActionButton
                                    type="text"
                                    icon={<SettingOutlined />}
                                    onClick={onSettingsClick}
                                    size="small"
                                    aria-label="Open dashboard settings"
                                />
                            </Tooltip>
                        )}
                    </MetaInfo>
                </ActionsBar>
            </HeaderTopRow>

            {stats.length > 0 && (
                <QuickStatsGrid role="region" aria-label="Quick statistics">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.key}
                            type="button"
                            onClick={() => handleStatClick(stat)}
                            onKeyDown={(e) => handleStatKeyDown(e, stat)}
                            onMouseEnter={() => setHoveredStat(stat.key)}
                            onMouseLeave={() => setHoveredStat(null)}
                            $tone={stat.tone}
                            disabled={!stat.onClick}
                            aria-label={`${stat.label}: ${stat.value}`}
                            aria-pressed={hoveredStat === stat.key}
                            tabIndex={stat.onClick ? 0 : -1}
                        >
                            <StatLabel>{stat.label}</StatLabel>
                            <Flex align="center" justify="space-between">
                                <StatValue $tone={stat.tone}>{stat.value}</StatValue>
                                {stat.badge !== undefined && stat.badge > 0 && (
                                    <Badge 
                                        count={stat.badge} 
                                        style={{ backgroundColor: DASHBOARD_COLORS.status.warning }}
                                    />
                                )}
                            </Flex>
                        </StatCard>
                    ))}
                </QuickStatsGrid>
            )}
        </EnterpriseHeader>
    );
});
