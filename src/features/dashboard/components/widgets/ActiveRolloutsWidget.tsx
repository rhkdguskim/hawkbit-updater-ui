import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Skeleton, Progress, Tag, Button, Tooltip, Modal, message } from 'antd';
import {
    RocketOutlined,
    SyncOutlined,
    PauseCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    PlayCircleOutlined,
    CaretRightOutlined,
    FileTextOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
} from '@ant-design/icons';
import { AirportSlideList } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import { useResume, usePause, useStart, useGetRollout } from '@/api/generated/rollouts/rollouts';
import { useQueryClient } from '@tanstack/react-query';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';
import { RolloutDrilldown } from './RolloutDrilldown';

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
    running: 'var(--ant-color-primary)',
    paused: 'var(--ant-color-warning)',
    scheduled: 'var(--ant-color-info)',
};

const ActivityItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
    cursor: pointer;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%);
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;
    gap: 8px;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: linear-gradient(135deg, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.6) 100%);
        border: 1px solid rgba(255, 255, 255, 0.03);
    }
`;

const ListBody = styled.div`
    flex: 1;
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const ProgressSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const StatusCounts = styled(Flex)`
    gap: 12px;
    font-size: 10px;
`;

const StatusCount = styled.span<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 3px;
    color: ${props => props.$color};
`;

const ActionButtons = styled(Flex)`
    gap: 4px;
    margin-top: 4px;
