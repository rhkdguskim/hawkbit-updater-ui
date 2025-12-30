import React, { useState } from 'react';
import { Typography, Alert, Progress, App, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { deleteTarget } from '@/api/generated/targets/targets';
import { useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';

const { Text } = Typography;

const TitleContent = styled(Space)`
    && {
        align-items: center;
    }
`;

const TitleIcon = styled(ExclamationCircleOutlined)`
    color: var(--ant-color-warning);
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ant-margin, 16px);
    padding: var(--ant-padding-lg, 24px) 0;
`;

const FullWidthStack = styled(Space)`
    && {
        width: 100%;
    }
`;

const ErrorList = styled.ul`
    margin: 0;
    padding-left: var(--ant-padding-sm, 12px);
`;

interface BulkDeleteTargetModalProps {
    open: boolean;
    targetIds: string[];
    onCancel: () => void;
    onSuccess: () => void;
}

const BulkDeleteTargetModal: React.FC<BulkDeleteTargetModalProps> = ({
    open,
    targetIds,
    onCancel,
    onSuccess,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);

    const handleConfirm = async () => {
        if (targetIds.length === 0) return;

        setLoading(true);
        setProgress(0);
        setErrors([]);

        // Pause all queries to prevent 404 errors on deleted targets
        queryClient.cancelQueries();

        const total = targetIds.length;
        let completed = 0;
        const failed: string[] = [];

        for (const id of targetIds) {
            try {
                await deleteTarget(id);
            } catch (error) {
                const errMsg = (error as Error).message || id;
                failed.push(errMsg);
            }
            completed++;
            setProgress(Math.round((completed / total) * 100));
        }

        setLoading(false);

        if (failed.length === 0) {
            message.success(t('bulkDelete.success', { count: total }));
            onSuccess();
        } else if (failed.length < total) {
            message.warning(t('bulkDelete.partialSuccess', { success: total - failed.length, failed: failed.length }));
            setErrors(failed);
            onSuccess(); // Still call success to refresh the list
        } else {
            message.error(t('bulkDelete.failed'));
            setErrors(failed);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setProgress(0);
            setErrors([]);
            onCancel();
        }
    };

    return (
        <StandardModal
            title={
                <TitleContent size="small">
                    <TitleIcon />
                    {t('bulkDelete.title', { defaultValue: 'Bulk Delete Targets' })}
                </TitleContent>
            }
            open={open}
            onOk={handleConfirm}
            onCancel={handleClose}
            okText={t('common:actions.delete')}
            cancelText={t('common:actions.cancel')}
            okButtonProps={{ danger: true, loading }}
            cancelButtonProps={{ disabled: loading }}
            closable={!loading}
            maskClosable={!loading}
        >
            {loading ? (
                <LoadingContainer>
                    <Progress type="circle" percent={progress} />
                    <Text>
                        {t('bulkDelete.processing', { defaultValue: 'Deleting targets...' })}
                    </Text>
                </LoadingContainer>
            ) : (
                <FullWidthStack direction="vertical" size="middle">
                    <Alert
                        type="warning"
                        showIcon
                        title={t('bulkDelete.confirmMessage', {
                            count: targetIds.length,
                            defaultValue: `Are you sure you want to delete ${targetIds.length} target(s)?`,
                        })}
                        description={t('bulkDelete.confirmDesc', {
                            defaultValue: 'This action cannot be undone.',
                        })}
                    />
                    {errors.length > 0 && (
                        <Alert
                            type="error"
                            title={t('bulkDelete.errorTitle', { defaultValue: 'Some deletions failed' })}
                            description={
                                <ErrorList>
                                    {errors.slice(0, 5).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                    {errors.length > 5 && (
                                        <li>{t('bulkDelete.andMore', { count: errors.length - 5 })}</li>
                                    )}
                                </ErrorList>
                            }
                        />
                    )}
                </FullWidthStack>
            )}
        </StandardModal>
    );
};

export default BulkDeleteTargetModal;
