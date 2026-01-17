import styled from 'styled-components';
import { Typography, Button, Flex } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/patterns';
import { LiveIndicator } from '../DashboardStyles';

const { Title, Text } = Typography;

const GradientTitle = styled(Title)`
    && {
        margin: 0;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--ant-color-text); /* Solid color for industrial clarity */
    }
    
    /* Optional: Subtle gradient only in high-impact mode or leave solid */
`;

const HeaderShell = styled.div`
    padding: clamp(8px, 1.2vw, 12px);
    border-radius: var(--ant-border-radius-lg, 12px);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(20px);
    margin-bottom: 0;

    [data-theme='dark'] &,
    .dark-mode & {
        background: var(--glass-bg);
        border-color: var(--glass-border);
        box-shadow: var(--shadow-md);
    }
`;

const HeaderMeta = styled(Flex)`
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: var(--ant-border-radius, 6px);
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border);

    [data-theme='dark'] &,
    .dark-mode & {
        background: var(--ant-color-bg-elevated);
        border-color: var(--ant-color-border-secondary);
    }
`;

const QuickStats = styled(Flex)`
    gap: 8px;
    flex-wrap: wrap;
`;

const StatPill = styled.button<{ $tone?: 'neutral' | 'good' | 'warn' | 'info' }>`
    appearance: none;
    border: 1px solid var(--ant-color-border-secondary);
    background: var(--ant-color-bg-container);
    padding: 6px 10px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    min-height: 30px;
    font-family: inherit;

    ${({ $tone }) => {
        switch ($tone) {
            case 'good':
                return `
                    border-color: var(--ant-color-success-border);
                    background: var(--ant-color-success-bg);
                `;
            case 'warn':
                return `
                    border-color: var(--ant-color-warning-border);
                    background: var(--ant-color-warning-bg);
                `;
            case 'info':
                return `
                    border-color: var(--ant-color-info-border);
                    background: var(--ant-color-info-bg);
                `;
            default:
                return '';
        }
    }}

    &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
        border-color: var(--ant-color-primary-border);
    }

    &:focus-visible {
        outline: 2px solid var(--ant-color-primary);
        outline-offset: 2px;
    }

    &:disabled {
        cursor: default;
        opacity: 0.7;
        box-shadow: none;
    }
`;

const StatLabel = styled(Text)`
    font-size: 11px;
    color: var(--ant-color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

const StatValue = styled(Text)`
    font-size: 14px;
    font-weight: 700;
    color: var(--ant-color-text);
    font-family: var(--font-mono);
`;

interface DashboardHeaderProps {
    lastUpdated: string;
    isActivePolling: boolean;
    isLoading: boolean;
    onRefresh: () => void;
    stats?: {
        key: string;
        label: string;
        value: string | number;
        tone?: 'neutral' | 'good' | 'warn' | 'info';
        onClick?: () => void;
    }[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    lastUpdated,
    isActivePolling,
    isLoading,
    onRefresh,
    stats = [],
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    return (
        <HeaderShell>
            <PageHeader
                title={(
                    <GradientTitle level={2}>
                        {t('title', 'Operations Dashboard')}
                    </GradientTitle>
                )}
                subtitle={t('subtitle', 'Deployment actions and status overview')}
                subtitleExtra={(
                    <LiveIndicator $active={isActivePolling} $color="var(--ant-color-success)">
                        {isActivePolling ? t('common:status.live', 'Live') : t('common:status.idle', 'Idle')}
                    </LiveIndicator>
                )}
                actions={(
                    <Flex align="center" gap={12} wrap>
                        {stats.length > 0 && (
                            <QuickStats>
                                {stats.map((stat) => (
                                    <StatPill
                                        key={stat.key}
                                        type="button"
                                        onClick={stat.onClick}
                                        $tone={stat.tone}
                                        aria-label={`${stat.label} ${stat.value}`}
                                        className={stat.onClick ? 'dashboard-clickable' : undefined}
                                        disabled={!stat.onClick}
                                    >
                                        <StatLabel>{stat.label}</StatLabel>
                                        <StatValue>{stat.value}</StatValue>
                                    </StatPill>
                                ))}
                            </QuickStats>
                        )}
                        <HeaderMeta>
                            <Text className="text-mono" type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                {t('updated', 'Updated')}: {lastUpdated}
                            </Text>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={onRefresh}
                                loading={isLoading}
                                size="small"
                            >
                                {t('refresh', 'Refresh')}
                            </Button>
                        </HeaderMeta>
                    </Flex>
                )}
            />
        </HeaderShell>
    );
};
