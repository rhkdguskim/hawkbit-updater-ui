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
        background: var(--ant-color-text, linear-gradient(135deg, #1e293b 0%, #475569 100%));
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
                <Flex align="center" gap={8}>
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
                </Flex>
            )}
        />
    );
};
