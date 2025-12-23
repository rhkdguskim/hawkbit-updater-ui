import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Skeleton, Flex, Typography, Tooltip, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AirportSlideList } from '@/components/common';
import { ListCard, IconBadge } from '../DashboardStyles';
import type { MgmtTarget, MgmtAction } from '@/api/generated/model';
import { useGetAction1 } from '@/api/generated/actions/actions';
import {
    LoadingOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    SyncOutlined,
    RocketOutlined,
    ThunderboltOutlined,
    WifiOutlined,
    ApiOutlined
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
const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 4px rgba(59, 130, 246, 0.4); }
    50% { box-shadow: 0 0 12px rgba(59, 130, 246, 0.8); }
`;

const progressFlow = keyframes`
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
`;

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

const DeviceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
`;

const DeviceIcon = styled.div<{ $status: 'online' | 'offline' | 'busy' }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    
    background: ${props => {
        switch (props.$status) {
            case 'online': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            case 'busy': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            case 'offline': return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
            default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        }
    }};
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
`;

const DeviceDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
`;

const DeviceName = styled(Text)`
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DeviceMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const IpAddress = styled(Text)`
    font-size: 11px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    color: #6b7280;
`;

const TimeAgo = styled(Text)`
    font-size: 10px;
    color: #9ca3af;
`;

// Timeline Components
const TimelineContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0;
    padding: 4px 8px;
    background: rgba(0,0,0,0.02);
    border-radius: 20px;
`;

const TimelineStep = styled.div<{
    $status: 'pending' | 'active' | 'completed' | 'error';
    $isAnimated?: boolean;
}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
`;

const StepNode = styled.div<{
    $status: 'pending' | 'active' | 'completed' | 'error';
    $size?: 'small' | 'medium';
}>`
    width: ${props => props.$size === 'small' ? '24px' : '28px'};
    height: ${props => props.$size === 'small' ? '24px' : '28px'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.$size === 'small' ? '11px' : '13px'};
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;
    
    ${props => {
        switch (props.$status) {
            case 'completed':
                return css`
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
                `;
            case 'active':
                return css`
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                    animation: ${pulse} 1.5s ease-in-out infinite, ${glow} 2s ease-in-out infinite;
                `;
            case 'error':
                return css`
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                `;
            default:
                return css`
                    background: #e5e7eb;
                    color: #9ca3af;
                    box-shadow: none;
                `;
        }
    }}
`;

const StepConnector = styled.div<{ $active?: boolean; $isAnimated?: boolean }>`
    width: 28px;
    height: 3px;
    border-radius: 2px;
    margin: 0 2px;
    position: relative;
    overflow: hidden;
    
    background: ${props => props.$active
        ? 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #10b981 100%)'
        : '#e5e7eb'};
    
    ${props => props.$isAnimated && css`
        background-size: 200% 100%;
        animation: ${progressFlow} 1.5s linear infinite;
    `}
`;

const StatusBadge = styled(Tag) <{ $variant: 'success' | 'processing' | 'error' | 'default' }>`
    margin: 0;
    border: none;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;
    
    ${props => {
        switch (props.$variant) {
            case 'success':
                return css`
                    background: rgba(16, 185, 129, 0.1);
                    color: #059669;
                `;
            case 'processing':
                return css`
                    background: rgba(59, 130, 246, 0.1);
                    color: #2563eb;
                `;
            case 'error':
                return css`
                    background: rgba(239, 68, 68, 0.1);
                    color: #dc2626;
                `;
            default:
                return css`
                    background: rgba(107, 114, 128, 0.1);
                    color: #6b7280;
                `;
        }
    }}
