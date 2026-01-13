import React, { useState, useCallback } from 'react';
import { Button, message } from 'antd';
import { EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import {
    OverviewTab,
    ActionsTab,
    AttributesTab,
    MetadataTab,
    DistributionSetTab,
    TagsTab,
} from './tabs';
import {
    DeleteTargetModal,
    TargetFormModal,
    AssignDSModal,
    MetadataFormModal,
    DeleteMetadataModal,
} from './components';
import type { AssignPayload } from './components';
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
    useCreateMetadata,
    useUpdateMetadata,
    useDeleteMetadata,
    getGetTargetQueryKey,
    getGetMetadataQueryKey,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtDistributionSetAssignment, MgmtDistributionSetAssignments, MgmtMetadata } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StandardDetailLayout } from '@/components/layout';

const TargetDetail: React.FC = () => {
    const { id: targetId, tab: tabParam } = useParams<{ id: string; tab?: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const baseTabs = ['overview', 'actions', 'attributes', 'distribution', 'metadata', 'tags'];
    const availableTabs = baseTabs;
    const activeTab = availableTabs.includes(tabParam || '') ? (tabParam as string) : 'overview';

    const handleTabChange = useCallback((nextTab: string) => {
        if (!targetId) return;
        const nextPath = nextTab === 'overview'
            ? `/targets/${targetId}`
            : `/targets/${targetId}/${nextTab}`;
        navigate(nextPath);
    }, [navigate, targetId]);

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);

    // Metadata Modal States
    const [metadataFormOpen, setMetadataFormOpen] = useState(false);
    const [metadataFormMode, setMetadataFormMode] = useState<'create' | 'edit'>('create');
    const [metadataToEdit, setMetadataToEdit] = useState<MgmtMetadata | null>(null);
    const [deleteMetadataOpen, setDeleteMetadataOpen] = useState(false);
    const [metadataToDelete, setMetadataToDelete] = useState<MgmtMetadata | null>(null);

    // API Queries - Lazy loading based on active tab
    const {
        data: targetData,
        isLoading: targetLoading,
        error: targetError,
    } = useGetTarget(targetId!, {
        query: {
            enabled: !!targetId,
            refetchInterval: 10000, // 10s polling for general target info
        }
    });

    const { data: attributesData, isLoading: attributesLoading } = useGetAttributes(targetId!, {
        query: { enabled: !!targetId && activeTab === 'attributes' },
    });

    const { data: actionsData, isLoading: actionsLoading } = useGetActionHistory(
        targetId!,
        { limit: 50 },
        {
            query: {
                enabled: !!targetId && activeTab === 'actions',
                refetchInterval: 3000, // 3s polling for actions history
            }
        }
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
        {
            query: {
                enabled: !!targetId && activeTab === 'distribution',
                refetchInterval: 5000,
            }
        }
    );

    const { data: assignedDSData, isLoading: assignedDSLoading } = useGetAssignedDistributionSet(
        targetId!,
        {
            query: {
                enabled: !!targetId && activeTab === 'distribution',
                refetchInterval: 5000,
            }
        }
    );

    const { data: autoConfirmData, isLoading: autoConfirmLoading } = useGetAutoConfirmStatus(
        targetId!,
        { query: { enabled: !!targetId } }
    );

    const { data: dsListData, isLoading: dsListLoading } = useGetDistributionSets(
        { limit: 100 },
        { query: { enabled: assignModalOpen } }
    );

    // Mutations
    const updateTargetMutation = useUpdateTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess'));
                setEditModalOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetQueryKey(targetId) });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSuccess'));
                navigate('/targets');
            },
            onError: (error) => {
                message.error((error as Error).message || t('messages.deleteFailed'));
            },
        },
    });

    const assignDSMutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.assignSuccess'));
                setAssignModalOpen(false);
                queryClient.invalidateQueries();
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const activateAutoConfirmMutation = useActivateAutoConfirm({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.autoConfirmActivated'));
                queryClient.invalidateQueries();
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const deactivateAutoConfirmMutation = useDeactivateAutoConfirm({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.autoConfirmDeactivated'));
                queryClient.invalidateQueries();
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    // Metadata Mutations
    const createMetadataMutation = useCreateMetadata({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.metadataCreateSuccess'));
                setMetadataFormOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetMetadataQueryKey(targetId) });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const updateMetadataMutation = useUpdateMetadata({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.metadataUpdateSuccess'));
                setMetadataFormOpen(false);
                setMetadataToEdit(null);
                queryClient.invalidateQueries({ queryKey: getGetMetadataQueryKey(targetId) });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const deleteMetadataMutation = useDeleteMetadata({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.metadataDeleteSuccess'));
                setDeleteMetadataOpen(false);
                setMetadataToDelete(null);
                queryClient.invalidateQueries({ queryKey: getGetMetadataQueryKey(targetId) });
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
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
        (payload: AssignPayload) => {
            if (targetId) {
                const assignment: MgmtDistributionSetAssignment = {
                    id: payload.dsId,
                    type: payload.type as MgmtDistributionSetAssignment['type'],
                    confirmationRequired: payload.confirmationRequired,
                    weight: payload.weight,
                    forcetime: payload.forcetime,
                    maintenanceWindow: payload.maintenanceWindow,
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

    // Metadata Handlers
    const handleAddMetadata = useCallback(() => {
        setMetadataFormMode('create');
        setMetadataToEdit(null);
        setMetadataFormOpen(true);
    }, []);

    const handleEditMetadata = useCallback((metadata: MgmtMetadata) => {
        setMetadataFormMode('edit');
        setMetadataToEdit(metadata);
        setMetadataFormOpen(true);
    }, []);

    const handleDeleteMetadataClick = useCallback((metadata: MgmtMetadata) => {
        setMetadataToDelete(metadata);
        setDeleteMetadataOpen(true);
    }, []);

    const handleMetadataSubmit = useCallback(
        (values: { key: string; value: string }) => {
            if (!targetId) return;

            if (metadataFormMode === 'create') {
                createMetadataMutation.mutate({
                    targetId,
                    data: [{ key: values.key, value: values.value }],
                });
            } else if (metadataToEdit) {
                updateMetadataMutation.mutate({
                    targetId,
                    metadataKey: metadataToEdit.key,
                    data: { value: values.value },
                });
            }
        },
        [targetId, metadataFormMode, metadataToEdit, createMetadataMutation, updateMetadataMutation]
    );

    const handleConfirmDeleteMetadata = useCallback(() => {
        if (targetId && metadataToDelete) {
            deleteMetadataMutation.mutate({
                targetId,
                metadataKey: metadataToDelete.key,
            });
        }
    }, [targetId, metadataToDelete, deleteMetadataMutation]);



    // Error State
    if (targetError) {
        return (
            <StandardDetailLayout
                breadcrumbs={[
                    { label: t('list.title'), path: '/targets' },
                    { label: targetId || '' },
                ]}
                title={t('detail.notFoundTitle')}
                backLabel={t('detail.backToTargets')}
                onBack={() => navigate('/targets')}
                useCardWrapper={false}
            >
                <div />
            </StandardDetailLayout>
        );
    }

    const tabItems = [
        {
            key: 'overview',
            label: t('detail.tabs.overview'),
            children: (
                <OverviewTab
                    target={targetData}
                    loading={targetLoading}
                    autoConfirmData={autoConfirmData}
                    autoConfirmLoading={autoConfirmLoading}
                    canEditAutoConfirm={isAdmin}
                    onActivateAutoConfirm={handleActivateAutoConfirm}
                    onDeactivateAutoConfirm={handleDeactivateAutoConfirm}
                    autoConfirmActionLoading={
                        activateAutoConfirmMutation.isPending ||
                        deactivateAutoConfirmMutation.isPending
                    }
                />
            ),
        },
        {
            key: 'actions',
            label: t('detail.tabs.actions'),
            children: (
                <ActionsTab
                    data={actionsData}
                    loading={actionsLoading}
                    targetId={targetId ?? ''}
                    canForce={isAdmin}
                    canCancel={isAdmin}
                />
            ),
        },
        {
            key: 'attributes',
            label: t('detail.tabs.attributes'),
            children: <AttributesTab data={attributesData} loading={attributesLoading} />,
        },
        {
            key: 'distribution',
            label: t('detail.tabs.distribution'),
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
            label: t('detail.tabs.metadata'),
            children: (
                <MetadataTab
                    data={metadataData}
                    loading={metadataLoading}
                    canEdit={isAdmin}
                    onAdd={handleAddMetadata}
                    onEdit={handleEditMetadata}
                    onDelete={handleDeleteMetadataClick}
                />
            ),
        },
        {
            key: 'tags',
            label: t('detail.tabs.tags'),
            children: <TagsTab data={tagsData} loading={tagsLoading} />,
        },
    ];

    const headerActions = (
        <>
            <Button
                icon={<SendOutlined />}
                onClick={() => setAssignModalOpen(true)}
            >
                {t('detail.assignDS')}
            </Button>
            {isAdmin && (
                <>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => setEditModalOpen(true)}
                    >
                        {t('actions.edit', { ns: 'common' })}
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        {t('actions.delete', { ns: 'common' })}
                    </Button>
                </>
            )}
        </>
    );

    return (
        <StandardDetailLayout
            breadcrumbs={[
                { label: t('list.title'), path: '/targets' },
                { label: targetId || '' },
            ]}
            title={targetData?.name || targetId}
            description={targetData?.description || t('detail.description')}
            backLabel={t('actions.back', { ns: 'common' })}
            onBack={() => navigate('/targets')}
            loading={targetLoading}
            actions={headerActions}
            tabs={tabItems}
            activeTabKey={activeTab}
            onTabChange={handleTabChange}
            fullHeight
        >

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

            {/* Metadata Modals */}
            <MetadataFormModal
                open={metadataFormOpen}
                mode={metadataFormMode}
                metadata={metadataToEdit}
                loading={createMetadataMutation.isPending || updateMetadataMutation.isPending}
                onSubmit={handleMetadataSubmit}
                onCancel={() => {
                    setMetadataFormOpen(false);
                    setMetadataToEdit(null);
                }}
            />

            <DeleteMetadataModal
                open={deleteMetadataOpen}
                metadata={metadataToDelete}
                loading={deleteMetadataMutation.isPending}
                onConfirm={handleConfirmDeleteMetadata}
                onCancel={() => {
                    setDeleteMetadataOpen(false);
                    setMetadataToDelete(null);
                }}
            />
        </StandardDetailLayout>
    );
};

export default TargetDetail;
