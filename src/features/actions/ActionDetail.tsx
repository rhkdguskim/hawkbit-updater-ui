import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Descriptions,
    Tag,
    Button,
    Space,
    Typography,
    Timeline,
    Spin,
    Alert,
    Popconfirm,
    message,
} from 'antd';
import {
    ArrowLeftOutlined,
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
import { format } from 'date-fns';

const { Title, Text } = Typography;

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'finished':
            return 'success';
        case 'error':
            return 'error';
        case 'running':
            return 'processing';
        case 'pending':
            return 'default';
        case 'canceled':
            return 'warning';
        case 'canceling':
            return 'warning';
        case 'wait_for_confirmation':
            return 'purple';
        default:
            return 'default';
    }
};

const ActionDetail: React.FC = () => {
    const { actionId } = useParams<{ actionId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const actionIdNum = parseInt(actionId || '0', 10);

    // Fetch action details
    const { data: actionData, isLoading, error } = useGetAction1(actionIdNum, {
        query: { enabled: !!actionIdNum },
    });

    // Fetch action status history
    // Note: This requires targetId which we may need to extract from actionData
    const targetId = actionData?._links?.target?.href?.split('/').pop() || '';

    const { data: statusData, isLoading: statusLoading } = useGetActionStatusList(
        targetId,
        actionIdNum,
        { limit: 100 },
        { query: { enabled: !!targetId && !!actionIdNum } }
    );

    // Mutations
    const cancelMutation = useCancelAction({
        mutation: {
            onSuccess: () => {
                message.success('Action canceled successfully');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to cancel action');
            },
        },
    });

    const updateMutation = useUpdateAction({
        mutation: {
            onSuccess: () => {
                message.success('Action updated to forced');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to update action');
            },
        },
    });

    const confirmMutation = useUpdateActionConfirmation({
        mutation: {
            onSuccess: () => {
                message.success('Action confirmed');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to confirm action');
            },
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

    if (isLoading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !actionData) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    type="error"
                    message="Action not found"
                    description="The requested action does not exist."
                    action={
                        <Button onClick={() => navigate('/actions')}>
                            Back to Actions
                        </Button>
                    }
                />
            </div>
        );
    }

    const canCancel = ['pending', 'running'].includes(actionData.status || '');
    const canForce = actionData.status === 'running' && actionData.forceType !== 'forced';
    const canConfirm = actionData.status === 'wait_for_confirmation';

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/actions')}
                    >
                        Back
                    </Button>
                    <Title level={2} style={{ margin: 0 }}>
                        Action #{actionData.id}
                    </Title>
                    <Tag color={getStatusColor(actionData.status)} style={{ fontSize: 14 }}>
                        {actionData.status?.toUpperCase()}
                    </Tag>
                </Space>

                {/* Action Controls (Admin Only) */}
                {isAdmin && (
                    <Card title="Action Controls" size="small">
                        <Space>
                            {canForce && (
                                <Popconfirm
                                    title="Force this action?"
                                    description="This will change the action type to forced."
                                    onConfirm={handleForce}
                                >
                                    <Button
                                        icon={<ThunderboltOutlined />}
                                        loading={updateMutation.isPending}
                                    >
                                        Force
                                    </Button>
                                </Popconfirm>
                            )}
                            {canCancel && (
                                <Popconfirm
                                    title="Cancel this action?"
                                    description="This action cannot be undone."
                                    onConfirm={handleCancel}
                                >
                                    <Button
                                        danger
                                        icon={<StopOutlined />}
                                        loading={cancelMutation.isPending}
                                    >
                                        Cancel
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
                                        Confirm
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={handleDeny}
                                        loading={confirmMutation.isPending}
                                    >
                                        Deny
                                    </Button>
                                </>
                            )}
                            {!canForce && !canCancel && !canConfirm && (
                                <Text type="secondary">No actions available for this status</Text>
                            )}
                        </Space>
                    </Card>
                )}

                {/* Overview */}
                <Card title="Overview">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID">{actionData.id}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={getStatusColor(actionData.status)}>
                                {actionData.status?.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">
                            <Tag color={actionData.type === 'forced' ? 'red' : 'blue'}>
                                {actionData.type?.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Force Type">
                            {actionData.forceType || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">
                            {actionData.createdAt
                                ? format(actionData.createdAt, 'yyyy-MM-dd HH:mm:ss')
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Modified">
                            {actionData.lastModifiedAt
                                ? format(actionData.lastModifiedAt, 'yyyy-MM-dd HH:mm:ss')
                                : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Status History Timeline */}
                <Card title="Status History" loading={statusLoading}>
                    {statusData?.content && statusData.content.length > 0 ? (
                        <Timeline
                            mode="left"
                            items={statusData.content.map((status: MgmtActionStatus) => ({
                                color: getStatusColor(status.type),
                                label: status.reportedAt
                                    ? format(status.reportedAt, 'yyyy-MM-dd HH:mm:ss')
                                    : '',
                                children: (
                                    <div>
                                        <Tag color={getStatusColor(status.type)}>
                                            {status.type?.toUpperCase()}
                                        </Tag>
                                        {status.messages && status.messages.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                {status.messages.map((msg: string, idx: number) => (
                                                    <Text key={idx} type="secondary" style={{ display: 'block' }}>
                                                        {msg}
                                                    </Text>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ),
                            }))}
                        />
                    ) : (
                        <Text type="secondary">No status history available</Text>
                    )}
                </Card>
            </Space>
        </div>
    );
};

export default ActionDetail;