`;

// Component Logic
const ActionTimeline = ({ action: initialAction }: { action: MgmtAction }) => {
    const { t } = useTranslation('dashboard');

    // Fetch latest details if action is active
    const isActive = ['running', 'pending', 'scheduled', 'retrieving', 'retrieved', 'downloading'].includes(initialAction.status?.toLowerCase() || '');
    const { data: fetchedAction } = useGetAction1(
        initialAction.id!,
        {
            query: {
                enabled: !!initialAction.id && isActive,
                refetchInterval: 2000,
                staleTime: 1000
            }
        }
    );

    const action = fetchedAction || initialAction;
    const status = action.status?.toLowerCase() || '';

    // Extract messages (often not in type definition but present in API response)
    // This contains the real-time feedback from the device (e.g. "Disabling service recovery")
    const messages = (action as any).messages as string[] | undefined;
    const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : undefined;

    // Prioritize last message -> detailStatus -> empty
    const detail = lastMessage || action.detailStatus || '';

    // Determine state based on status and detailStatus
    // If detailStatus has content like "다운로드 중", "업데이트 중", etc., treat as running
    type State = 'pending' | 'scheduled' | 'running' | 'finished' | 'error';
    let state: State = 'pending';

    // First check for error/finished states
    if (['error', 'failed', 'canceled'].includes(status)) {
        state = 'error';
    } else if (['finished'].includes(status)) {
        state = 'finished';
    } else if (['running', 'retrieving', 'retrieved', 'downloading', 'download'].includes(status)) {
        // Explicitly running states
        state = 'running';
    } else if (detail && detail.length > 0 && !['scheduled', 'wait_for_confirmation'].includes(status)) {
        // If there's a detailStatus message, it means activity is happening -> running
        // This handles cases where status is 'pending' but detailStatus shows real progress
        state = 'running';
    } else if (['scheduled', 'pending', 'wait_for_confirmation'].includes(status)) {
        // Waiting states without activity
        state = 'scheduled';
    }

    const getStepStatus = (step: number): 'pending' | 'active' | 'completed' | 'error' => {
        const stateOrder: Record<State, number> = {
            pending: 0,
            scheduled: 1,
            running: 2,
            finished: 3,
            error: 3
        };
        const currentStep = stateOrder[state];

        if (state === 'error' && step === 3) return 'error';
        if (step < currentStep) return 'completed';
        if (step === currentStep) return 'active';
        return 'pending';
    };

    const getTooltip = (step: number) => {
        switch (step) {
            case 1: return t('timeline.queued', 'Queued');
            case 2: {
                // Show the actual detailStatus message from the server directly
                // This contains messages like "Disabling service recovery", "업데이트 프로세스 시작", etc.
                if (state === 'running' && detail) {
                    return detail;
                }
                return t('timeline.processing', 'Processing');
            }
            case 3: return state === 'error' ? t('timeline.failed', 'Failed') : t('timeline.completed', 'Completed');
            default: return '';
        }
    };

    return (
        <TimelineContainer>
            {/* Step 1: Queued */}
            <Tooltip title={getTooltip(1)}>
                <TimelineStep $status={getStepStatus(1)}>
                    <StepNode $status={getStepStatus(1)} $size="small">
                        <RocketOutlined />
                    </StepNode>
                </TimelineStep>
            </Tooltip>

            <StepConnector
                $active={getStepStatus(1) === 'completed' || getStepStatus(2) !== 'pending'}
            />

            {/* Step 2: Processing */}
            <Tooltip title={getTooltip(2)}>
                <TimelineStep $status={getStepStatus(2)}>
                    <StepNode $status={getStepStatus(2)} $size="medium">
                        {getStepStatus(2) === 'active' ? (
                            <SyncOutlined spin />
                        ) : (
                            <ThunderboltOutlined />
                        )}
                    </StepNode>
                </TimelineStep>
            </Tooltip>

            <StepConnector
                $active={getStepStatus(2) === 'completed' || getStepStatus(3) !== 'pending'}
                $isAnimated={getStepStatus(2) === 'active'}
            />

            {/* Step 3: Completed/Error */}
            <Tooltip title={getTooltip(3)}>
                <TimelineStep $status={getStepStatus(3)}>
                    <StepNode $status={getStepStatus(3)} $size="small">
                        {getStepStatus(3) === 'error' ? (
                            <CloseCircleFilled />
                        ) : (
                            <CheckCircleFilled />
                        )}
                    </StepNode>
                </TimelineStep>
            </Tooltip>
        </TimelineContainer>
    );
};

const getDeviceStatus = (target: MgmtTarget, action: MgmtAction): 'online' | 'offline' | 'busy' => {
    const actionStatus = action.status?.toLowerCase() || '';
    if (['running', 'retrieving', 'downloading'].includes(actionStatus)) return 'busy';

    const lastRequest = target.pollStatus?.lastRequestAt;
    if (!lastRequest) return 'offline';

    const isRecent = Date.now() - lastRequest < 5 * 60 * 1000; // 5 minutes
    return isRecent ? 'online' : 'offline';
};

const getStatusBadgeVariant = (status: string): 'success' | 'processing' | 'error' | 'default' => {
    const s = status.toLowerCase();
    if (['finished'].includes(s)) return 'success';
    if (['running', 'retrieving', 'downloading', 'scheduled', 'pending'].includes(s)) return 'processing';
    if (['error', 'failed', 'canceled'].includes(s)) return 'error';
    return 'default';
};

// Row Component that handles data fetching
const RecentActivityRow = ({ record, onClick }: { record: RecentActivityItem; onClick: () => void }) => {
    const { t } = useTranslation('dashboard');

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
                        <div style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '1.5px solid white',
                            boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.2)'
                        }} />
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

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);

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
