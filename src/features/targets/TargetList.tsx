import React, { useState, useCallback } from 'react';
import { Typography, Card, message, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    TargetTable,
    TargetSearchBar,
    DeleteTargetModal,
    TargetFormModal,
    AssignDSModal,
} from './components';
import type { AssignType } from './components';
import {
    useGetTargets,
    useDeleteTarget,
    useCreateTargets,
    usePostAssignedDistributionSet,
    getGetTargetsQueryKey,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtTarget, MgmtDistributionSetAssignments, MgmtDistributionSetAssignment } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

const { Title } = Typography;

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

const TargetList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // Pagination & Sorting State
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [sort, setSort] = useState<string>('lastModifiedAt:DESC');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [targetToDelete, setTargetToDelete] = useState<MgmtTarget | null>(null);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetToAssign, setTargetToAssign] = useState<MgmtTarget | null>(null);

    // Calculate offset for API
    const offset = (pagination.current - 1) * pagination.pageSize;

    // API Queries
    const {
        data: targetsData,
        isLoading: targetsLoading,
        error: targetsError,
        refetch: refetchTargets,
    } = useGetTargets({
        offset,
        limit: pagination.pageSize,
        sort,
        q: searchQuery || undefined,
    });

    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets(
        { limit: 100 },
        { query: { enabled: assignModalOpen } }
    );

    // Mutations
    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success('Target deleted successfully');
                setDeleteModalOpen(false);
                setTargetToDelete(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error) => {
                const errMsg = (error as Error).message || 'Failed to delete target';
                if (errMsg.includes('409')) {
                    message.error('Conflict: Target was modified. Please refresh and try again.');
                } else {
                    message.error(errMsg);
                }
            },
        },
    });

    const createTargetMutation = useCreateTargets({
        mutation: {
            onSuccess: () => {
                message.success('Target created successfully');
                setFormModalOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error) => {
                const errMsg = (error as Error).message || 'Failed to create target';
                if (errMsg.includes('409')) {
                    message.error('Target with this Controller ID already exists');
                } else {
                    message.error(errMsg);
                }
            },
        },
    });

    const assignDSMutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success('Distribution Set assigned successfully');
                setAssignModalOpen(false);
                setTargetToAssign(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to assign distribution set');
            },
        },
    });

    // Handlers
    const handlePaginationChange = useCallback((page: number, pageSize: number) => {
        setPagination({ current: page, pageSize });
    }, []);

    const handleSortChange = useCallback((field: string, order: 'ASC' | 'DESC' | null) => {
        if (order) {
            setSort(`${field}:${order}`);
        } else {
            setSort('lastModifiedAt:DESC');
        }
    }, []);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    }, []);

    const handleViewTarget = useCallback(
        (target: MgmtTarget) => {
            navigate(`/targets/${target.controllerId}`);
        },
        [navigate]
    );

    const handleDeleteClick = useCallback((target: MgmtTarget) => {
        setTargetToDelete(target);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (targetToDelete?.controllerId) {
            deleteTargetMutation.mutate({ targetId: targetToDelete.controllerId });
        }
    }, [targetToDelete, deleteTargetMutation]);

    const handleAddTarget = useCallback(() => {
        setFormModalOpen(true);
    }, []);

    const handleCreateTarget = useCallback(
        (values: { controllerId?: string; name?: string; description?: string }) => {
            if (values.controllerId) {
                createTargetMutation.mutate({
                    data: [
                        {
                            controllerId: values.controllerId,
                            name: values.name || values.controllerId, // name is required, default to controllerId
                            description: values.description,
                        },
                    ],
                });
            }
        },
        [createTargetMutation]
    );

    const handleAssignDS = useCallback(
        (dsId: number, type: AssignType) => {
            if (targetToAssign?.controllerId) {
                const assignment: MgmtDistributionSetAssignment = {
                    id: dsId,
                    type: type as MgmtDistributionSetAssignment['type'],
                };
                assignDSMutation.mutate({
                    targetId: targetToAssign.controllerId,
                    data: [assignment] as MgmtDistributionSetAssignments,
                });
            }
        },
        [targetToAssign, assignDSMutation]
    );

    if (targetsError) {
        return (
            <Alert
                type="error"
                message="Failed to load targets"
                description={(targetsError as Error).message}
                showIcon
            />
        );
    }

    return (
        <PageContainer>
            <HeaderRow>
                <Title level={2} style={{ margin: 0 }}>
                    Target Management
                </Title>
            </HeaderRow>

            <Card>
                <TargetSearchBar
                    onSearch={handleSearch}
                    onRefresh={() => refetchTargets()}
                    onAddTarget={handleAddTarget}
                    canAddTarget={isAdmin}
                    loading={targetsLoading}
                />

                <TargetTable
                    data={targetsData?.content || []}
                    loading={targetsLoading}
                    total={targetsData?.total || 0}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                    onSortChange={handleSortChange}
                    onView={handleViewTarget}
                    onDelete={handleDeleteClick}
                    canDelete={isAdmin}
                />
            </Card>

            {/* Delete Modal */}
            <DeleteTargetModal
                open={deleteModalOpen}
                target={targetToDelete}
                loading={deleteTargetMutation.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setTargetToDelete(null);
                }}
            />

            {/* Create Target Modal */}
            <TargetFormModal
                open={formModalOpen}
                mode="create"
                loading={createTargetMutation.isPending}
                onSubmit={handleCreateTarget}
                onCancel={() => setFormModalOpen(false)}
            />

            {/* Assign DS Modal */}
            <AssignDSModal
                open={assignModalOpen}
                targetId={targetToAssign?.controllerId ?? ''}
                distributionSets={dsData?.content || []}
                loading={assignDSMutation.isPending}
                dsLoading={dsLoading}
                canForced={isAdmin}
                onConfirm={handleAssignDS}
                onCancel={() => {
                    setAssignModalOpen(false);
                    setTargetToAssign(null);
                }}
            />
        </PageContainer>
    );
};

export default TargetList;
