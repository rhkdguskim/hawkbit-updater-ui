/**
 * Bulk AutoConfirm Modal
 * Modal for bulk activate/deactivate auto-confirm on multiple targets
 */
import React, { useState, useCallback } from 'react';
import { Modal, Alert, List, Typography, Progress, Space, Badge, message } from 'antd';
import { CheckCircleOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
    useActivateAutoConfirm,
    useDeactivateAutoConfirm,
    getGetTargetsQueryKey
} from '@/api/generated/targets/targets';

const { Text } = Typography;

interface BulkAutoConfirmModalProps {
    open: boolean;
    targetIds: string[];
    mode: 'activate' | 'deactivate';
    t: (key: string, options?: Record<string, unknown>) => string;
    onCancel: () => void;
    onSuccess: () => void;
}

export const BulkAutoConfirmModal: React.FC<BulkAutoConfirmModalProps> = ({
    open,
    targetIds,
    mode,
    t,
    onCancel,
    onSuccess,
}) => {
    const queryClient = useQueryClient();
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<{ success: string[]; failed: string[] }>({
        success: [],
        failed: [],
    });

    const activateMutation = useActivateAutoConfirm();
    const deactivateMutation = useDeactivateAutoConfirm();

    const handleConfirm = useCallback(async () => {
        setProcessing(true);
        setProgress(0);
        setResults({ success: [], failed: [] });

        const successList: string[] = [];
        const failedList: string[] = [];

        for (let i = 0; i < targetIds.length; i++) {
            const targetId = targetIds[i];
            try {
                if (mode === 'activate') {
                    await activateMutation.mutateAsync({ targetId, data: {} });
                } else {
                    await deactivateMutation.mutateAsync({ targetId });
                }
                successList.push(targetId);
            } catch {
                failedList.push(targetId);
            }
            setProgress(Math.round(((i + 1) / targetIds.length) * 100));
        }

        setResults({ success: successList, failed: failedList });
        setProcessing(false);

        if (failedList.length === 0) {
            message.success(
                t('bulkAutoConfirm.success', {
                    count: successList.length,
                    defaultValue: `Successfully updated ${successList.length} target(s)`
                })
            );
            queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            onSuccess();
        } else if (successList.length > 0) {
            message.warning(
                t('bulkAutoConfirm.partialSuccess', {
                    success: successList.length,
                    failed: failedList.length,
                    defaultValue: `Updated ${successList.length}, failed ${failedList.length}`,
                })
            );
            queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
        } else {
            message.error(t('bulkAutoConfirm.failed', { defaultValue: 'All operations failed' }));
        }
    }, [targetIds, mode, activateMutation, deactivateMutation, queryClient, onSuccess, t]);

    const handleClose = () => {
        if (!processing) {
            setProgress(0);
            setResults({ success: [], failed: [] });
            onCancel();
        }
    };

    const isComplete = progress === 100 && !processing;

    return (
        <Modal
            title={
                <Space>
                    {mode === 'activate' ? <CheckCircleOutlined /> : <StopOutlined />}
                    {mode === 'activate'
                        ? t('bulkAutoConfirm.activateTitle', { defaultValue: 'Activate Auto Confirm' })
                        : t('bulkAutoConfirm.deactivateTitle', { defaultValue: 'Deactivate Auto Confirm' })}
                </Space>
            }
            open={open}
            onOk={handleConfirm}
            onCancel={handleClose}
            okText={
                processing
                    ? t('common:status.processing', { defaultValue: 'Processing...' })
                    : isComplete
                        ? t('common:actions.close', { defaultValue: 'Close' })
                        : t('common:actions.confirm', { defaultValue: 'Confirm' })
            }
            okButtonProps={{
                loading: processing,
                onClick: isComplete ? handleClose : handleConfirm,
            }}
            cancelButtonProps={{ disabled: processing }}
            closable={!processing}
            maskClosable={!processing}
        >
            {!processing && progress === 0 && (
                <>
                    <Alert
                        type={mode === 'activate' ? 'info' : 'warning'}
                        message={
                            mode === 'activate'
                                ? t('bulkAutoConfirm.activateDesc', {
                                    count: targetIds.length,
                                    defaultValue: `Auto-confirm will be enabled for ${targetIds.length} target(s)`,
                                })
                                : t('bulkAutoConfirm.deactivateDesc', {
                                    count: targetIds.length,
                                    defaultValue: `Auto-confirm will be disabled for ${targetIds.length} target(s)`,
                                })
                        }
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Text type="secondary">
                        {t('bulkAutoConfirm.targetList', { defaultValue: 'Selected targets:' })}
                    </Text>
                    <List
                        size="small"
                        dataSource={targetIds.slice(0, 5)}
                        renderItem={id => <List.Item>{id}</List.Item>}
                        style={{ maxHeight: 200, overflow: 'auto' }}
                    />
                    {targetIds.length > 5 && (
                        <Text type="secondary">
                            {t('bulkDelete.andMore', { count: targetIds.length - 5 })}
                        </Text>
                    )}
                </>
            )}

            {(processing || isComplete) && (
                <>
                    <Progress percent={progress} status={processing ? 'active' : 'success'} />

                    {isComplete && results.failed.length > 0 && (
                        <Alert
                            type="warning"
                            message={t('bulkAutoConfirm.partialCompleteTitle', {
                                defaultValue: 'Completed with errors'
                            })}
                            description={
                                <Space direction="vertical">
                                    <Badge status="success" text={`${results.success.length} succeeded`} />
                                    <Badge status="error" text={`${results.failed.length} failed`} />
                                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                        {t('bulkAutoConfirm.failedTargets', { defaultValue: 'Failed targets:' })}
                                        {' '}{results.failed.slice(0, 3).join(', ')}
                                        {results.failed.length > 3 && '...'}
                                    </Text>
                                </Space>
                            }
                            icon={<ExclamationCircleOutlined />}
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}
                </>
            )}
        </Modal>
    );
};

export default BulkAutoConfirmModal;
