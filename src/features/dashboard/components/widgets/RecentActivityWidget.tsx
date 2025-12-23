import React, { useMemo } from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { SyncOutlined } from '@ant-design/icons';
import { ActiveUpdatesCard } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import type { MgmtTarget, MgmtAction } from '@/api/generated/model';

const { Text } = Typography;

interface RecentActivityItem {
    target: MgmtTarget;
    action: MgmtAction;
}

interface RecentActivityWidgetProps {
    isLoading: boolean;
    data: RecentActivityItem[];
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);

    // Transform data for ActiveUpdatesCard
    const activeUpdateItems = useMemo(() => {
        return data.map(item => ({
            action: item.action,
            targetName: item.target.name,
            controllerId: item.target.controllerId,
        }));
    }, [data]);

    return (
        <ListCard
            $theme="activity"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="activity">
                        <SyncOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('activeUpdates.title')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{t('recentActivities.inProgress', { count: data.length })}</Text>
                    </Flex>
                </Flex>
            }
            $delay={9}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
                <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <ActiveUpdatesCard
                        items={activeUpdateItems}
                        isLoading={false}
                        showHistory={true}
                        emptyText={t('activeUpdates.empty')}
                    />
                </div>
            )}
        </ListCard>
    );
};
