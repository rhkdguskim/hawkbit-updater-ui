import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Progress, Spin, Tag, Tooltip, Empty } from 'antd';
import {
    CheckCircleFilled,
    SyncOutlined,
    PauseCircleFilled,
    CloseCircleFilled,
    ClockCircleOutlined,
    TeamOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { useGetRolloutGroups } from '@/api/generated/rollouts/rollouts';
import type { MgmtRolloutGroupResponseBody } from '@/api/generated/model';

const { Text } = Typography;

const DrilldownContainer = styled.div`
    padding: 8px 0;
    border-top: 1px solid var(--ant-color-border-secondary);
    background: linear-gradient(
        135deg,
        rgba(var(--ant-color-primary-rgb), 0.02) 0%,
        rgba(var(--ant-color-primary-rgb), 0.05) 100%
    );
    border-radius: 0 0 12px 12px;
    max-height: 280px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-border);
        border-radius: 4px;
    }
`;

const GroupItem = styled.div<{ $clickable?: boolean }>`
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin: 4px 8px;
    border-radius: 8px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    transition: all 0.2s ease;
    cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

    &:hover {
        ${({ $clickable }) =>
        $clickable &&
        `
            background: var(--ant-color-bg-container-hover);
            transform: translateX(2px);
            border-color: var(--ant-color-primary-border);
        `}
    }
`;

const GroupIcon = styled.div<{ $status?: string }>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;

    ${({ $status }) => {
        switch ($status) {
            case 'finished':
                return `
                    background: rgba(var(--ant-green-rgb), 0.1);
                    color: var(--ant-color-success);
                `;
            case 'running':
                return `
                    background: rgba(var(--ant-blue-rgb), 0.1);
                    color: var(--ant-color-primary);
                `;
            case 'paused':
                return `
                    background: rgba(var(--ant-orange-rgb), 0.1);
                    color: var(--ant-color-warning);
                `;
            case 'error':
                return `
                    background: rgba(var(--ant-red-rgb), 0.1);
                    color: var(--ant-color-error);
                `;
            default:
                return `
                    background: var(--ant-color-fill-quaternary);
                    color: var(--ant-color-text-quaternary);
                `;
        }
    }}
`;

const GroupContent = styled.div`
    flex: 1;
    min-width: 0;
    margin-left: 10px;
`;

const GroupStats = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--ant-color-text-secondary);
`;

interface RolloutDrilldownProps {
    rolloutId: number;
    isExpanded: boolean;
}

const getStatusIcon = (status?: string) => {
    switch (status) {
        case 'finished':
            return <CheckCircleFilled />;
        case 'running':
            return <SyncOutlined spin />;
        case 'paused':
            return <PauseCircleFilled />;
        case 'error':
            return <CloseCircleFilled />;
        default:
            return <ClockCircleOutlined />;
    }
};

const getStatusColor = (status?: string): string => {
    switch (status) {
        case 'finished':
            return 'green';
        case 'running':
            return 'blue';
        case 'paused':
            return 'orange';
        case 'error':
            return 'red';
        default:
            return 'default';
    }
};

export const RolloutDrilldown: React.FC<RolloutDrilldownProps> = ({ rolloutId, isExpanded }) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const navigate = useNavigate();

    const { data: groupsData, isLoading } = useGetRolloutGroups(
        rolloutId,
        { limit: 20 },
        {
            query: {
                enabled: isExpanded && !!rolloutId,
                staleTime: 0,
                refetchInterval: 2000,
            },
        }
    );

    const groups = groupsData?.content || [];

    const getFinishedCount = (group: MgmtRolloutGroupResponseBody) => {
        const stats = group.totalTargetsPerStatus || {};
        // Support various key formats from HawkBit and simulator
        return stats.finished || stats.success || stats.SUCCESS || stats.PROCEEDED || 0;
    };

    const getGroupProgress = (group: MgmtRolloutGroupResponseBody) => {
        const total = group.totalTargets || 0;
        const finished = getFinishedCount(group);
        if (!total) return 0;
        return Math.round((finished / total) * 100);
    };

    const getErrorCount = (group: MgmtRolloutGroupResponseBody) => {
        const stats = group.totalTargetsPerStatus || {};
        return stats.error || stats.failed || stats.ERROR || stats.FAILED || stats.CANCELED || 0;
    };

    const handleGroupClick = (group: MgmtRolloutGroupResponseBody) => {
        // Navigate to rollout detail with group filter
        navigate(`/rollouts/${rolloutId}?groupId=${group.id}`);
    };

    if (!isExpanded) return null;

    if (isLoading) {
        return (
            <DrilldownContainer>
                <Flex justify="center" align="center" style={{ padding: '24px 0' }}>
                    <Spin size="small" />
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        {t('drilldown.loading')}
                    </Text>
                </Flex>
            </DrilldownContainer>
        );
    }

    if (!groups.length) {
        return (
            <DrilldownContainer>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('drilldown.noGroups')}
                    style={{ padding: '16px 0' }}
                />
            </DrilldownContainer>
        );
    }

    return (
        <DrilldownContainer>
            {groups.map((group, index) => {
                const progress = getGroupProgress(group);
                const errorCount = getErrorCount(group);
                const isClickable = group.status === 'running' || group.status === 'finished' || group.status === 'error';

                return (
                    <GroupItem
                        key={group.id}
                        $clickable={isClickable}
                        onClick={() => isClickable && handleGroupClick(group)}
                    >
                        <GroupIcon $status={group.status}>
                            {getStatusIcon(group.status)}
                        </GroupIcon>
                        <GroupContent>
                            <Flex align="center" gap={6}>
                                <Text strong style={{ fontSize: 12 }}>
                                    {t('drilldown.groupLabel', { number: index + 1 })}: {group.name}
                                </Text>
                                <Tag
                                    color={getStatusColor(group.status)}
                                    style={{
                                        margin: 0,
                                        fontSize: 10,
                                        borderRadius: 4,
                                        padding: '0 4px',
                                        lineHeight: '16px',
                                    }}
                                >
                                    {t(`common:status.${group.status?.toLowerCase() || 'unknown'}`)}
                                </Tag>
                            </Flex>
                            {(group.status === 'running' || group.status === 'finished' || group.status === 'error') && (
                                <Progress
                                    percent={group.status === 'finished' ? 100 : progress}
                                    size="small"
                                    strokeColor={
                                        group.status === 'error'
                                            ? 'var(--ant-color-error)'
                                            : group.status === 'finished'
                                                ? 'var(--ant-color-success)'
                                                : 'var(--ant-color-primary)'
                                    }
                                    style={{ marginTop: 4 }}
                                    format={() => (
                                        <Text style={{ fontSize: 10 }}>
                                            {getFinishedCount(group)}/{group.totalTargets || 0}
                                        </Text>
                                    )}
                                />
                            )}
                        </GroupContent>
                        <GroupStats>
                            <Tooltip title={t('drilldown.totalTargets')}>
                                <StatItem>
                                    <TeamOutlined />
                                    <span>{group.totalTargets || 0}</span>
                                </StatItem>
                            </Tooltip>
                            {errorCount > 0 && (
                                <Tooltip title={t('drilldown.errors')}>
                                    <StatItem style={{ color: 'var(--ant-color-error)' }}>
                                        <CloseCircleFilled />
                                        <span>{errorCount}</span>
                                    </StatItem>
                                </Tooltip>
                            )}
                            {isClickable && <RightOutlined style={{ fontSize: 10, color: 'var(--ant-color-text-quaternary)' }} />}
                        </GroupStats>
                    </GroupItem>
                );
            })}
        </DrilldownContainer>
    );
};

export default RolloutDrilldown;
