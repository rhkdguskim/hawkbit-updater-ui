import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Descriptions,
    Tag,
    Button,
    Space,
    Typography,
    Alert,
    Popconfirm,
    message,
} from 'antd';
import {
    StopOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import { useGetAction1 } from '@/api/generated/actions/actions';
import {
    useGetActionStatusList,
    useCancelAction,
    useUpdateAction,
    useUpdateActionConfirmation,
} from '@/api/generated/targets/targets';
import type { MgmtActionStatus } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { StandardDetailLayout } from '@/components/layout';
import { SectionCard } from '@/components/layout/PageLayout';
import { ActionStatusTimeline } from '@/components/common/ActionStatusTimeline';
import { StatusTag } from '@/components/common';
import { PageLayout } from '@/components/patterns';
import styled from 'styled-components';

const { Text } = Typography;

const StatusHistoryScroll = styled.div`
    max-height: clamp(240px, 45vh, 520px);
    overflow-y: auto;
    padding-right: 4px;
`;

const ActionDetail: React.FC = () => {
    const { t } = useTranslation(['actions', 'common']);
    const { actionId } = useParams<{ actionId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const getTypeLabel = (type?: string) => {
        if (!type) return '-';
        const key = type.toLowerCase();
        return t(`actions:typeLabels.${key}`, { defaultValue: type.toUpperCase() });
    };

    const getForceTypeLabel = (forceType?: string) => {
        if (!forceType) return '-';
        const key = forceType.toLowerCase();
        return t(`actions:forceTypes.${key}`, { defaultValue: forceType.toUpperCase() });
    };

    const actionIdNum = parseInt(actionId || '0', 10);

    // Fetch action details
    // Auto-refresh for running actions
    const isRunning = (status?: string) => ['running', 'pending', 'canceling'].includes(status || '');

    const { data: actionData, isLoading, error } = useGetAction1(actionIdNum, {
        query: {
            enabled: !!actionIdNum,
            refetchInterval: (query) => {
                const status = query.state.data?.status?.toLowerCase();
                // Poll every 3 seconds when status is dynamic (running, pending, canceling)
                if (['running', 'pending', 'canceling', 'wait_for_confirmation'].includes(status || '')) {
                    return 3000;
                }
                // Poll less frequently for stable states
                return 15000;
            },
            staleTime: 0,
        },
    });

    // Fetch action status history
    // Note: This requires targetId which we may need to extract from actionData
    const targetId = actionData?._links?.target?.href?.split('/').pop() || '';
    const targetName = actionData?._links?.target?.name || targetId;
    const dsId = actionData?._links?.distributionset?.href?.split('/').pop() || '';
    const dsName = actionData?._links?.distributionset?.name || '';

    const { data: statusData, isLoading: statusLoading } = useGetActionStatusList(
        targetId,
        actionIdNum,
        { limit: 100 },
        {
            query: {
                enabled: !!targetId && !!actionIdNum,
                refetchInterval: (query) => {
                    const latestType = query.state.data?.content?.[0]?.type;
                    if (latestType !== 'finished' && latestType !== 'error' && latestType !== 'canceled') {
                        return 3000;
                    }
                    return 15000;
                },
                staleTime: 0,
            },
        }
    );

    // Mutations
    const cancelMutation = useCancelAction({
        mutation: {
            onSuccess: () => {
                message.success(t('actions:detail.messages.cancelSuccess'));
                queryClient.invalidateQueries();
            },
            // onError handled by global interceptor
        },
    });

    const updateMutation = useUpdateAction({
        mutation: {
            onSuccess: () => {
                message.success(t('actions:detail.messages.forceSuccess'));
                queryClient.invalidateQueries();
            },
            // onError handled by global interceptor
        },
    });

    const confirmMutation = useUpdateActionConfirmation({
        mutation: {
            onSuccess: () => {
                message.success(t('actions:detail.messages.confirmSuccess'));
                queryClient.invalidateQueries();
            },
            // onError handled by global interceptor
        },
    });

    const handleCancel = () => {
        if (targetId && actionIdNum) {
            cancelMutation.mutate({ targetId, actionId: actionIdNum });
        }
    };

    const handleForce = () => {
        if (targetId && actionIdNum) {
            updateMutation.mutate({
                targetId,
                actionId: actionIdNum,
                data: { forceType: 'forced' },
            });
        }
    };

    const handleConfirm = () => {
        if (targetId && actionIdNum) {
            confirmMutation.mutate({
                targetId,
                actionId: actionIdNum,
                data: { confirmation: 'confirmed' },
            });
        }
    };

    const handleDeny = () => {
        if (targetId && actionIdNum) {
            confirmMutation.mutate({
                targetId,
                actionId: actionIdNum,
                data: { confirmation: 'denied' },
            });
        }
    };

    if (error || (!isLoading && !actionData)) {
        return (
            <PageLayout>
                <Alert
                    type="error"
                    message={t('detail.notFound')}
                    description={t('detail.notFoundDesc')}
                    action={
                        <Button onClick={() => navigate('/actions')}>
                            {t('detail.backToActions')}
                        </Button>
                    }
                />
            </PageLayout>
        );
    }

    const canCancel = ['pending', 'running'].includes(actionData?.status || '');
    const canForce = actionData?.status === 'running' && actionData?.forceType !== 'forced';
    const canConfirm = actionData?.status === 'wait_for_confirmation';

    // Find latest error message from status history
    const latestError = statusData?.content?.find((s: MgmtActionStatus) => s.type === 'error');
    const errorMessages = latestError?.messages || [];

    const headerActions = isAdmin ? (
        <Space>
            {canForce && (
                <Popconfirm
                    title={t('detail.controls.forceConfirm')}
                    description={t('detail.controls.forceDesc')}
                    onConfirm={handleForce}
                >
                    <Button
                        icon={<ThunderboltOutlined />}
                        loading={updateMutation.isPending}
                    >
                        {t('detail.controls.force')}
                    </Button>
                </Popconfirm>
            )}
            {canCancel && (
                <Popconfirm
                    title={t('detail.controls.cancelConfirm')}
                    description={t('detail.controls.cancelDesc')}
                    onConfirm={handleCancel}
                >
                    <Button
                        danger
                        icon={<StopOutlined />}
                        loading={cancelMutation.isPending}
                    >
                        {t('detail.controls.cancel')}
                    </Button>
                </Popconfirm>
            )}
            {canConfirm && (
                <>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleConfirm}
                        loading={confirmMutation.isPending}
                    >
                        {t('detail.controls.confirm')}
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={handleDeny}
                        loading={confirmMutation.isPending}
                    >
                        {t('detail.controls.deny')}
                    </Button>
                </>
            )}
            {!canForce && !canCancel && !canConfirm && (
                <Text type="secondary">{t('detail.noActions')}</Text>
            )}
        </Space>
    ) : undefined;

    const liveTag = isRunning(actionData?.status) ? (
        <Tag color="blue">{t('detail.liveTag', 'LIVE')}</Tag>
    ) : undefined;

    return (
        <StandardDetailLayout
            breadcrumbs={[
                { label: t('list.title'), path: '/actions' },
                { label: actionData ? `#${actionData.id}` : `#${actionId}` },
            ]}
            title={actionData ? `${t('detail.pageTitle')} #${actionData.id}` : `#${actionId}`}
            description={t('detail.description')}
            status={actionData?.status}
            backLabel={t('detail.back')}
            onBack={() => navigate('/actions')}
            loading={isLoading}
            actions={headerActions}
            headerExtra={liveTag}
        >
            {/* Error Banner */}
            {actionData?.status === 'error' && errorMessages.length > 0 && (
                <Alert
                    type="error"
                    message={t('detail.errorBannerTitle')}
                    description={
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {errorMessages.map((msg: string, idx: number) => (
                                <li key={idx}>{msg}</li>
                            ))}
                        </ul>
                    }
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* Overview */}
            <SectionCard title={t('detail.overviewTitle')} loading={isLoading}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label={t('detail.labels.id')}>{actionData?.id}</Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.status')}>
                        <StatusTag status={actionData?.status} />
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.type')}>
                        <Tag color={actionData?.type === 'forced' ? 'red' : 'blue'}>
                            {getTypeLabel(actionData?.type)}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.forceType')}>
                        {getForceTypeLabel(actionData?.forceType)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.createdAt')}>
                        {actionData?.createdAt
                            ? dayjs(actionData.createdAt).format('YYYY-MM-DD HH:mm:ss')
                            : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.lastModified')}>
                        {actionData?.lastModifiedAt
                            ? dayjs(actionData.lastModifiedAt).format('YYYY-MM-DD HH:mm:ss')
                            : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.target')}>
                        {targetId ? (
                            <Link to={`/targets/${targetId}`}>{targetName}</Link>
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.labels.distributionSet')}>
                        {dsId ? (
                            <Link to={`/distributions/sets/${dsId}`}>{dsName}</Link>
                        ) : '-'}
                    </Descriptions.Item>
                </Descriptions>
            </SectionCard>

            {/* Status History Timeline */}
            <SectionCard title={t('detail.statusHistoryTitle')} loading={statusLoading} style={{ marginTop: 16 }}>
                <StatusHistoryScroll>
                    <ActionStatusTimeline
                        statuses={statusData?.content}
                        emptyText={t('detail.noStatusHistory')}
                    />
                </StatusHistoryScroll>
            </SectionCard>
        </StandardDetailLayout>
    );
};

export default ActionDetail;
