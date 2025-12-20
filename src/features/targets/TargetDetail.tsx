import React, { useState, useCallback } from 'react';
import {
    Typography,
    Tabs,
    Button,
    Space,
    Breadcrumb,
    Card,
    Alert,
    message,
    Skeleton,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    SendOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    OverviewTab,
    ActionsTab,
    AttributesTab,
    MetadataTab,
    DistributionSetTab,
    TagsTab,
    AutoConfirmTab,
} from './tabs';
import {
    DeleteTargetModal,
    TargetFormModal,
    AssignDSModal,
} from './components';
import type { AssignType } from './components';
import {
    useGetTarget,
    useGetAttributes,
    useGetActionHistory,
    useGetMetadata,
    useGetTags,
    useGetInstalledDistributionSet,
    useGetAssignedDistributionSet,
    useGetAutoConfirmStatus,
    useUpdateTarget,
    useDeleteTarget,
    usePostAssignedDistributionSet,
    useActivateAutoConfirm,
    useDeactivateAutoConfirm,
    getGetTargetQueryKey,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtDistributionSetAssignment, MgmtDistributionSetAssignments } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

const { Title, Text } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;

const HeaderInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const TargetDetail: React.FC = () => {
    const { id: targetId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // Active Tab State
    const [activeTab, setActiveTab] = useState('overview');

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // API Queries - Lazy loading based on active tab
    const {
        data: targetData,
        isLoading: targetLoading,
        error: targetError,
    } = useGetTarget(targetId!, { query: { enabled: !!targetId } });

    const { data: attributesData, isLoading: attributesLoading } = useGetAttributes(targetId!, {
        query: { enabled: !!targetId && activeTab === 'attributes' },
    });

    const { data: actionsData, isLoading: actionsLoading } = useGetActionHistory(
        targetId!,
        { limit: 50, sort: 'id:DESC' },
        { query: { enabled: !!targetId && activeTab === 'actions' } }
    );

    const { data: metadataData, isLoading: metadataLoading } = useGetMetadata(
        targetId!,
        { limit: 100 },
        { query: { enabled: !!targetId && activeTab === 'metadata' } }
    );

    const { data: tagsData, isLoading: tagsLoading } = useGetTags(targetId!, {
        query: { enabled: !!targetId && activeTab === 'tags' },
    });

    const { data: installedDSData, isLoading: installedDSLoading } = useGetInstalledDistributionSet(
        targetId!,
        { query: { enabled: !!targetId && activeTab === 'distribution' } }
    );

    const { data: assignedDSData, isLoading: assignedDSLoading } = useGetAssignedDistributionSet(
        targetId!,
        { query: { enabled: !!targetId && activeTab === 'distribution' } }
    );

    const { data: autoConfirmData, isLoading: autoConfirmLoading } = useGetAutoConfirmStatus(
        targetId!,
        { query: { enabled: !!targetId && activeTab === 'autoconfirm' } }
    );

    const { data: dsListData, isLoading: dsListLoading } = useGetDistributionSets(
        { limit: 100 },
        { query: { enabled: assignModalOpen } }
    );

    // Mutations
    const updateTargetMutation = useUpdateTarget({
        mutation: {
            onSuccess: () => {
                message.success('Target updated successfully');
                setEditModalOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetQueryKey(targetId) });
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to update target');
            },
        },
    });

    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success('Target deleted successfully');
                navigate('/targets');
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to delete target');
            },
        },
    });

    const assignDSMutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success('Distribution Set assigned successfully');
                setAssignModalOpen(false);
                queryClient.invalidateQueries();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to assign distribution set');
            },
        },
    });

    const activateAutoConfirmMutation = useActivateAutoConfirm({
        mutation: {
            onSuccess: () => {
                message.success('AutoConfirm activated');
                queryClient.invalidateQueries();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to activate AutoConfirm');
            },
        },
    });

    const deactivateAutoConfirmMutation = useDeactivateAutoConfirm({
        mutation: {
            onSuccess: () => {
                message.success('AutoConfirm deactivated');
                queryClient.invalidateQueries();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to deactivate AutoConfirm');
            },
        },
    });

    // Handlers
    const handleUpdateTarget = useCallback(
        (values: { name?: string; description?: string }) => {
            if (targetId) {
                updateTargetMutation.mutate({
                    targetId,
                    data: {
                        controllerId: targetId,
                        name: values.name || targetData?.name || targetId, // name is required
                        description: values.description
                    },
                });
            }
        },
        [targetId, targetData, updateTargetMutation]
    );

    const handleDeleteConfirm = useCallback(() => {
        if (targetId) {
            deleteTargetMutation.mutate({ targetId });
        }
    }, [targetId, deleteTargetMutation]);

    const handleAssignDS = useCallback(
        (dsId: number, type: AssignType) => {
            if (targetId) {
                const assignment: MgmtDistributionSetAssignment = {
                    id: dsId,
                    type: type as MgmtDistributionSetAssignment['type'],
                };
                assignDSMutation.mutate({
                    targetId,
                    data: [assignment] as MgmtDistributionSetAssignments,
                });
            }
        },
        [targetId, assignDSMutation]
    );

    const handleActivateAutoConfirm = useCallback(() => {
        if (targetId) {
            activateAutoConfirmMutation.mutate({ targetId, data: {} });
        }
    }, [targetId, activateAutoConfirmMutation]);

    const handleDeactivateAutoConfirm = useCallback(() => {
        if (targetId) {
            deactivateAutoConfirmMutation.mutate({ targetId });
        }
    }, [targetId, deactivateAutoConfirmMutation]);

    // Error State
    if (targetError) {
        return (
            <PageContainer>
                <Alert
                    type="error"
                    message="Target not found"
                    description="The requested target does not exist or you don't have permission to view it."
                    showIcon
                    action={
                        <Button type="primary" onClick={() => navigate('/targets')}>
                            Back to Targets
                        </Button>
                    }
                />
            </PageContainer>
        );
    }

    const tabItems = [
        {
            key: 'overview',
            label: 'Overview',
            children: <OverviewTab target={targetData} loading={targetLoading} />,
        },
        {
            key: 'actions',
            label: 'Actions',
            children: (
                <ActionsTab
                    data={actionsData}
                    loading={actionsLoading}
                    onViewAction={(action) =>
                        navigate(`/targets/${targetId}/actions/${action.id}`)
                    }
                    canForce={isAdmin}
                    canCancel={isAdmin}
                />
            ),
        },
        {
            key: 'attributes',
            label: 'Attributes',
            children: <AttributesTab data={attributesData} loading={attributesLoading} />,
        },
        {
            key: 'distribution',
            label: 'Distribution Sets',
            children: (
                <DistributionSetTab
                    installedDS={installedDSData}
                    assignedDS={assignedDSData}
                    loading={installedDSLoading || assignedDSLoading}
                    canAssign={true}
                    onAssign={() => setAssignModalOpen(true)}
                />
            ),
        },
        {
            key: 'metadata',
            label: 'Metadata',
            children: (
                <MetadataTab
                    data={metadataData}
                    loading={metadataLoading}
                    canEdit={isAdmin}
                />
            ),
        },
        {
            key: 'tags',
            label: 'Tags',
            children: <TagsTab data={tagsData} loading={tagsLoading} />,
        },
        ...(isAdmin
            ? [
                {
                    key: 'autoconfirm',
                    label: 'AutoConfirm',
                    children: (
                        <AutoConfirmTab
                            data={autoConfirmData}
                            loading={autoConfirmLoading}
                            canEdit={isAdmin}
                            onActivate={handleActivateAutoConfirm}
                            onDeactivate={handleDeactivateAutoConfirm}
                            actionLoading={
                                activateAutoConfirmMutation.isPending ||
                                deactivateAutoConfirmMutation.isPending
                            }
                        />
                    ),
                },
            ]
            : []),
    ];

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { title: <Link to="/targets">Targets</Link> },
                    { title: targetId },
                ]}
            />

            {/* Header */}
            <HeaderRow>
                <HeaderInfo>
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/targets')}
                        >
                            Back
                        </Button>
                        {targetLoading ? (
                            <Skeleton.Input active size="large" style={{ width: 200 }} />
                        ) : (
                            <Title level={3} style={{ margin: 0 }}>
                                {targetData?.name || targetId}
                            </Title>
                        )}
                    </Space>
                    {targetData?.description && (
                        <Text type="secondary" style={{ marginLeft: 44 }}>
                            {targetData.description}
                        </Text>
                    )}
                </HeaderInfo>

                <Space>
                    <Button
                        icon={<SendOutlined />}
                        onClick={() => setAssignModalOpen(true)}
                    >
                        Assign DS
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => setEditModalOpen(true)}
                            >
                                Edit
                            </Button>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </Space>
            </HeaderRow>

            {/* Tabs */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </Card>

            {/* Modals */}
            <DeleteTargetModal
                open={deleteModalOpen}
                target={targetData || null}
                loading={deleteTargetMutation.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModalOpen(false)}
            />

            <TargetFormModal
                open={editModalOpen}
                mode="edit"
                target={targetData}
                loading={updateTargetMutation.isPending}
                onSubmit={handleUpdateTarget}
                onCancel={() => setEditModalOpen(false)}
            />

            <AssignDSModal
                open={assignModalOpen}
                targetId={targetId ?? ''}
                distributionSets={dsListData?.content || []}
                loading={assignDSMutation.isPending}
                dsLoading={dsListLoading}
                canForced={isAdmin}
                onConfirm={handleAssignDS}
                onCancel={() => setAssignModalOpen(false)}
            />
        </PageContainer>
    );
};

export default TargetDetail;
