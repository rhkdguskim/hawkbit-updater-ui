import React, { useState, useMemo } from 'react';
import { Button, Modal, Typography, List, Tag, Progress, message, Space, Alert, Result, Tooltip, Badge } from 'antd';
import { ExclamationCircleOutlined, PauseCircleOutlined, WarningOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useGetRollouts, usePause } from '@/api/generated/rollouts/rollouts';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';

const { Text, Title } = Typography;

const EmergencyButton = styled(Button)`
    /* Industrial Emergency Stop Button Style */
    background: var(--ant-color-error); /* Solid red for clarity */
    border: 1px solid #b91c1c;
    box-shadow: 0 4px 0 #991b1b; /* Physical button depth */
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    height: auto;
    padding: 6px 16px;
    border-radius: 4px; /* Sharp corners */
    transition: all 0.1s;
    
    &:hover:not(:disabled) {
        background: #ef4444;
        transform: translateY(2px);
        box-shadow: 0 2px 0 #991b1b;
    }
    
    &:active:not(:disabled) {
        transform: translateY(4px);
        box-shadow: none;
    }

    &:disabled {
        background: var(--ant-color-bg-container-disabled);
        border-color: var(--ant-color-border);
        box-shadow: none;
        color: var(--ant-color-text-disabled);
        transform: none;
    }
`;

const RolloutItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border);
    border-radius: var(--ant-border-radius, 6px);
    margin-bottom: 8px;
`;

const RolloutInfo = styled.div`
    flex: 1;
`;

const StatusIndicator = styled.div<{ $status: 'pending' | 'success' | 'error' }>`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: ${props => {
        switch (props.$status) {
            case 'success': return 'var(--ant-color-success)';
            case 'error': return 'var(--ant-color-error)';
            default: return 'var(--ant-color-primary)';
        }
    }};
