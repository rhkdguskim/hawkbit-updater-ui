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
        background: linear-gradient(135deg, #0f172a 0%, #2563eb 50%, #0891b2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .dark-mode & {
        background: linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #22c55e 100%);
        -webkit-background-clip: text;
        background-clip: text;
    }
`;

const HeaderShell = styled.div`
    padding: clamp(12px, 1.6vw, 20px);
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: 0 16px 36px -28px rgba(15, 23, 42, 0.35);
    backdrop-filter: blur(16px);

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(15, 23, 42, 0.75);
        border-color: rgba(148, 163, 184, 0.2);
        box-shadow: 0 20px 40px -28px rgba(0, 0, 0, 0.65);
    }
`;

const HeaderMeta = styled(Flex)`
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.25);

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(148, 163, 184, 0.12);
        border-color: rgba(148, 163, 184, 0.2);
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
                        <Text type="secondary" style={{ fontSize: 12 }}>
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
