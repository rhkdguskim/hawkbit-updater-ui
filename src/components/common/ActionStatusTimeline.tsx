import React, { useMemo } from 'react';
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
import type { MgmtActionStatus } from '@/api/generated/model';

const { Text } = Typography;

const LogContainer = styled.div`
    background: #0d1117;
    border-radius: 6px;
    padding: 12px;
    margin-top: 8px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 12px;
    color: #e6edf3;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogLine = styled.div`
    line-height: 1.6;
    display: flex;
    gap: 8px;
    white-space: pre-wrap;
    word-break: break-all;
    
    &::before {
        content: '>';
        color: #7d8590;
        flex-shrink: 0;
    }
`;

const StepHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const StepTitle = styled(Text)`
    font-size: 14px;
    font-weight: 600;
`;

const StepTime = styled(Text)`
    font-size: 11px;
    color: var(--ant-color-text-quaternary);
`;

const ColoredDot = styled.span<{ $tone: string; $color: string }>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props =>
        props.$tone === 'error' ? 'rgba(239, 68, 68, 0.1)' :
            props.$tone === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                props.$tone === 'processing' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.$color};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

interface ActionStatusTimelineProps {
    statuses: MgmtActionStatus[] | undefined;
    emptyText?: string;
}

export const ActionStatusTimeline: React.FC<ActionStatusTimelineProps> = ({ statuses, emptyText }) => {
    const { t } = useTranslation(['actions', 'common']);

    const getStatusLabel = (status?: string) => {
        if (!status) return t('common:status.unknown');
        const key = status.toLowerCase();
        return t(`common:status.${key}`, { defaultValue: status.toUpperCase() });
    };

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

    const translateStatusMessage = (message: string) => {
        const trimmed = message.trim();
        // Basic translations for common hawkBit messages
        if (/^Update failed, rollback performed$/i.test(trimmed)) return t('statusMessages.updateFailedRollback');
        if (/^Starting services$/i.test(trimmed)) return t('statusMessages.startingServices');
        if (/^Updating binaries$/i.test(trimmed)) return t('statusMessages.updatingBinaries');
        if (/^Downloading artifacts$/i.test(trimmed)) return t('statusMessages.downloadingArtifacts');
        if (/^Verifying services stopped$/i.test(trimmed)) return t('statusMessages.verifyingServicesStopped');
        if (/^Creating backup$/i.test(trimmed)) return t('statusMessages.creatingBackup');
        if (/^Starting update process$/i.test(trimmed)) return t('statusMessages.startingUpdateProcess');
        return message;
    };

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
                    color: tone,
                    dot: <ColoredDot $tone={tone} $color={color}>{icon}</ColoredDot>,
                    children: (
                        <div style={{ width: '100%', marginBottom: 16 }}>
                            <StepHeader>
                                <Space align="center" size={8}>
                                    <StepTitle>{getStatusLabel(status.type)}</StepTitle>
                                    {status.code !== undefined && (
                                        <Tag bordered={false} style={{ fontSize: 10 }}>{t('actions:statusCode', { code: status.code })}</Tag>
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
                                            {translateStatusMessage(message)}
                                        </LogLine>
                                    ))}
                                </LogContainer>
                            ) : null}
                        </div>
                    ),
                };
            });
    }, [statuses, t]);

    if (!statuses?.length) {
        return <Empty description={emptyText || t('actions:statusHistoryEmpty')} />;
    }

    return (
        <div style={{ padding: '8px 4px' }}>
            <Timeline items={timelineItems} />
        </div>
    );
};