`;

interface PauseResult {
    rolloutId: number;
    name: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
}

export interface EmergencyStopButtonProps {
    variant?: 'default' | 'icon' | 'text';
    size?: 'small' | 'middle' | 'large';
}

export const EmergencyStopButton: React.FC<EmergencyStopButtonProps> = ({
    variant = 'default',
    size = 'middle',
}) => {
    const { t } = useTranslation('rollouts');
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [modalOpen, setModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<PauseResult[]>([]);
    const [phase, setPhase] = useState<'confirm' | 'processing' | 'complete'>('confirm');

    // Continuously fetch running rollouts to update button state
    const { data: rolloutData, isLoading, refetch } = useGetRollouts(
        { q: 'status==running', limit: 100 },
        {
            query: {
                staleTime: 5000,
                refetchInterval: 5000,
                refetchOnWindowFocus: true
            }
        }
    );

    const pauseRollout = usePause();

    const runningRollouts = useMemo(() =>
        (rolloutData?.content || []).filter(r => r.status === 'running'),
        [rolloutData]
    );

    const hasRunningRollouts = runningRollouts.length > 0;

    const handleOpenModal = () => {
        setModalOpen(true);
        setPhase('confirm');
        setResults([]);
        refetch();
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setPhase('confirm');
        setResults([]);
    };

    const handleEmergencyStop = async () => {
        if (runningRollouts.length === 0) {
            message.info(t('emergencyStop.noRunningRollouts'));
            return;
        }

        setPhase('processing');
        setProcessing(true);

        const initialResults: PauseResult[] = runningRollouts.map(r => ({
            rolloutId: r.id!,
            name: r.name || `Rollout ${r.id}`,
            status: 'pending',
        }));
        setResults(initialResults);

        const updatedResults: PauseResult[] = [...initialResults];

        for (let i = 0; i < runningRollouts.length; i++) {
            const rollout = runningRollouts[i];
            try {
                await pauseRollout.mutateAsync({ rolloutId: rollout.id! });
                updatedResults[i] = { ...updatedResults[i], status: 'success' };
            } catch (error) {
                updatedResults[i] = {
                    ...updatedResults[i],
                    status: 'error',
                    error: (error as Error).message,
                };
            }
            setResults([...updatedResults]);
        }

        setProcessing(false);
        setPhase('complete');

        const successCount = updatedResults.filter(r => r.status === 'success').length;
        const errorCount = updatedResults.filter(r => r.status === 'error').length;

        if (errorCount === 0) {
            message.success(t('emergencyStop.allPaused', { count: successCount }));
        } else {
            message.warning(t('emergencyStop.partialSuccess', { success: successCount, error: errorCount }));
        }

        // Refetch to update button state
        refetch();
    };

    const completedCount = results.filter(r => r.status !== 'pending').length;
    const progress = results.length > 0 ? Math.round((completedCount / results.length) * 100) : 0;

    if (!isAdmin) {
        return null;
    }

    const button = variant === 'icon' ? (
        <Tooltip title={t('emergencyStop.button')}>
            <Badge count={runningRollouts.length} size="small" offset={[-2, 2]}>
                <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<PauseCircleOutlined />}
                    size={size}
                    onClick={handleOpenModal}
                    disabled={!hasRunningRollouts}
                />
            </Badge>
        </Tooltip>
    ) : variant === 'text' ? (
        <Button
            type="text"
            danger
            icon={<PauseCircleOutlined />}
            size={size}
            onClick={handleOpenModal}
            disabled={!hasRunningRollouts}
        >
            {t('emergencyStop.button')}
        </Button>
    ) : (
        <EmergencyButton
            icon={<PauseCircleOutlined />}
            size={size}
            onClick={handleOpenModal}
            disabled={!hasRunningRollouts}
        >
            {t('emergencyStop.button')}
            {hasRunningRollouts && (
                <Badge
                    count={runningRollouts.length}
                    style={{ marginLeft: 8, backgroundColor: '#fff', color: '#ff4d4f', fontWeight: 'bold' }}
                />
            )}
        </EmergencyButton>
    );

    return (
        <>
            {button}

            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: 'var(--ant-color-error)' }} />
                        <Text strong style={{ textTransform: 'uppercase' }}>{t('emergencyStop.title')}</Text>
                    </Space>
                }
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={phase === 'complete' ? (
                    <Button onClick={handleCloseModal}>
                        {t('emergencyStop.close')}
                    </Button>
                ) : (
                    <>
                        <Button onClick={handleCloseModal} disabled={processing}>
                            {t('emergencyStop.cancel')}
                        </Button>
                        <Button
                            type="primary"
                            danger
                            onClick={handleEmergencyStop}
                            loading={processing}
                            disabled={isLoading || !hasRunningRollouts}
                            style={{ fontWeight: 600, borderRadius: 4 }}
                        >
                            {t('emergencyStop.confirm')}
                        </Button>
                    </>
                )}
                width={560}
            >
                {phase === 'confirm' && (
                    <>
                        <Alert
                            type="warning"
                            showIcon
                            icon={<ExclamationCircleOutlined />}
                            message={<Text strong>{t('emergencyStop.warning')}</Text>}
                            description={t('emergencyStop.warningDesc')}
                            style={{ marginBottom: 16, border: '1px solid var(--ant-color-warning-border)' }}
                        />

                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: 24 }}>
                                <LoadingOutlined style={{ fontSize: 24 }} />
                                <Text style={{ display: 'block', marginTop: 8 }}>
                                    {t('emergencyStop.loading')}
                                </Text>
                            </div>
                        ) : runningRollouts.length === 0 ? (
                            <Result
                                status="success"
                                title={t('emergencyStop.noRollouts')}
                                subTitle={t('emergencyStop.noRolloutsDesc')}
                            />
                        ) : (
                            <>
                                <Title level={5} style={{ fontFamily: 'var(--font-mono)' }}>
                                    {t('emergencyStop.affectedRollouts', { count: runningRollouts.length })}
                                </Title>
                                <List
                                    dataSource={runningRollouts}
                                    renderItem={(rollout: MgmtRolloutResponseBody) => (
                                        <RolloutItem>
                                            <RolloutInfo>
                                                <Text strong>{rollout.name}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                                                    {t('emergencyStop.totalTargets', { count: rollout.totalTargets })}
                                                </Text>
                                            </RolloutInfo>
                                            <Tag color="processing" style={{ borderRadius: 2 }}>
                                                {t('status.running', { ns: 'common' })}
                                            </Tag>
                                        </RolloutItem>
                                    )}
                                    style={{ maxHeight: 200, overflowY: 'auto' }}
                                />
                            </>
                        )}
                    </>
                )}

                {(phase === 'processing' || phase === 'complete') && (
                    <>
                        <Progress
                            percent={progress}
                            status={phase === 'complete' ? 'success' : 'active'}
                            style={{ marginBottom: 16 }}
                            strokeLinecap="square"
                        />

                        <List
                            dataSource={results}
                            renderItem={(result) => (
                                <RolloutItem>
                                    <RolloutInfo>
                                        <Text strong>{result.name}</Text>
                                        {result.error && (
                                            <Text type="danger" style={{ display: 'block', fontSize: 12 }}>
                                                {result.error}
                                            </Text>
                                        )}
                                    </RolloutInfo>
                                    <StatusIndicator $status={result.status}>
                                        {result.status === 'pending' && <LoadingOutlined />}
                                        {result.status === 'success' && <CheckCircleOutlined />}
                                        {result.status === 'error' && <ExclamationCircleOutlined />}
                                        <Text style={{ color: 'inherit' }}>
                                            {result.status === 'pending' && t('emergencyStop.pausing')}
                                            {result.status === 'success' && t('emergencyStop.paused')}
                                            {result.status === 'error' && t('emergencyStop.failed')}
                                        </Text>
                                    </StatusIndicator>
                                </RolloutItem>
                            )}
                            style={{ maxHeight: 300, overflowY: 'auto' }}
                        />
                    </>
                )}
            </Modal>
        </>
    );
};

export default EmergencyStopButton;
