import React, { useMemo, useCallback } from 'react';
import { Timeline, Typography, Tag, Space, Empty } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { IconBadge } from '../shared/CommonStyles';
import type { MgmtActionStatus } from '@/api/generated/model';
import { getStatusLabel, translateStatusMessage } from '@/utils/statusUtils';

const { Text } = Typography;

const LogContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: var(--ant-border-radius, 8px);
    padding: var(--ant-padding-sm, 12px);
    margin-top: var(--ant-margin-xs, 8px);
    font-family: var(--font-mono);
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text);
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid var(--ant-color-border-secondary);
`;

const LogLine = styled.div`
    line-height: 1.6;
    display: flex;
    gap: var(--ant-margin-xs, 8px);
    white-space: pre-wrap;
    word-break: break-all;
    
    &::before {
        content: '>';
        color: var(--ant-color-text-tertiary);
        flex-shrink: 0;
    }
`;

const TimelineContainer = styled.div`
    padding: var(--ant-padding-xs, 8px) var(--ant-padding-xxs, 4px);
`;

const StepContent = styled.div`
    width: 100%;
    margin-bottom: var(--ant-margin, 16px);
`;

const StepHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const StepTitle = styled(Text)`
    font-size: var(--ant-font-size);
    font-weight: 600;
`;

const StepTime = styled(Text)`
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-quaternary);
`;



const StatusCodeTag = styled(Tag)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

interface ActionStatusTimelineProps {
    statuses: MgmtActionStatus[] | undefined;
    emptyText?: string;
}

export const ActionStatusTimeline: React.FC<ActionStatusTimelineProps> = ({ statuses, emptyText }) => {
    const { t } = useTranslation(['actions', 'common']);

    const getStatusLabelLocal = useCallback((status?: string) => {
        return getStatusLabel(status, t);
    }, [t]);

    const getStatusTone = (status?: string, code?: number) => {
        const normalized = status?.toLowerCase() || '';
        if (normalized.includes('error') || normalized.includes('failed') || (code && code >= 400)) {
            return 'error';
        }
        if (normalized.includes('finished') || normalized.includes('success')) {
            return 'success';
        }
        if (normalized.includes('running') || normalized.includes('processing') || normalized.includes('retrieving')) {
            return 'processing';
        }
        if (normalized.includes('pending') || normalized.includes('waiting')) {
            return 'warning';
        }
        return 'default';
    };

    const getToneColor = (tone: string) => {
        switch (tone) {
            case 'error': return 'var(--ant-color-error)';
            case 'success': return 'var(--ant-color-success)';
            case 'processing': return 'var(--ant-color-info)';
            case 'warning': return 'var(--ant-color-warning)';
            default: return 'var(--ant-color-text-quaternary)';
        }
    };

    const translateMessage = useCallback((message: string) => {
        return translateStatusMessage(message, t);
    }, [t]);

    const timelineItems = useMemo(() => {
        if (!statuses?.length) return [];

        return [...statuses]
            .sort((a, b) => (b.reportedAt || b.timestamp || 0) - (a.reportedAt || a.timestamp || 0))
            .map((status) => {
                const tone = getStatusTone(status.type, status.code);
                const color = getToneColor(tone);
                const icon = tone === 'error' ? <CloseCircleOutlined /> :
                    tone === 'success' ? <CheckCircleOutlined /> :
                        tone === 'processing' ? <SyncOutlined spin /> : <ClockCircleOutlined />;

                return {
                    dot: (
                        <IconBadge
                            $status={tone === 'processing' ? 'info' : (tone as any)}
                            $size={24}
                            style={{ boxShadow: 'var(--shadow-sm)' }}
                        >
                            {icon}
                        </IconBadge>
                    ),
                    children: (
                        <StepContent>
                            <StepHeader>
                                <Space align="center" size="small">
                                    <StepTitle>{getStatusLabelLocal(status.type)}</StepTitle>
                                    {status.code !== undefined && (
                                        <StatusCodeTag bordered={false}>{t('actions:statusCode', { code: status.code })}</StatusCodeTag>
                                    )}
                                </Space>
                                <StepTime>
                                    {status.reportedAt || status.timestamp
                                        ? dayjs(status.reportedAt || status.timestamp).format('HH:mm:ss')
                                        : '-'}
                                </StepTime>
                            </StepHeader>

                            {status.messages?.length ? (
                                <LogContainer>
                                    {status.messages.map((message, index) => (
                                        <LogLine key={`${status.id}-${index}`}>
                                            {translateMessage(message)}
                                        </LogLine>
                                    ))}
                                </LogContainer>
                            ) : null}
                        </StepContent>
                    ),
                };
            });
    }, [statuses, t, getStatusLabel, translateStatusMessage]);

    if (!statuses?.length) {
        return <Empty description={emptyText || t('actions:statusHistoryEmpty')} />;
    }

    return (
        <TimelineContainer>
            <Timeline items={timelineItems} />
        </TimelineContainer>
    );
};