`;

interface ActiveRolloutsWidgetProps {
    isLoading: boolean;
    activeRollouts: MgmtRolloutResponseBody[];
    isAdmin?: boolean;
    onCreateClick?: () => void;
}

const getFinishedCount = (rollout: MgmtRolloutResponseBody) => {
    const stats = rollout.totalTargetsPerStatus || {};
    return stats.finished || stats.success || stats.SUCCESS || stats.PROCEEDED || 0;
};

const getRunningCount = (rollout: MgmtRolloutResponseBody) => {
    const stats = rollout.totalTargetsPerStatus || {};
    return stats.running || stats.started || stats.STARTED || stats.PROCEEDING || stats.IN_PROGRESS || 0;
};

const getErrorCount = (rollout: MgmtRolloutResponseBody) => {
    const stats = rollout.totalTargetsPerStatus || {};
    return stats.error || stats.failed || stats.ERROR || stats.FAILED || stats.CANCELED || 0;
};

const getRolloutProgress = (rollout: MgmtRolloutResponseBody) => {
    if (rollout.status === 'finished') return 100;
    const total = rollout.totalTargets || 0;
    const finished = getFinishedCount(rollout);
    if (!total) return 0;
    return Math.round((finished / total) * 100);
};

interface ActiveRolloutItemProps {
    rollout: MgmtRolloutResponseBody;
    isAdmin: boolean;
    onAction: (e: React.MouseEvent, action: 'resume' | 'pause' | 'start', rollout: MgmtRolloutResponseBody) => void;
    onShowGroups: (id: number) => void;
    confirmModalRolloutId?: number;
    actionsPending: {
        isResuming: boolean;
        isPausing: boolean;
        isStarting: boolean;
    };
}

const ActiveRolloutItem: React.FC<ActiveRolloutItemProps> = ({
    rollout: initialRollout,
    isAdmin,
    onAction,
    onShowGroups,
    confirmModalRolloutId,
    actionsPending,
}) => {
    const { t } = useTranslation(['dashboard', 'rollouts', 'common']);
    const navigate = useNavigate();

    // Aggressive individual polling for real-time progress updates (500ms)
    const activeStatuses = ['running', 'starting', 'creating', 'paused', 'waiting_for_approval', 'scheduled', 'ready'];
    const isActive = activeStatuses.includes(initialRollout.status?.toLowerCase() || '');
    const { data: polledRollout } = useGetRollout(initialRollout.id, {
        query: {
            enabled: !!initialRollout.id && isActive,
            refetchInterval: 1000,
            staleTime: 0,
            gcTime: 0,
        }
    });

    const rollout = polledRollout || initialRollout;
    const progress = getRolloutProgress(rollout);
    const finished = getFinishedCount(rollout);
    const running = getRunningCount(rollout);
    const error = getErrorCount(rollout);
    const total = rollout.totalTargets || 0;

    const getStatusLabel = (status?: string) => {
        if (!status) return 'Unknown';
        return t(`common:status.${status.toLowerCase()}`, { defaultValue: status.toUpperCase() });
    };

    return (
        <ActivityItem onClick={() => navigate(`/rollouts/${rollout.id}`)}>
            {/* Header Row */}
            <Flex justify="space-between" align="center">
                <Flex align="center" gap={8} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: rollout.status === 'running'
                            ? 'rgba(var(--ant-color-primary-rgb), 0.15)'
                            : rollout.status === 'paused'
                                ? 'rgba(var(--ant-color-warning-rgb), 0.15)'
                                : 'rgba(var(--ant-color-info-rgb), 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {rollout.status === 'running' ? (
                            <SyncOutlined spin style={{ fontSize: 12, color: ROLLOUT_COLORS.running }} />
                        ) : rollout.status === 'paused' ? (
                            <PauseCircleOutlined style={{ fontSize: 12, color: ROLLOUT_COLORS.paused }} />
                        ) : (
                            <ClockCircleOutlined style={{ fontSize: 12, color: ROLLOUT_COLORS.scheduled }} />
                        )}
                    </div>
                    <Tooltip title={rollout.name}>
                        <Text strong style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rollout.name}
                        </Text>
                    </Tooltip>
                </Flex>
                <Tag color={statusColorMap[rollout.status || ''] || 'default'} style={{ margin: 0, fontSize: 9, borderRadius: 999, padding: '0 6px' }}>
                    {getStatusLabel(rollout.status)}
                </Tag>
            </Flex>

            {/* Progress Section */}
            <ProgressSection>
                <Flex justify="space-between" align="center">
                    <Text type="secondary" style={{ fontSize: 10 }}>
                        {t('dashboard:activeRollouts.progress')}: {progress}% ({finished}/{total})
                    </Text>
                    {rollout.totalGroups && (
                        <Text type="secondary" style={{ fontSize: 10 }}>
                            {t('dashboard:activeRollouts.groupProgress', {
                                current: Math.min(rollout.totalGroups, Math.ceil((finished / total) * rollout.totalGroups) || 1),
                                total: rollout.totalGroups
                            })}
                        </Text>
                    )}
                </Flex>
                <Progress
                    percent={progress}
                    showInfo={false}
                    size="small"
                    strokeColor={
                        rollout.status === 'running' ? ROLLOUT_COLORS.running :
                            rollout.status === 'paused' ? ROLLOUT_COLORS.paused :
                                'var(--ant-color-text-quaternary)'
                    }
                />
                <StatusCounts>
                    <StatusCount $color="#10b981">
                        <CheckCircleFilled /> {finished}
                    </StatusCount>
                    <StatusCount $color="var(--ant-color-primary)">
                        <SyncOutlined /> {running}
                    </StatusCount>
                    <StatusCount $color="#ef4444">
                        <CloseCircleFilled /> {error}
                    </StatusCount>
                </StatusCounts>
            </ProgressSection>

            {/* Action Buttons */}
            <ActionButtons justify="flex-end">
                {isAdmin && rollout.status === 'paused' && (
                    <Tooltip title={t('dashboard:activeRollouts.resume')}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CaretRightOutlined />}
                            loading={actionsPending.isResuming && confirmModalRolloutId === rollout.id}
                            onClick={(e) => onAction(e, 'resume', rollout)}
                        >
                            {t('dashboard:activeRollouts.resume')}
                        </Button>
                    </Tooltip>
                )}
                {isAdmin && rollout.status === 'running' && (
                    <Tooltip title={t('dashboard:activeRollouts.pause')}>
                        <Button
                            size="small"
                            icon={<PauseCircleOutlined />}
                            loading={actionsPending.isPausing && confirmModalRolloutId === rollout.id}
                            onClick={(e) => onAction(e, 'pause', rollout)}
                        >
                            {t('dashboard:activeRollouts.pause')}
                        </Button>
                    </Tooltip>
                )}
                {isAdmin && (rollout.status === 'ready' || rollout.status === 'scheduled') && (
                    <Tooltip title={t('dashboard:activeRollouts.start')}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlayCircleOutlined />}
                            loading={actionsPending.isStarting && confirmModalRolloutId === rollout.id}
                            onClick={(e) => onAction(e, 'start', rollout)}
                        >
                            {t('dashboard:activeRollouts.start')}
                        </Button>
                    </Tooltip>
                )}
                <Tooltip title={t('dashboard:activeRollouts.groups')}>
                    <Button
                        size="small"
                        icon={<CaretRightOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (rollout.id) onShowGroups(rollout.id);
                        }}
                    >
                        {t('dashboard:activeRollouts.groups')}
                    </Button>
                </Tooltip>
                <Tooltip title={t('dashboard:activeRollouts.details')}>
                    <Button
                        type="text"
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rollouts/${rollout.id}`);
                        }}
                    />
                </Tooltip>
            </ActionButtons>
        </ActivityItem>
    );
};

