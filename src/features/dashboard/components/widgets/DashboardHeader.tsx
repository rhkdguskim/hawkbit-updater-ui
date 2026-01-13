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
    padding: clamp(12px, 1.6vw, 16px);
    border-radius: var(--ant-border-radius-lg, 12px);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(20px);
    margin-bottom: 4px;

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

interface DashboardHeaderProps {
    lastUpdated: string;
    isActivePolling: boolean;
    isLoading: boolean;
    onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    lastUpdated,
    isActivePolling,
    isLoading,
    onRefresh,
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
                    <LiveIndicator $active={isActivePolling} $color="#10b981">
                        {isActivePolling ? t('common:status.live', 'Live') : t('common:status.idle', 'Idle')}
                    </LiveIndicator>
                )}
                actions={(
                    <HeaderMeta>
                        <Text className="text-mono" type="secondary" style={{ fontSize: 12 }}>
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
                )}
            />
        </HeaderShell>
    );
};
