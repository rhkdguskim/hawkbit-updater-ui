import React, { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { Typography, Card, message, Alert, Space, Tag, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    TargetTable,
    TargetSearchBar,
    DeleteTargetModal,
    TargetFormModal,
    AssignDSModal,
    BulkAssignTagsModal,
    BulkAssignTypeModal,
    SavedFiltersModal,
} from './components';
import type { AssignPayload } from './components';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
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
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import type { MgmtTag, MgmtTargetType } from '@/api/generated/model';

const { Title } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow: hidden;
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
    const location = useLocation();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation('targets');

    // Pagination & Sorting State
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [sort, setSort] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>(() => {
        const params = new URLSearchParams(location.search);
        return params.get('q') || '';
    });
    const [selectedTagName, setSelectedTagName] = useState<string | undefined>(undefined);
    const [selectedTypeName, setSelectedTypeName] = useState<string | undefined>(undefined);
    const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
    const [bulkTagsModalOpen, setBulkTagsModalOpen] = useState(false);
    const [bulkTypeModalOpen, setBulkTypeModalOpen] = useState(false);
    const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);
    const [activeSavedFilter, setActiveSavedFilter] = useState<{ id?: number; name?: string; query: string } | null>(null);
    const [searchResetSignal, setSearchResetSignal] = useState(0);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);
    const [tableScrollY, setTableScrollY] = useState<number | undefined>(undefined);

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [targetToDelete, setTargetToDelete] = useState<MgmtTarget | null>(null);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [targetToAssign, setTargetToAssign] = useState<MgmtTarget | null>(null);

    // Sync URL query param to state
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q !== null && q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [location.search]);

    // Calculate offset for API
    const offset = (pagination.current - 1) * pagination.pageSize;

    useLayoutEffect(() => {
        if (!tableContainerRef.current) {
            return;
        }
        const element = tableContainerRef.current;
        const updateHeight = () => {
            const height = element.getBoundingClientRect().height;
            const scrollHeight = Math.max(240, Math.floor(height - 72));
            setTableScrollY(scrollHeight);
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // FR-06: Target Tags
    const { data: tagsData } = useGetTargetTags(
        { limit: 100 },
        { query: { staleTime: 60000 } }
    );

    // Get target types for filters
    const { data: typesData } = useGetTargetTypes(
        { limit: 100 },
        { query: { staleTime: 60000 } }
    );

    // Build search query combining manual search, tag filter, type filter
    const buildFinalQuery = useCallback(() => {
        const queries: string[] = [];
        if (searchQuery) queries.push(searchQuery);
        if (selectedTagName) queries.push(`tag.name==${selectedTagName}`);
        if (selectedTypeName) queries.push(`targettype.name==${selectedTypeName}`);
        return queries.length > 0 ? queries.join(';') : undefined;
    }, [searchQuery, selectedTagName, selectedTypeName]);

    // API Queries
    const {
        data: targetsData,
        isLoading: targetsLoading,
        isFetching: targetsFetching,
        error: targetsError,
        refetch: refetchTargets,
    } = useGetTargets(
        {
            offset,
            limit: pagination.pageSize,
            sort: sort || undefined,
            q: buildFinalQuery(),
        },
        {
            query: {
                placeholderData: keepPreviousData,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        }
    );

    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets(
        { limit: 100 },
        { query: { enabled: assignModalOpen } }
    );

    // Mutations
    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSuccess'));
                setDeleteModalOpen(false);
                setTargetToDelete(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error) => {
                const errMsg = (error as Error).message || t('messages.deleteFailed');
                if (errMsg.includes('409')) {
                    message.error(t('messages.conflict', { ns: 'common' }));
                } else {
                    message.error(errMsg);
                }
            },
        },
    });

    const createTargetMutation = useCreateTargets({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.createSuccess'));
                setFormModalOpen(false);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error) => {
                const errMsg = (error as Error).message || t('messages.createFailed');
                if (errMsg.includes('409')) {
                    message.error(t('messages.targetExists'));
                } else {
                    message.error(errMsg);
                }
            },
        },
    });

    const assignDSMutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.assignSuccess'));
                setAssignModalOpen(false);
                setTargetToAssign(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            },
            onError: (error) => {
                message.error((error as Error).message || t('messages.error', { ns: 'common' }));
            },
        },
    });

    // Handlers
    const handlePaginationChange = useCallback((page?: number, pageSize?: number) => {
        setPagination((prev) => ({
            current: page ?? prev.current,
            pageSize: pageSize ?? prev.pageSize,
        }));
    }, []);

    const handleSortChange = useCallback((field: string, order: 'ASC' | 'DESC' | null) => {
        if (order) {
            setSort(`${field}:${order}`);
        } else {
            setSort('');
        }
    }, []);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
        setActiveSavedFilter(null);
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
        (payload: AssignPayload) => {
            if (targetToAssign?.controllerId) {
                const assignment: MgmtDistributionSetAssignment = {
                    id: payload.dsId,
                    type: payload.type as MgmtDistributionSetAssignment['type'],
                    confirmationRequired: payload.confirmationRequired,
                    weight: payload.weight,
                    forcetime: payload.forcetime,
                    maintenanceWindow: payload.maintenanceWindow,
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
                    {t('title')}
                </Title>
            </HeaderRow>

            <Card
                style={{ flex: 1, height: '100%', overflow: 'hidden' }}
                styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
            >
                <TargetSearchBar
                    onSearch={handleSearch}
                    onRefresh={() => refetchTargets()}
                    onAddTarget={handleAddTarget}
                    canAddTarget={isAdmin}
                    loading={targetsLoading || targetsFetching}
                    onOpenSavedFilters={() => setSavedFiltersOpen(true)}
                    resetSignal={searchResetSignal}
                />

                {(activeSavedFilter || searchQuery || selectedTagName || selectedTypeName) && (
                    <Space style={{ marginBottom: 16 }} wrap>
                        {activeSavedFilter && (
                            <Tag
                                color="blue"
                                closable
                                onClose={() => {
                                    setActiveSavedFilter(null);
                                    setSearchQuery('');
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                    setSearchResetSignal((prev) => prev + 1);
                                }}
                            >
                                {t('filters.savedFilter', { name: activeSavedFilter.name || activeSavedFilter.query })}
                            </Tag>
                        )}
                        {!activeSavedFilter && searchQuery && (
                            <Tooltip title={searchQuery}>
                                <Tag
                                    color="blue"
                                    closable
                                    onClose={() => {
                                        setSearchQuery('');
                                        setPagination((prev) => ({ ...prev, current: 1 }));
                                        setSearchResetSignal((prev) => prev + 1);
                                    }}
                                >
                                    {t('filters.query')}
                                </Tag>
                            </Tooltip>
                        )}
                        {selectedTagName && (
                            <Tag
                                color="gold"
                                closable
                                onClose={() => {
                                    setSelectedTagName(undefined);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                            >
                                {t('filters.tag', { name: selectedTagName })}
                            </Tag>
                        )}
                        {selectedTypeName && (
                            <Tag
                                color="purple"
                                closable
                                onClose={() => {
                                    setSelectedTypeName(undefined);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                            >
                                {t('filters.type', { name: selectedTypeName })}
                            </Tag>
                        )}
                        <Button
                            size="small"
                            onClick={() => {
                                setActiveSavedFilter(null);
                                setSearchQuery('');
                                setSelectedTagName(undefined);
                                setSelectedTypeName(undefined);
                                setPagination((prev) => ({ ...prev, current: 1 }));
                                setSearchResetSignal((prev) => prev + 1);
                            }}
                        >
                            {t('filters.clearAll')}
                        </Button>
                    </Space>
                )}

                {selectedTargetIds.length > 0 && (
                    <Space style={{ marginTop: 16, marginBottom: 16 }} wrap>
                        <span style={{ marginRight: 8 }}>
                            {t('bulkAssign.selectedCount', { count: selectedTargetIds.length })}
                        </span>
                        <Button onClick={() => setBulkTagsModalOpen(true)}>
                            {t('bulkAssign.assignTag')}
                        </Button>
                        <Button onClick={() => setBulkTypeModalOpen(true)}>
                            {t('bulkAssign.assignType')}
                        </Button>
                    </Space>
                )}

                <div ref={tableContainerRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <TargetTable
                        data={targetsData?.content || []}
                        loading={targetsLoading || targetsFetching}
                        total={targetsData?.total || 0}
                        pagination={pagination}
                        scrollY={tableScrollY}
                        onPaginationChange={handlePaginationChange}
                        onSortChange={handleSortChange}
                        onView={handleViewTarget}
                        onDelete={handleDeleteClick}
                        canDelete={isAdmin}
                        rowSelection={{
                            selectedRowKeys: selectedTargetIds,
                            onChange: (keys: React.Key[]) => setSelectedTargetIds(keys as string[]),
                        }}
                        availableTags={(tagsData?.content as MgmtTag[]) || []}
                        availableTypes={(typesData?.content as MgmtTargetType[]) || []}
                        filters={{ tagName: selectedTagName, typeName: selectedTypeName }}
                        onFilterChange={(filters) => {
                            setSelectedTagName(filters.tagName);
                            setSelectedTypeName(filters.typeName);
                            setPagination(prev => ({ ...prev, current: 1 }));
                        }}
                    />
                </div>
            </Card>

            <BulkAssignTagsModal
                open={bulkTagsModalOpen}
                targetIds={selectedTargetIds}
                onCancel={() => setBulkTagsModalOpen(false)}
                onSuccess={() => {
                    setBulkTagsModalOpen(false);
                    setSelectedTargetIds([]); // Clear selection after success
                    queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
                }}
            />

            <BulkAssignTypeModal
                open={bulkTypeModalOpen}
                targetIds={selectedTargetIds}
                onCancel={() => setBulkTypeModalOpen(false)}
                onSuccess={() => {
                    setBulkTypeModalOpen(false);
                    setSelectedTargetIds([]); // Clear selection after success
                    queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
                }}
            />

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

            <SavedFiltersModal
                open={savedFiltersOpen}
                canEdit={isAdmin}
                onApply={(filter) => {
                    setSearchQuery(filter.query || '');
                    setActiveSavedFilter({
                        id: filter.id,
                        name: filter.name,
                        query: filter.query || '',
                    });
                    setPagination((prev) => ({ ...prev, current: 1 }));
                    setSearchResetSignal((prev) => prev + 1);
                    setSavedFiltersOpen(false);
                }}
                onClose={() => setSavedFiltersOpen(false)}
            />
        </PageContainer>
    );
};

export default TargetList;
