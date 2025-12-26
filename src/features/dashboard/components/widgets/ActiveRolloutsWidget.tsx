import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, Progress, Tag, Button } from 'antd';
import {
    RocketOutlined,
    SyncOutlined,
    PauseCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { AirportSlideList } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';

const { Text } = Typography;

const statusColorMap: Record<string, string> = {
    running: 'blue',
    ready: 'cyan',
    paused: 'orange',
    finished: 'green',
    error: 'red',
    scheduled: 'purple',
};

const ROLLOUT_COLORS = {
    running: '#3b82f6',
    paused: '#f59e0b',
    scheduled: '#8b5cf6',
};

const ActivityItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%);
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
        transform: translateX(2px);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: linear-gradient(135deg, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.6) 100%);
        border: 1px solid rgba(255, 255, 255, 0.03);
    }
`;

interface ActiveRolloutsWidgetProps {
    isLoading: boolean;
    activeRollouts: MgmtRolloutResponseBody[];
    isAdmin?: boolean;
    onCreateClick?: () => void;
}

export const ActiveRolloutsWidget: React.FC<ActiveRolloutsWidgetProps> = ({
    isLoading,
    activeRollouts,
    isAdmin = false,
    onCreateClick,
}) => {
    const { t } = useTranslation(['rollouts', 'common']);
    const navigate = useNavigate();

    const getStatusLabel = (status?: string) => {
        if (!status) return 'Unknown';
        return t(`common:status.${status.toLowerCase()}`, { defaultValue: status.toUpperCase() });
    };

    const getRolloutProgress = (rollout: MgmtRolloutResponseBody) => {
        if (rollout.status === 'finished') return 100;
        const total = rollout.totalTargets || 0;
        const finished = rollout.totalTargetsPerStatus?.finished || 0;
        if (!total) return 0;
        return Math.round((finished / total) * 100);
    };

    return (
        <ListCard
            $theme="rollout"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="rollout">
                        <RocketOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('overview.activeRollouts', 'Active Rollouts')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{activeRollouts.length} active</Text>
                    </Flex>
                </Flex>
            }
            extra={
                <Button type="link" size="small" onClick={() => navigate('/rollouts')}>
                    {t('overview.viewAll', 'View All')}
                </Button>
            }
            $delay={7}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : activeRollouts.length > 0 ? (
                <div style={{ flex: 1, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <AirportSlideList
                        items={activeRollouts}
                        itemHeight={56}
                        visibleCount={4}
                        scrollSpeed={25}
                        fullHeight={true}
                        renderItem={(rollout: MgmtRolloutResponseBody) => (
                            <ActivityItem key={rollout.id} onClick={() => navigate(`/rollouts/${rollout.id}`)}>
                                <Flex align="center" gap={12} style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: rollout.status === 'running'
                                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
                                            : rollout.status === 'paused'
                                                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
                                                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {rollout.status === 'running' ? (
                                            <SyncOutlined spin style={{ fontSize: 14, color: ROLLOUT_COLORS.running }} />
                                        ) : rollout.status === 'paused' ? (
                                            <PauseCircleOutlined style={{ fontSize: 14, color: ROLLOUT_COLORS.paused }} />
                                        ) : (
                                            <ClockCircleOutlined style={{ fontSize: 14, color: ROLLOUT_COLORS.scheduled }} />
                                        )}
                                    </div>
                                    <Flex vertical gap={0} style={{ flex: 1, minWidth: 0 }}>
                                        <Flex align="center" gap={6}>
                                            <Text strong style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {rollout.name}
                                            </Text>
                                            <Tag color={statusColorMap[rollout.status || ''] || 'default'} style={{ margin: 0, fontSize: 9, borderRadius: 999, padding: '0 4px' }}>
                                                {getStatusLabel(rollout.status)}
                                            </Tag>
                                        </Flex>
                                        <Text type="secondary" style={{ fontSize: 10 }}>
                                            {rollout.totalTargets || 0} targets
                                        </Text>
                                    </Flex>
                                </Flex>
                                <Progress
                                    type="circle"
                                    percent={getRolloutProgress(rollout)}
                                    size={36}
                                    strokeColor={
                                        rollout.status === 'running' ? ROLLOUT_COLORS.running :
                                            rollout.status === 'paused' ? ROLLOUT_COLORS.paused :
                                                '#cbd5e1'
                                    }
                                    strokeWidth={8}
                                />
                            </ActivityItem>
                        )}
                    />
                </div>
            ) : (
                <Flex vertical justify="center" align="center" gap={12} style={{ flex: 1 }}>
                    <RocketOutlined style={{ fontSize: 32, color: '#94a3b8' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>{t('overview.noActiveRollouts', 'No active rollouts')}</Text>
                    {isAdmin && onCreateClick && (
                        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onCreateClick}>
                            {t('overview.createRollout', 'Create')}
                        </Button>
                    )}
                </Flex>
            )}
        </ListCard>
    );
};

export default ActiveRolloutsWidget;
