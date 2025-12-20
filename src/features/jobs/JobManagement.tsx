import React, { useMemo, useState } from 'react';
import {
    Card,
    Tree,
    type TreeDataNode,
    Button,
    Space,
    Spin,
    Empty,
    Typography,
    Descriptions,
    Tag,
    message,
    Modal,
    Form,
    Input,
    Select,
    Radio,
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    useGetActions,
    useGetAction1,
} from '@/api/generated/actions/actions';
import {
    useGetRollouts,
    useGetRollout,
    useStart,
    usePause,
    useResume,
    useApprove,
    useDeny,
} from '@/api/generated/rollouts/rollouts';
import {
    useCancelAction,
    useUpdateAction,
    useUpdateActionConfirmation,
    usePostAssignedDistributionSet,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import type {
    MgmtDistributionSet,
    MgmtDistributionSetAssignment,
} from '@/api/generated/model';

const LayoutWrapper = styled.div`
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
`;

const SidePanel = styled(Card)`
    width: 320px;
    flex-shrink: 0;
`;

const ContentPanel = styled(Card)`
    flex: 1;
    min-width: 320px;
`;

type SelectedNode = {
    type: 'action' | 'rollout';
    id: number;
} | null;

const statusColorMap: Record<string, string> = {
    finished: 'green',
    running: 'blue',
    pending: 'orange',
    waiting: 'orange',
    waiting_for_approval: 'orange',
    error: 'red',
    canceled: 'default',
    pause: 'orange',
};

interface CreateActionModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const CreateActionModal: React.FC<CreateActionModalProps> = ({
    open,
    onClose,
    onCreated,
}) => {
    const { t } = useTranslation('jobs');
    const [form] = Form.useForm();
    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets({
        limit: 200,
    });
    const mutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('createAction.success'));
                form.resetFields();
                onClose();
                onCreated();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to create action');
            },
        },
    });

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const assignment: MgmtDistributionSetAssignment = {
                id: values.distributionSetId,
                type: values.assignType,
            };
            mutation.mutate({
                targetId: values.controllerId,
                data: [assignment],
            });
        } catch {
            // ignore validation errors
        }
    };

    return (
        <Modal
            open={open}
            title={t('createAction.title')}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={mutation.isPending}
            okText={t('createAction.submit')}
            cancelText={t('createAction.cancel')}
        >
            <Form
                layout="vertical"
                form={form}
                initialValues={{ assignType: 'soft' }}
            >
                <Form.Item
                    label={t('createAction.controllerId')}
                    name="controllerId"
                    rules={[{ required: true }]}
                >
                    <Input placeholder={t('createAction.controllerPlaceholder')} />
                </Form.Item>
                <Form.Item
                    label={t('createAction.distributionSet')}
                    name="distributionSetId"
                    rules={[{ required: true }]}
                >
                    <Select
                        loading={dsLoading}
                        options={(dsData?.content || []).map((ds: MgmtDistributionSet) => ({
                            label: `${ds.name} (v${ds.version})`,
                            value: ds.id,
                        }))}
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>
                <Form.Item
                    label={t('createAction.assignType')}
                    name="assignType"
                >
                    <Radio.Group>
                        <Radio value="soft">Soft</Radio>
                        <Radio value="forced">Forced</Radio>
                        <Radio value="downloadonly">Download Only</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const JobManagement: React.FC = () => {
    const { t } = useTranslation('jobs');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const [selectedNode, setSelectedNode] = useState<SelectedNode>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const {
        data: actionsData,
        isLoading: actionsLoading,
        refetch: refetchActions,
    } = useGetActions({
        limit: 50,
        sort: 'lastModifiedAt:DESC',
    });

    const {
        data: rolloutsData,
        isLoading: rolloutsLoading,
        refetch: refetchRollouts,
    } = useGetRollouts({
        limit: 50,
        sort: 'createdAt:DESC',
    });

    const {
        data: actionDetail,
        isLoading: actionDetailLoading,
        refetch: refetchActionDetail,
    } = useGetAction1(selectedNode?.id || 0, {
        query: { enabled: selectedNode?.type === 'action' },
    });

    const {
        data: rolloutDetail,
        isLoading: rolloutDetailLoading,
        refetch: refetchRolloutDetail,
    } = useGetRollout(selectedNode?.id || 0, {
        query: { enabled: selectedNode?.type === 'rollout' },
    });

    const cancelMutation = useCancelAction({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.cancelSuccess'));
                queryClient.invalidateQueries();
                refetchActionDetail();
                refetchActions();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to cancel action');
            },
        },
    });

    const forceMutation = useUpdateAction({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.forceSuccess'));
                queryClient.invalidateQueries();
                refetchActionDetail();
                refetchActions();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to force action');
            },
        },
    });

    const confirmMutation = useUpdateActionConfirmation({
        mutation: {
            onSuccess: (_, variables) => {
                if (variables.data?.confirmation === 'confirmed') {
                    message.success(t('messages.confirmSuccess'));
                } else {
                    message.success(t('messages.denySuccess'));
                }
                queryClient.invalidateQueries();
                refetchActionDetail();
            },
            onError: (err) => {
                message.error((err as Error).message || 'Failed to update confirmation');
            },
        },
    });

    const rolloutMutationOptions = {
        onSuccess: () => {
            message.success(t('messages.rolloutActionSuccess'));
            queryClient.invalidateQueries();
            refetchRollouts();
            refetchRolloutDetail();
        },
        onError: () => {
            message.error(t('messages.rolloutActionError'));
        },
    };

    const startMutation = useStart({ mutation: rolloutMutationOptions });
    const pauseMutation = usePause({ mutation: rolloutMutationOptions });
    const resumeMutation = useResume({ mutation: rolloutMutationOptions });
    const approveMutation = useApprove({ mutation: rolloutMutationOptions });
    const denyMutation = useDeny({ mutation: rolloutMutationOptions });

    const treeData: TreeDataNode[] = useMemo(() => {
        const actionNodes: TreeDataNode[] = (actionsData?.content || []).map((action) => ({
            key: `action-${action.id}`,
            title: (
                <Space size={6}>
                    <Tag color={statusColorMap[action.status || ''] || 'default'}>
                        {action.status?.toUpperCase() || 'UNKNOWN'}
                    </Tag>
                    <span>#{action.id}</span>
                </Space>
            ),
            isLeaf: true,
        }));

        const rolloutNodes: TreeDataNode[] = (rolloutsData?.content || []).map((rollout) => ({
            key: `rollout-${rollout.id}`,
            title: (
                <Space size={6}>
                    <Tag color={statusColorMap[rollout.status || ''] || 'default'}>
                        {rollout.status?.toUpperCase()}
                    </Tag>
                    <span>{rollout.name}</span>
                </Space>
            ),
            isLeaf: true,
        }));

        return [
            {
                key: 'actions-root',
                title: `${t('tree.actions')} (${actionsData?.total || 0})`,
                selectable: false,
                children: actionNodes,
            },
            {
                key: 'rollouts-root',
                title: `${t('tree.rollouts')} (${rolloutsData?.total || 0})`,
                selectable: false,
                children: rolloutNodes,
            },
        ];
    }, [actionsData, rolloutsData, t]);

    const handleSelect = (keys: React.Key[]) => {
        const key = keys[0]?.toString();
        if (!key) return;
        if (key.startsWith('action-')) {
            const id = Number(key.replace('action-', ''));
            setSelectedNode({ type: 'action', id });
        } else if (key.startsWith('rollout-')) {
            const id = Number(key.replace('rollout-', ''));
            setSelectedNode({ type: 'rollout', id });
        }
    };

    const selectedKeys = selectedNode ? [`${selectedNode.type}-${selectedNode.id}`] : [];

    const extractTargetId = (href?: string) => {
        if (!href) return '';
        const parts = href.split('/');
        return parts[parts.length - 1];
    };

    const renderActionDetail = () => {
        if (actionDetailLoading) {
            return <Spin />;
        }

        if (!actionDetail) {
            return <Empty description={t('detail.placeholder')} />;
        }

        const targetId = extractTargetId(actionDetail._links?.target?.href);
        const actionId = actionDetail.id;
        const isAdmin = role === 'Admin';

        const handleForce = () => {
            if (!targetId || !actionId) return;
            forceMutation.mutate({
                targetId,
                actionId,
                data: { forceType: 'forced' },
            });
        };

        const handleCancel = () => {
            if (!targetId || !actionId) return;
            cancelMutation.mutate({ targetId, actionId });
        };

        const handleConfirm = (confirmation: 'confirmed' | 'denied') => {
            if (!targetId || !actionId) return;
            confirmMutation.mutate({
                targetId,
                actionId,
                data: { confirmation },
            });
        };

        return (
            <>
                <Space style={{ marginBottom: 16 }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        {t('detail.actionTitle', { id: actionId })}
                    </Typography.Title>
                    <Tag color={statusColorMap[actionDetail.status || ''] || 'default'}>
                        {actionDetail.status?.toUpperCase()}
                    </Tag>
                </Space>
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label={t('detail.target')}>
                        {actionDetail._links?.target?.name || targetId || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.distribution')}>
                        {actionDetail._links?.distributionset?.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.forceType')}>
                        {actionDetail.forceType || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.status')}>
                        {actionDetail.status}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.createdAt')}>
                        {actionDetail.createdAt ? dayjs(actionDetail.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.lastModified')}>
                        {actionDetail.lastModifiedAt ? dayjs(actionDetail.lastModifiedAt).format('YYYY-MM-DD HH:mm') : '-'}
                    </Descriptions.Item>
                </Descriptions>
                <Space style={{ marginTop: 16 }} wrap>
                    <Button icon={<ArrowRightOutlined />} onClick={() => navigate(`/actions/${actionId}`)}>
                        {t('actions.openDetail')}
                    </Button>
                    {isAdmin && (
                        <>
                            <Button type="default" onClick={handleForce} loading={forceMutation.isPending}>
                                {t('actions.force')}
                            </Button>
                            <Button danger onClick={handleCancel} loading={cancelMutation.isPending}>
                                {t('actions.cancel')}
                            </Button>
                        </>
                    )}
                    {actionDetail.status === 'wait_for_confirmation' && (
                        <>
                            <Button type="primary" onClick={() => handleConfirm('confirmed')} loading={confirmMutation.isPending}>
                                {t('actions.confirm')}
                            </Button>
                            <Button danger onClick={() => handleConfirm('denied')} loading={confirmMutation.isPending}>
                                {t('actions.deny')}
                            </Button>
                        </>
                    )}
                </Space>
            </>
        );
    };

    const renderRolloutDetail = () => {
        if (rolloutDetailLoading) {
            return <Spin />;
        }
        if (!rolloutDetail) {
            return <Empty description={t('detail.placeholder')} />;
        }
        const rolloutId = rolloutDetail.id!;
        const status = rolloutDetail.status || '';
        const canStart = status === 'ready';
        const canPause = status === 'running';
        const canResume = status === 'paused';
        const canApprove = status === 'waiting_for_approval';
        const disableControls = role !== 'Admin';

        const handleRolloutAction = (action: 'start' | 'pause' | 'resume' | 'approve' | 'deny') => {
            const payload = { rolloutId };
            switch (action) {
                case 'start':
                    startMutation.mutate(payload);
                    break;
                case 'pause':
                    pauseMutation.mutate(payload);
                    break;
                case 'resume':
                    resumeMutation.mutate(payload);
                    break;
                case 'approve':
                    approveMutation.mutate(payload);
                    break;
                case 'deny':
                    denyMutation.mutate(payload);
                    break;
            }
        };

        return (
            <>
                <Space style={{ marginBottom: 16 }}>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        {t('detail.rolloutTitle', { id: rolloutId })}
                    </Typography.Title>
                    <Tag color={statusColorMap[status] || 'default'}>{status.toUpperCase()}</Tag>
                </Space>
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label={t('detail.description')}>
                        {rolloutDetail.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.targetFilter')}>
                        {rolloutDetail.targetFilterQuery}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.totalTargets')}>
                        {rolloutDetail.totalTargets ?? '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={t('detail.createdAt')}>
                        {rolloutDetail.createdAt ? dayjs(rolloutDetail.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                    </Descriptions.Item>
                </Descriptions>
                <Space style={{ marginTop: 16 }} wrap>
                    <Button icon={<ArrowRightOutlined />} onClick={() => navigate(`/rollouts/${rolloutId}`)}>
                        {t('actions.openDetail')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => handleRolloutAction('start')}
                        disabled={!canStart || disableControls}
                        loading={startMutation.isPending}
                    >
                        {t('rollouts.start')}
                    </Button>
                    <Button
                        onClick={() => handleRolloutAction('pause')}
                        disabled={!canPause || disableControls}
                        loading={pauseMutation.isPending}
                    >
                        {t('rollouts.pause')}
                    </Button>
                    <Button
                        onClick={() => handleRolloutAction('resume')}
                        disabled={!canResume || disableControls}
                        loading={resumeMutation.isPending}
                    >
                        {t('rollouts.resume')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => handleRolloutAction('approve')}
                        disabled={!canApprove || disableControls}
                        loading={approveMutation.isPending}
                    >
                        {t('rollouts.approve')}
                    </Button>
                    <Button
                        danger
                        onClick={() => handleRolloutAction('deny')}
                        disabled={!canApprove || disableControls}
                        loading={denyMutation.isPending}
                    >
                        {t('rollouts.deny')}
                    </Button>
                </Space>
            </>
        );
    };

    const renderDetail = () => {
        if (!selectedNode) {
            return <Empty description={t('detail.placeholder')} />;
        }
        if (selectedNode.type === 'action') {
            return renderActionDetail();
        }
        return renderRolloutDetail();
    };

    return (
        <>
            <Typography.Title level={3} style={{ marginBottom: 16 }}>
                {t('title')}
            </Typography.Title>
            <LayoutWrapper>
                <SidePanel
                    title={t('tree.actions')}
                    extra={
                        <Space>
                            <Button icon={<ReloadOutlined />} size="small" onClick={() => { refetchActions(); refetchRollouts(); }}>
                                {t('tree.refresh')}
                            </Button>
                        </Space>
                    }
                >
                    <Tree
                        treeData={treeData}
                        selectable
                        selectedKeys={selectedKeys}
                        onSelect={handleSelect}
                        showLine
                        switcherIcon={null}
                        height={520}
                    />
                    <Space style={{ marginTop: 16, width: '100%' }} direction="vertical">
                        <Button type="primary" icon={<PlusOutlined />} block onClick={() => setCreateModalOpen(true)}>
                            {t('tree.createAction')}
                        </Button>
                        <Button block onClick={() => navigate('/rollouts/create')}>
                            {t('tree.createRollout')}
                        </Button>
                    </Space>
                </SidePanel>

                <ContentPanel>
                    {actionsLoading || rolloutsLoading ? <Spin /> : renderDetail()}
                </ContentPanel>
            </LayoutWrapper>

            <CreateActionModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={() => {
                    refetchActions();
                }}
            />
        </>
    );
};

export default JobManagement;
