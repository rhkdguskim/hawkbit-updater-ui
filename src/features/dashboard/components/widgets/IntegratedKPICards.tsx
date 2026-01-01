import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton } from 'antd';
import {
    AppstoreOutlined,
    ApiOutlined,
    PauseCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    RocketOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { StatsCard, COLORS } from '../DashboardStyles';
import styled from 'styled-components';

const { Text } = Typography;

const IconBadge = styled.div<{ $color: string }>`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$color};
    color: #fff;
    font-size: var(--ant-font-size);
    box-shadow: var(--ant-box-shadow-tertiary, 0 2px 8px rgba(0, 0, 0, 0.15));
    flex-shrink: 0;

    .anticon,
    svg {
        color: #fff;
        display: block;
    }
`;

const MiniNumber = styled.div<{ $color?: string }>`
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.2;
    color: ${props => props.$color || 'var(--ant-color-text)'};
`;

interface IntegratedKPICardsProps {
    isLoading: boolean;
    totalDevices: number;
    onlineCount: number;
    inSyncCount: number;
    pendingCount: number;
    errorCount: number;
    runningRolloutCount: number;
    successRate: number | null;
    currentVelocity: number;
    pendingApprovalRolloutCount: number;
    pausedRolloutCount: number;
    scheduledReadyRolloutCount: number;
    delayedActionsCount: number;
    newTargets24hCount: number;
    neverConnectedCount: number;
    canceledActions24hCount: number;
    errorActions24hCount: number;
    onErrorClick?: () => void;
}

interface KPICardConfig {
    key: string;
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    pulse?: boolean;
    onClick: () => void;
}

export const IntegratedKPICards: React.FC<IntegratedKPICardsProps> = ({
    isLoading,
    totalDevices,
    onlineCount,
    inSyncCount,
    pendingCount,
    errorCount,
    runningRolloutCount,
    successRate,
    currentVelocity,
    pendingApprovalRolloutCount,
    pausedRolloutCount,
    scheduledReadyRolloutCount,
    delayedActionsCount,
    newTargets24hCount,
    neverConnectedCount,
    canceledActions24hCount,
    errorActions24hCount,
    onErrorClick,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const navigate = useNavigate();

    const cards: KPICardConfig[] = [
        // Targets cluster
        {
            key: 'totalDevices',
            label: t('kpi.totalDevices'),
            value: totalDevices,
            icon: <AppstoreOutlined />,
            color: 'var(--ant-color-primary, #3b82f6)',
            gradient: 'var(--gradient-primary, linear-gradient(135deg, #3b82f6 0%, #6366f1 100%))',
            onClick: () => navigate('/targets'),
        },
        {
            key: 'online',
            label: t('kpi.online'),
            value: onlineCount,
            icon: <ApiOutlined />,
            color: COLORS.online,
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            onClick: () => navigate('/targets'),
        },
        {
            key: 'inSync',
            label: t('kpi.inSync'),
            value: inSyncCount,
            icon: <CheckCircleOutlined />,
            color: COLORS.inSync,
            gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            onClick: () => navigate('/targets'),
        },
        {
            key: 'neverConnected',
            label: t('kpi.neverConnected', 'Never connected'),
            value: neverConnectedCount,
            icon: <ApiOutlined />,
            color: COLORS.unknown,
            gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            pulse: neverConnectedCount > 0,
            onClick: () => navigate('/targets'),
        },
        {
            key: 'newTargets24h',
            label: t('kpi.newTargets24h', 'New targets (24h)'),
            value: newTargets24hCount,
            icon: <AppstoreOutlined />,
            color: 'var(--ant-color-primary)',
            gradient: 'var(--gradient-primary, linear-gradient(135deg, #3b82f6 0%, #6366f1 100%))',
            onClick: () => navigate('/targets'),
        },
        // Actions cluster
        {
            key: 'pending',
            label: t('kpi.pending'),
            value: pendingCount,
            icon: <ClockCircleOutlined />,
            color: COLORS.pending,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            pulse: pendingCount > 0,
            onClick: () => navigate('/targets'),
        },
        {
            key: 'delayedActions',
            label: t('kpi.delayedActions', 'Delayed actions'),
            value: delayedActionsCount,
            icon: <ThunderboltOutlined />,
            color: COLORS.pending,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            pulse: delayedActionsCount > 0,
            onClick: () => navigate('/actions?status=pending'),
        },
        {
            key: 'errors',
            label: t('kpi.errors'),
            value: errorCount,
            icon: <ExclamationCircleOutlined />,
            color: errorCount > 0 ? COLORS.error : 'var(--ant-color-text-description)',
            gradient: errorCount > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            pulse: errorCount > 0,
            onClick: () => onErrorClick ? onErrorClick() : navigate('/targets'),
        },
        {
            key: 'errorActions24h',
            label: t('kpi.errorActions24h', 'Error actions (24h)'),
            value: errorActions24hCount,
            icon: <ExclamationCircleOutlined />,
            color: COLORS.error,
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            pulse: errorActions24hCount > 0,
            onClick: () => navigate('/actions?status=error'),
        },
        {
            key: 'canceledActions24h',
            label: t('kpi.canceledActions24h', 'Canceled actions (24h)'),
            value: canceledActions24hCount,
            icon: <CloseCircleOutlined />,
            color: COLORS.canceled,
            gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            onClick: () => navigate('/actions?status=canceled'),
        },
        {
            key: 'rollouts',
            label: t('kpi.activeRollouts'),
            value: runningRolloutCount,
            icon: <RocketOutlined />,
            color: COLORS.offline,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pulse: runningRolloutCount > 0,
            onClick: () => navigate('/rollouts'),
        },
        // Rollouts cluster
        {
            key: 'pendingApprovalRollouts',
            label: t('kpi.pendingApprovalRollouts', 'Pending approvals'),
            value: pendingApprovalRolloutCount,
            icon: <ExclamationCircleOutlined />,
            color: 'var(--ant-color-warning)',
            gradient: 'var(--gradient-warning, linear-gradient(135deg, #f59e0b 0%, #d97706 100%))',
            pulse: pendingApprovalRolloutCount > 0,
            onClick: () => navigate('/rollouts?status=waiting_for_approval'),
        },
        {
            key: 'pausedRollouts',
            label: t('kpi.pausedRollouts', 'Paused rollouts'),
            value: pausedRolloutCount,
            icon: <PauseCircleOutlined />,
            color: COLORS.offline,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pulse: pausedRolloutCount > 0,
            onClick: () => navigate('/rollouts?status=paused'),
        },
        {
            key: 'scheduledReadyRollouts',
            label: t('kpi.scheduledReadyRollouts', 'Scheduled / Ready'),
            value: scheduledReadyRolloutCount,
            icon: <ClockCircleOutlined />,
            color: 'var(--ant-color-info)',
            gradient: 'var(--gradient-info, linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%))',
            onClick: () => navigate('/rollouts?status=scheduled'),
        },
        {
            key: 'successRate',
            label: t('kpi.successRate'),
            value: successRate !== null ? `${successRate}%` : '-',
            icon: <ThunderboltOutlined />,
            color: COLORS.finished,
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            onClick: () => navigate('/actions'),
        },
        {
            key: 'velocity',
            label: t('velocity.current'),
            value: `${currentVelocity}`,
            icon: <ThunderboltOutlined />,
            color: 'var(--ant-color-primary)',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
            pulse: currentVelocity > 0,
            onClick: () => navigate('/actions'),
        },
    ];

    return (
        <>
            {cards.map((card, index) => (
                <StatsCard
                    key={card.key}
                    $accentColor={card.gradient}
                    $delay={index + 1}
                    $pulse={card.pulse}
                    onClick={card.onClick}
                    style={{ minHeight: 'auto' }}
                >
                    {isLoading ? (
                        <Skeleton.Avatar active size={32} />
                    ) : (
                        <Flex align="center" gap={8} style={{ height: '100%' }}>
                            <IconBadge $color={card.gradient}>
                                {card.icon}
                            </IconBadge>
                            <Flex vertical gap={0} style={{ flex: 1, minWidth: 0 }}>
                                <MiniNumber $color={card.color}>{card.value}</MiniNumber>
                                <Text type="secondary" style={{ fontSize: '0.75rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {card.label}
                                </Text>
                            </Flex>
                        </Flex>
                    )}
                </StatsCard>
            ))}
        </>
    );
};

export default IntegratedKPICards;
