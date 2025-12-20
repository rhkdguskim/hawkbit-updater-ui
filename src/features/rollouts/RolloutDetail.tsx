import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Descriptions,
    Tag,
    Button,
    Space,
    Typography,
    Table,
    Progress,
    Spin,
    Alert,
    Popconfirm,
    message,
} from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    CaretRightOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import {
    useGetRollout,
    useGetRolloutGroups,
    useStart,
    usePause,
    useResume,
    useApprove,
    useDeny,
} from '@/api/generated/rollouts/rollouts';
import type { MgmtRolloutGroup } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { TableProps } from 'antd';

const { Title, Text } = Typography;

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'finished':
            return 'success';
        case 'running':
            return 'processing';
        case 'paused':
            return 'warning';
        case 'ready':
            return 'cyan';
        case 'creating':
            return 'default';
        case 'starting':
            return 'blue';
        case 'error':
            return 'error';
        case 'waiting_for_approval':
            return 'purple';
        case 'scheduled':
            return 'default';
        default:
            return 'default';
    }
};

const RolloutDetail: React.FC = () => {
    const { rolloutId } = useParams<{ rolloutId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const rolloutIdNum = parseInt(rolloutId || '0', 10);

    // Fetch rollout details
    const { data: rolloutData, isLoading, error } = useGetRollout(rolloutIdNum, {
        query: { enabled: !!rolloutIdNum },
    });

    // Fetch deploy groups
    const { data: groupsData, isLoading: groupsLoading } = useGetRolloutGroups(
        rolloutIdNum,
        { limit: 100 },
        { query: { enabled: !!rolloutIdNum } }
    );

    // Mutations
    const startMutation = useStart({
        mutation: {
            onSuccess: () => {
                message.success('Rollout started');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to start rollout');
            },
        },
    });

    const pauseMutation = usePause({
        mutation: {
            onSuccess: () => {
                message.success('Rollout paused');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to pause rollout');
            },
        },
    });

    const resumeMutation = useResume({
        mutation: {
            onSuccess: () => {
                message.success('Rollout resumed');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to resume rollout');
            },
        },
    });

    const approveMutation = useApprove({
        mutation: {
            onSuccess: () => {
                message.success('Rollout approved');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to approve rollout');
            },
        },
    });

    const denyMutation = useDeny({
        mutation: {
            onSuccess: () => {
                message.success('Rollout denied');
                queryClient.invalidateQueries();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to deny rollout');
            },
        },
    });

    // Handlers
    const handleStart = () => {
        if (rolloutIdNum) {
            startMutation.mutate({ rolloutId: rolloutIdNum });
        }
    };

    const handlePause = () => {
        if (rolloutIdNum) {
            pauseMutation.mutate({ rolloutId: rolloutIdNum });
        }
    };

    const handleResume = () => {
        if (rolloutIdNum) {
            resumeMutation.mutate({ rolloutId: rolloutIdNum });
        }
    };

    const handleApprove = () => {
        if (rolloutIdNum) {
            approveMutation.mutate({ rolloutId: rolloutIdNum });
        }
    };

    const handleDeny = () => {
        if (rolloutIdNum) {
            denyMutation.mutate({ rolloutId: rolloutIdNum });
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !rolloutData) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    type="error"
                    message="Rollout not found"
                    description="The requested rollout does not exist."
                    action={
                        <Button onClick={() => navigate('/rollouts')}>
                            Back to Rollouts
                        </Button>
                    }
                />
            </div>
        );
    }

    const canStart = rolloutData.status === 'ready';
    const canPause = rolloutData.status === 'running';
    const canResume = rolloutData.status === 'paused';
    const canApprove = rolloutData.status === 'waiting_for_approval';

    // Calculate overall progress
    const totalTargets = rolloutData.totalTargets || 0;
    const statusPerTarget = rolloutData.totalTargetsPerStatus as Record<string, number> || {};
    const finishedTargets = statusPerTarget.finished || 0;
    const overallProgress = totalTargets > 0 ? Math.round((finishedTargets / totalTargets) * 100) : 0;

    const groupColumns: TableProps<MgmtRolloutGroup>['columns'] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Total Targets',
            key: 'totalTargets',
            width: 120,
            render: (_, record) => (record as unknown as { totalTargets?: number }).totalTargets || 0,
        },
        {
            title: 'Progress',
            key: 'progress',
            width: 200,
            render: (_, record) => {
                const rec = record as unknown as { totalTargets?: number; totalTargetsPerStatus?: Record<string, number> };
                const total = rec.totalTargets || 0;
                const finished = rec.totalTargetsPerStatus?.finished || 0;
                const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                return <Progress percent={percent} size="small" />;
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/rollouts')}
                    >
                        Back
                    </Button>
                    <Title level={2} style={{ margin: 0 }}>
                        {rolloutData.name}
                    </Title>
                    <Tag color={getStatusColor(rolloutData.status)} style={{ fontSize: 14 }}>
                        {rolloutData.status?.toUpperCase().replace(/_/g, ' ')}
                    </Tag>
                </Space>

                {/* Rollout Controls (Admin Only) */}
                {isAdmin && (
                    <Card title="Rollout Controls" size="small">
                        <Space>
                            {canStart && (
                                <Popconfirm
                                    title="Start this rollout?"
                                    onConfirm={handleStart}
                                >
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        loading={startMutation.isPending}
                                    >
                                        Start
                                    </Button>
                                </Popconfirm>
                            )}
                            {canPause && (
                                <Popconfirm
                                    title="Pause this rollout?"
                                    onConfirm={handlePause}
                                >
                                    <Button
                                        icon={<PauseCircleOutlined />}
                                        loading={pauseMutation.isPending}
                                    >
                                        Pause
                                    </Button>
                                </Popconfirm>
                            )}
                            {canResume && (
                                <Button
                                    icon={<CaretRightOutlined />}
                                    onClick={handleResume}
                                    loading={resumeMutation.isPending}
                                >
                                    Resume
                                </Button>
                            )}
                            {canApprove && (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={handleApprove}
                                        loading={approveMutation.isPending}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={handleDeny}
                                        loading={denyMutation.isPending}
                                    >
                                        Deny
                                    </Button>
                                </>
                            )}
                            {!canStart && !canPause && !canResume && !canApprove && (
                                <Text type="secondary">No actions available for this status</Text>
                            )}
                        </Space>
                    </Card>
                )}

                {/* Overview */}
                <Card title="Overview">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID">{rolloutData.id}</Descriptions.Item>
                        <Descriptions.Item label="Name">{rolloutData.name}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={getStatusColor(rolloutData.status)}>
                                {rolloutData.status?.toUpperCase().replace(/_/g, ' ')}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Targets">
                            {rolloutData.totalTargets}
                        </Descriptions.Item>
                        <Descriptions.Item label="Overall Progress" span={2}>
                            <Progress percent={overallProgress} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">
                            {rolloutData.createdAt
                                ? format(rolloutData.createdAt, 'yyyy-MM-dd HH:mm:ss')
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Modified">
                            {rolloutData.lastModifiedAt
                                ? format(rolloutData.lastModifiedAt, 'yyyy-MM-dd HH:mm:ss')
                                : '-'}
                        </Descriptions.Item>
                        {rolloutData.description && (
                            <Descriptions.Item label="Description" span={2}>
                                {rolloutData.description}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>

                {/* Deploy Groups */}
                <Card title="Deploy Groups" loading={groupsLoading}>
                    <Table
                        dataSource={groupsData?.content || []}
                        columns={groupColumns}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default RolloutDetail;
