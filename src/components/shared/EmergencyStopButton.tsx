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
    background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
    font-weight: 600;
    
    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
        box-shadow: 0 6px 16px rgba(255, 77, 79, 0.5);
    }
    
    &:active:not(:disabled) {
        background: linear-gradient(135deg, #cf1322 0%, #a8071a 100%);
    }
`;

const RolloutItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: var(--ant-color-bg-container-disabled, #fafafa);
    border-radius: 8px;
    margin-bottom: 8px;
`;

const RolloutInfo = styled.div`
    flex: 1;
`;

const StatusIndicator = styled.div<{ $status: 'pending' | 'success' | 'error' }>`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => {
        switch (props.$status) {
            case 'success': return '#52c41a';
            case 'error': return '#ff4d4f';
            default: return '#1677ff';
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

    const { data: rolloutData, isLoading, refetch } = useGetRollouts(
        { q: 'status==running', limit: 100 },
        { query: { enabled: modalOpen, staleTime: 5000 } }
    );

    const pauseRollout = usePause();

    const runningRollouts = useMemo(() =>
        (rolloutData?.content || []).filter(r => r.status === 'running'),
        [rolloutData]
    );

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
            message.info(t('emergencyStop.noRunningRollouts', { defaultValue: 'No running rollouts to pause' }));
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
            message.success(t('emergencyStop.allPaused', {
                count: successCount,
                defaultValue: `Successfully paused ${successCount} rollout(s)`
            }));
        } else {
            message.warning(t('emergencyStop.partialSuccess', {
                success: successCount,
                error: errorCount,
                defaultValue: `Paused ${successCount} rollout(s), ${errorCount} failed`
            }));
        }
    };

    const completedCount = results.filter(r => r.status !== 'pending').length;
    const progress = results.length > 0 ? Math.round((completedCount / results.length) * 100) : 0;

    if (!isAdmin) {
        return null;
    }

    const button = variant === 'icon' ? (
        <Tooltip title={t('emergencyStop.button', { defaultValue: 'Emergency Stop' })}>
            <Badge count={runningRollouts.length} size="small" offset={[-2, 2]}>
                <Button
                    type="primary"
                    danger
                    shape="circle"
                    icon={<PauseCircleOutlined />}
                    size={size}
                    onClick={handleOpenModal}
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
        >
            {t('emergencyStop.button', { defaultValue: 'Emergency Stop' })}
        </Button>
    ) : (
        <EmergencyButton
            type="primary"
            danger
            icon={<PauseCircleOutlined />}
            size={size}
            onClick={handleOpenModal}
        >
            {t('emergencyStop.button', { defaultValue: 'Emergency Stop' })}
            {runningRollouts.length > 0 && (
                <Badge
                    count={runningRollouts.length}
                    style={{ marginLeft: 8, backgroundColor: '#fff', color: '#ff4d4f' }}
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
                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                        {t('emergencyStop.title', { defaultValue: 'Emergency Stop - Pause All Rollouts' })}
                    </Space>
                }
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={phase === 'complete' ? (
                    <Button onClick={handleCloseModal}>
                        {t('emergencyStop.close', { defaultValue: 'Close' })}
                    </Button>
                ) : (
                    <>
                        <Button onClick={handleCloseModal} disabled={processing}>
                            {t('emergencyStop.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button
                            type="primary"
                            danger
                            onClick={handleEmergencyStop}
                            loading={processing}
                            disabled={isLoading || runningRollouts.length === 0}
                        >
                            {t('emergencyStop.confirm', { defaultValue: 'Stop All Rollouts' })}
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
                            message={t('emergencyStop.warning', { defaultValue: 'This action will pause all running rollouts' })}
                            description={t('emergencyStop.warningDesc', {
                                defaultValue: 'All deployments in progress will be suspended. You can resume them later.'
                            })}
                            style={{ marginBottom: 16 }}
                        />

                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: 24 }}>
                                <LoadingOutlined style={{ fontSize: 24 }} />
                                <Text style={{ display: 'block', marginTop: 8 }}>
                                    {t('emergencyStop.loading', { defaultValue: 'Checking running rollouts...' })}
                                </Text>
                            </div>
                        ) : runningRollouts.length === 0 ? (
                            <Result
                                status="success"
                                title={t('emergencyStop.noRollouts', { defaultValue: 'No Running Rollouts' })}
                                subTitle={t('emergencyStop.noRolloutsDesc', {
                                    defaultValue: 'There are no rollouts currently in progress.'
                                })}
                            />
                        ) : (
                            <>
                                <Title level={5}>
                                    {t('emergencyStop.affectedRollouts', {
                                        count: runningRollouts.length,
                                        defaultValue: `${runningRollouts.length} Running Rollout(s)`
                                    })}
                                </Title>
                                <List
                                    dataSource={runningRollouts}
                                    renderItem={(rollout: MgmtRolloutResponseBody) => (
                                        <RolloutItem>
                                            <RolloutInfo>
                                                <Text strong>{rollout.name}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {t('emergencyStop.totalTargets', {
                                                        count: rollout.totalTargets,
                                                        defaultValue: `${rollout.totalTargets} targets`
                                                    })}
                                                </Text>
                                            </RolloutInfo>
                                            <Tag color="processing">
                                                {t('status.running', { defaultValue: 'Running' })}
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
                                            {result.status === 'pending' && t('emergencyStop.pausing', { defaultValue: 'Pausing...' })}
                                            {result.status === 'success' && t('emergencyStop.paused', { defaultValue: 'Paused' })}
                                            {result.status === 'error' && t('emergencyStop.failed', { defaultValue: 'Failed' })}
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
