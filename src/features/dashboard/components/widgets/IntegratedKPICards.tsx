import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, Progress } from 'antd';
import {
    AppstoreOutlined,
    ApiOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    RocketOutlined,
    ThunderboltOutlined,
    CodeOutlined,
} from '@ant-design/icons';
import { IntegratedKPIGrid, StatsCard, BigNumber, COLORS } from '../DashboardStyles';
import styled from 'styled-components';

const { Text } = Typography;

const IconBadge = styled.div<{ $color: string }>`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$color};
    color: white;
    font-size: 20px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
`;

const MiniNumber = styled.div<{ $color?: string }>`
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: ${props => props.$color || 'var(--ant-color-text)'};
`;

interface IntegratedKPICardsProps {
    isLoading: boolean;
    // Targets
    totalDevices: number;
    onlineCount: number;
    inSyncCount: number;
    pendingCount: number;
    errorCount: number;
    // Distributions
    distributionSetsCount: number;
    softwareModulesCount: number;
    // Rollouts
    runningRolloutCount: number;
    activeRolloutCount: number;
    // Actions
    successRate: number | null;
    totalActions: number;
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
    distributionSetsCount,
    softwareModulesCount,
    runningRolloutCount,
    activeRolloutCount,
    successRate,
    totalActions,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const navigate = useNavigate();

    const cards: KPICardConfig[] = [
        {
            key: 'totalDevices',
            label: t('kpi.totalDevices', 'Total Devices'),
            value: totalDevices,
            icon: <AppstoreOutlined />,
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            onClick: () => navigate('/targets'),
        },
        {
            key: 'online',
            label: t('kpi.online', 'Online'),
            value: onlineCount,
            icon: <ApiOutlined />,
            color: COLORS.online,
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            onClick: () => navigate('/targets'),
        },
        {
            key: 'inSync',
            label: t('kpi.inSync', 'In Sync'),
            value: inSyncCount,
            icon: <CheckCircleOutlined />,
            color: COLORS.inSync,
            gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            onClick: () => navigate('/targets'),
        },
        {
            key: 'pending',
            label: t('kpi.pending', 'Pending'),
            value: pendingCount,
            icon: <ClockCircleOutlined />,
            color: COLORS.pending,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            pulse: pendingCount > 0,
            onClick: () => navigate('/targets'),
        },
        {
            key: 'distributions',
            label: t('kpi.distributions', 'Distributions'),
            value: distributionSetsCount,
            icon: <CodeOutlined />,
            color: '#6366f1',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            onClick: () => navigate('/distributions'),
        },
        {
            key: 'rollouts',
            label: t('kpi.activeRollouts', 'Running'),
            value: runningRolloutCount,
            icon: <RocketOutlined />,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pulse: runningRolloutCount > 0,
            onClick: () => navigate('/rollouts'),
        },
        {
            key: 'successRate',
            label: t('kpi.successRate', 'Success'),
            value: successRate !== null ? `${successRate}%` : '-',
            icon: <ThunderboltOutlined />,
            color: COLORS.finished,
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            onClick: () => navigate('/actions'),
        },
        {
            key: 'errors',
            label: t('kpi.errors', 'Errors'),
            value: errorCount,
            icon: <ExclamationCircleOutlined />,
            color: errorCount > 0 ? COLORS.error : '#94a3b8',
            gradient: errorCount > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            pulse: errorCount > 0,
            onClick: () => navigate('/targets'),
        },
    ];

    return (
        <IntegratedKPIGrid>
            {cards.map((card, index) => (
                <StatsCard
                    key={card.key}
                    $accentColor={card.gradient}
                    $delay={index + 1}
                    $pulse={card.pulse}
                    onClick={card.onClick}
                >
                    {isLoading ? (
                        <Skeleton.Avatar active size={48} />
                    ) : (
                        <Flex vertical align="center" justify="center" gap={8} style={{ height: '100%' }}>
                            <IconBadge $color={card.gradient}>
                                {card.icon}
                            </IconBadge>
                            <MiniNumber $color={card.color}>{card.value}</MiniNumber>
                            <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.2 }}>
                                {card.label}
                            </Text>
                        </Flex>
                    )}
                </StatsCard>
            ))}
        </IntegratedKPIGrid>
    );
};

export default IntegratedKPICards;