export const ActiveRolloutsWidget: React.FC<ActiveRolloutsWidgetProps> = ({
    isLoading,
    activeRollouts,
    isAdmin = false,
    onCreateClick,
}) => {
    const { t } = useTranslation(['dashboard', 'rollouts', 'common']);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmModal, setConfirmModal] = useState<{
        visible: boolean;
        action: 'resume' | 'pause' | 'start' | null;
        rollout: MgmtRolloutResponseBody | null;
    }>({ visible: false, action: null, rollout: null });
    const [expandedRolloutId, setExpandedRolloutId] = useState<number | null>(null);

    // Mutations
    const { mutate: resumeRollout, isPending: isResuming } = useResume({
        mutation: {
            onSuccess: () => {
                message.success(t('rollouts:actions.resumeSuccess'));
                queryClient.invalidateQueries({ queryKey: ['/rest/v1/rollouts'] });
                setConfirmModal({ visible: false, action: null, rollout: null });
            },
            onError: () => {
                message.error(t('rollouts:actions.resumeError'));
            },
        },
    });

    const { mutate: pauseRollout, isPending: isPausing } = usePause({
        mutation: {
            onSuccess: () => {
                message.success(t('rollouts:actions.pauseSuccess'));
                queryClient.invalidateQueries({ queryKey: ['/rest/v1/rollouts'] });
                setConfirmModal({ visible: false, action: null, rollout: null });
            },
            onError: () => {
                message.error(t('rollouts:actions.pauseError'));
            },
        },
    });

    const { mutate: startRollout, isPending: isStarting } = useStart({
        mutation: {
            onSuccess: () => {
                message.success(t('rollouts:actions.startSuccess'));
                queryClient.invalidateQueries({ queryKey: ['/rest/v1/rollouts'] });
                setConfirmModal({ visible: false, action: null, rollout: null });
            },
            onError: () => {
                message.error(t('rollouts:actions.startError'));
            },
        },
    });

    const executeAction = () => {
        if (!confirmModal.rollout?.id || !confirmModal.action) return;

        switch (confirmModal.action) {
            case 'resume':
                resumeRollout({ rolloutId: confirmModal.rollout.id });
                break;
            case 'pause':
                pauseRollout({ rolloutId: confirmModal.rollout.id });
                break;
            case 'start':
                startRollout({ rolloutId: confirmModal.rollout.id });
                break;
        }
    };

    const getConfirmTitle = () => {
        switch (confirmModal.action) {
            case 'resume': return t('dashboard:activeRollouts.confirmResume');
            case 'pause': return t('dashboard:activeRollouts.confirmPause');
            case 'start': return t('dashboard:activeRollouts.confirmResume');
            default: return '';
        }
    };

    const getConfirmMessage = () => {
        const name = confirmModal.rollout?.name || '';
        const count = confirmModal.rollout?.totalTargets || 0;
        switch (confirmModal.action) {
            case 'resume':
            case 'start':
                return t('dashboard:activeRollouts.confirmResumeMessage', { name, count });
            case 'pause':
                return t('dashboard:activeRollouts.confirmPauseMessage', { name });
            default:
                return '';
        }
    };

    return (
        <>
            <ListCard
                $theme="rollouts"
                title={
                    <Flex align="center" gap={10}>
                        <IconBadge $theme="rollouts">
                            <RocketOutlined />
                        </IconBadge>
                        <Flex vertical gap={0}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{t('rollouts:overview.activeRollouts')}</span>
                            <Text type="secondary" style={{ fontSize: 11 }}>{t('rollouts:overview.activeCount', { count: activeRollouts.length })}</Text>
                        </Flex>
                    </Flex>
                }
                extra={
                    <Button type="link" size="small" onClick={() => navigate('/rollouts')}>
                        {t('rollouts:overview.viewAll')}
                    </Button>
                }
                $delay={7}
            >
                {isLoading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : activeRollouts.length > 0 ? (
                    <ListBody>
                        <AirportSlideList
                            items={activeRollouts}
                            itemHeight={150}
                            visibleCount={1}
                            scrollSpeed={30}
                            fullHeight={true}
                            renderItem={(rollout: MgmtRolloutResponseBody) => (
                                <ActiveRolloutItem
                                    key={rollout.id}
                                    rollout={rollout}
                                    isAdmin={isAdmin}
                                    onAction={(e, action, r) => {
                                        e.stopPropagation();
                                        setConfirmModal({ visible: true, action, rollout: r });
                                    }}
                                    onShowGroups={(id) => setExpandedRolloutId(id)}
                                    confirmModalRolloutId={confirmModal.rollout?.id}
                                    actionsPending={{
                                        isResuming,
                                        isPausing,
                                        isStarting
                                    }}
                                />
                            )}
                        />
                    </ListBody>
                ) : (
                    <Flex vertical justify="center" align="center" gap={12} style={{ flex: 1 }}>
                        <RocketOutlined style={{ fontSize: 32, color: 'var(--ant-color-text-quaternary)' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>{t('rollouts:overview.noActiveRollouts')}</Text>
                        {isAdmin && onCreateClick && (
                            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onCreateClick}>
                                {t('rollouts:overview.createRollout')}
                            </Button>
                        )}
                    </Flex>
                )}
            </ListCard>

            {/* Confirmation Modal */}
            <Modal
                open={confirmModal.visible}
                title={getConfirmTitle()}
                onCancel={() => setConfirmModal({ visible: false, action: null, rollout: null })}
                onOk={executeAction}
                okText={confirmModal.action === 'pause' ? t('dashboard:activeRollouts.pause') : t('dashboard:activeRollouts.resume')}
                okButtonProps={{
                    loading: isResuming || isPausing || isStarting,
                    danger: confirmModal.action === 'pause',
                }}
                cancelText={t('common:actions.cancel')}
            >
                <Flex vertical gap={12}>
                    <Text strong>"{confirmModal.rollout?.name}"</Text>
                    <Text>{getConfirmMessage()}</Text>
                </Flex>
            </Modal>

            {/* Drilldown Modal */}
            <Modal
                open={expandedRolloutId !== null}
                title={t('dashboard:activeRollouts.details')}
                onCancel={() => setExpandedRolloutId(null)}
                footer={null}
                width={600}
                styles={{ body: { padding: 0 } }}
            >
                {expandedRolloutId && (
                    <RolloutDrilldown
                        rolloutId={expandedRolloutId}
                        isExpanded={expandedRolloutId !== null}
                    />
                )}
            </Modal>
        </>
    );
};

export default ActiveRolloutsWidget;
