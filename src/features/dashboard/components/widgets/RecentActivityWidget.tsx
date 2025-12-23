import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Skeleton, Flex, Typography, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ActionTimeline, StatusTag, AirportSlideList } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import type { MgmtTarget, MgmtAction } from '@/api/generated/model';
import { useGetAction1 } from '@/api/generated/actions/actions';
import {
    SyncOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface RecentActivityItem {
    target: MgmtTarget;
    action: MgmtAction;
}

interface RecentActivityWidgetProps {
    isLoading: boolean;
    data: RecentActivityItem[];
}

// Animations
const fadeInSlide = keyframes`
    from {
        opacity: 0;
        transform: translateX(-8px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

// Styled Components
const ActivityRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%);
    border-bottom: 1px solid rgba(0,0,0,0.03);
    transition: all 0.2s ease;
    animation: ${fadeInSlide} 0.3s ease-out;

    &:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(255,255,255,0) 100%);
    }
`;







// Row Component that handles data fetching
const RecentActivityRow = ({ record, onClick }: { record: RecentActivityItem; onClick: () => void }) => {

    // Fetch latest details if action is active
    const isActive = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading'].includes(record.action.status?.toLowerCase() || '');
    const { data: fetchedAction } = useGetAction1(
        record.action.id!,
        {
            query: {
                enabled: !!record.action.id && isActive,
                refetchInterval: 2000,
                staleTime: 0
            }
        }
    );

    // Use fetched action if available, otherwise fallback to record.action
    const displayAction = fetchedAction || record.action;

    // Also extract message for the text display
    const messages = (displayAction as any).messages as string[] | undefined;
    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : undefined;
    const displayStatus = lastMessage || displayAction.detailStatus || displayAction.status;

    return (
        <ActivityRow onClick={onClick}>
            <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                {/* Device Icon */}
                <div style={{ position: 'relative' }}>
                    <IconBadge $theme="action">
                        <ThunderboltOutlined style={{ color: '#ffffff', fontSize: 14 }} />
                    </IconBadge>
                    {(['running', 'retrieving', 'retrieved', 'downloading'].includes(displayAction.status?.toLowerCase() || '')) && (
                        <div style={{ position: 'absolute', bottom: -4, right: -4 }}>
                            <StatusTag status="running" style={{ width: 10, height: 10, padding: 0 }} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Flex justify="space-between" align="center">
                        <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                            {record.target.name || record.target.controllerId}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {record.action.createdAt ? dayjs(record.action.createdAt).fromNow(true) : ''}
                        </Text>
                    </Flex>
                    <Flex align="center" gap={6}>
                        {record.target.targetTypeName && (
                            <Tag bordered={false} style={{ margin: 0, fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                                {record.target.targetTypeName}
                            </Tag>
                        )}
                        <Text type="secondary" style={{
                            fontSize: 11,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 160
                        }}>
                            {displayStatus}
                        </Text>
                    </Flex>
                </Flex>
            </Flex>

            {/* Timeline */}
            <div style={{ flexShrink: 0, marginLeft: 8 }}>
                <ActionTimeline action={displayAction} />
            </div>
        </ActivityRow>
    );
};

import { useNavigate } from 'react-router-dom';

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const navigate = useNavigate();

    return (
        <ListCard
            $theme="activity"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="activity">
                        <SyncOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('recentActivities.title')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{t('recentActivities.inProgress', { count: data.length })}</Text>
                    </Flex>
                </Flex>
            }
            $delay={9}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : data && data.length > 0 ? (
                <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <AirportSlideList
                        items={data}
                        itemHeight={72}
                        visibleCount={4}
                        interval={4000}
                        fullHeight={true}
                        renderItem={(item: RecentActivityItem) => (
                            <RecentActivityRow
                                key={item.action.id || item.target.controllerId}
                                record={item}
                                onClick={() => navigate(`/actions/${item.action.id}`)}
                            />
                        )}
                    />
                </div>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ListCard>
    );
};
