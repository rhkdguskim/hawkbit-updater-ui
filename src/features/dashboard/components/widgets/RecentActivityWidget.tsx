import React, { useMemo } from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { SyncOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { ActiveUpdatesCard } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import type { MgmtTarget, MgmtAction } from '@/api/generated/model';

const { Text } = Typography;

const ListBody = styled.div`
    flex: 1;
    max-height: 360px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

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
                <ListBody>
                    <ActiveUpdatesCard
                        items={activeUpdateItems}
                        isLoading={false}
                        showHistory={true}
                        emptyText={t('activeUpdates.empty')}
                    />
                </ListBody>
            )}
        </ListCard>
    );
};
