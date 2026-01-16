import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagOutlined, AppstoreOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Space, message } from 'antd';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import {
    DeleteTargetModal,
    TargetFormModal,
    AssignDSModal,
    BulkAssignTagsModal,
    BulkAssignTypeModal,
    BulkDeleteTargetModal,
    BulkAutoConfirmModal,
    TargetDetailDrawer,
} from './components';
import { DataView, EnhancedTable, FilterBuilder, type ToolbarAction } from '@/components/patterns';
import { useTargetListModel } from './hooks/useTargetListModel';
import { getTargetColumns } from './config/targetListConfig';
import type { MgmtTarget } from '@/api/generated/model';


const TargetList: React.FC = () => {
    const navigate = useNavigate();
    const model = useTargetListModel();
    const { isAdmin, t } = model;


    // Handle detail navigation
    const handleViewDetail = useCallback((target: MgmtTarget) => {
        navigate(`/targets/${target.controllerId}`);
    }, [navigate]);

    // Column options for FilterBuilder (moved to model)

    // UI-only derived values
    const selectionActions: ToolbarAction[] = useMemo(() => {
        const actions: ToolbarAction[] = [
            {
                key: 'assignTags',
                label: t('bulkAssign.assignTag'),
                icon: <TagOutlined />,
                onClick: () => model.setBulkTagsModalOpen(true),
            },
            {
                key: 'assignType',
                label: t('bulkAssign.assignType'),
                icon: <AppstoreOutlined />,
                onClick: () => model.setBulkTypeModalOpen(true),
            },
            {
                key: 'activateAutoConfirm',
                label: t('autoConfirm.activate'),
                icon: <CheckCircleOutlined />,
                onClick: () => {
                    model.setBulkAutoConfirmMode('activate');
                    model.setBulkAutoConfirmModalOpen(true);
                },
            },
            {
                key: 'deactivateAutoConfirm',
                label: t('autoConfirm.deactivate'),
                icon: <StopOutlined />,
                onClick: () => {
                    model.setBulkAutoConfirmMode('deactivate');
                    model.setBulkAutoConfirmModalOpen(true);
                },
            },
        ];
        if (isAdmin) {
            actions.push({
                key: 'delete',
                label: t('bulkDelete.button', { defaultValue: 'Delete' }),
                icon: <DeleteOutlined />,
                onClick: () => model.setBulkDeleteModalOpen(true),
                danger: true,
            });
        }
        return actions;
    }, [t, isAdmin, model]);

    const columns = useMemo(() => getTargetColumns({
        t,
        isAdmin,
        availableTypes: model.availableTypes,
        visibleColumns: model.visibleColumns,
        onView: handleViewDetail,
        onDelete: (target) => model.handleDeleteClick(target),
        onCopySecurityToken: (token) => {
            navigator.clipboard.writeText(token);
            message.success(t('common:actions.copied', { defaultValue: 'Copied!' }));
        },
    }), [t, isAdmin, model.availableTypes, model.visibleColumns, handleViewDetail, model]);

    return (
        <StandardListLayout
            title={t('list.title')}
            description={t('list.description')}
            searchBar={
                <FilterBuilder
                    fields={model.filterFields}
                    filters={model.filters}
                    onFiltersChange={model.handleFiltersChange}
                    onRefresh={() => model.refetchTargets()}
                    onAdd={model.handleAddTarget}
                    canAdd={isAdmin}
                    addLabel={t('actions.addTarget')}
                    loading={model.targetsLoading || model.targetsFetching}
                    buildQuery={model.buildFinalQuery}
                    // Integrated Column Customization
                    columns={model.columnOptions}
                    visibleColumns={model.visibleColumns}
                    onVisibilityChange={model.setVisibleColumns}
                />
            }
        >
            <DataView
                loading={model.targetsLoading}
                error={model.targetsError as Error}
                isEmpty={model.targetsData.length === 0}
                emptyText={t('noTargets')}
            >
                <EnhancedTable<MgmtTarget>
                    columns={columns}
                    dataSource={model.targetsData}
                    rowKey="controllerId"
                    loading={model.targetsLoading || model.targetsFetching}
                    selectedRowKeys={model.selectedTargetIds}
                    onSelectionChange={(keys) => model.setSelectedTargetIds(keys)}
                    selectionActions={selectionActions}
                    selectionLabel={t('filter.selected', { ns: 'common' })}
                    pagination={false}
                    onChange={model.handleTableChange}
                    scroll={{ x: 1340 }}
                    locale={{ emptyText: t('noTargets') }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleViewDetail(record),
                    })}
                    onFetchNextPage={model.fetchNextPage}
                    hasNextPage={model.hasNextPage}
                    isFetchingNextPage={model.isFetchingNextPage}
                />
            </DataView>

            {/* Existing Modals */}
            <BulkAssignTagsModal
                open={model.bulkTagsModalOpen}
                targetIds={model.selectedTargetIds as string[]}
                onCancel={() => model.setBulkTagsModalOpen(false)}
                onSuccess={() => {
                    model.setBulkTagsModalOpen(false);
                    model.setSelectedTargetIds([]);
                    model.refetchTargets();
                }}
            />

            <BulkAssignTypeModal
                open={model.bulkTypeModalOpen}
                targetIds={model.selectedTargetIds as string[]}
                onCancel={() => model.setBulkTypeModalOpen(false)}
                onSuccess={() => {
                    model.setBulkTypeModalOpen(false);
                    model.setSelectedTargetIds([]);
                    model.refetchTargets();
                }}
            />

            <BulkDeleteTargetModal
                open={model.bulkDeleteModalOpen}
                targetIds={model.selectedTargetIds as string[]}
                onCancel={() => model.setBulkDeleteModalOpen(false)}
                onSuccess={() => {
                    model.setBulkDeleteModalOpen(false);
                    model.setSelectedTargetIds([]);
                    model.refetchTargets();
                }}
            />

            <DeleteTargetModal
                open={model.deleteModalOpen}
                target={model.targetToDelete}
                loading={model.deletePending}
                onConfirm={model.handleDeleteConfirm}
                onCancel={() => {
                    model.setDeleteModalOpen(false);
                }}
            />

            <TargetFormModal
                open={model.formModalOpen}
                mode={model.editingTarget ? 'edit' : 'create'}
                target={model.editingTarget}
                loading={model.createPending}
                onSubmit={model.handleCreateTarget}
                onCancel={() => {
                    model.setFormModalOpen(false);
                }}
            />

            <AssignDSModal
                open={model.assignModalOpen}
                targetId={model.targetToAssign?.controllerId ?? ''}
                distributionSets={model.dsData?.content || []}
                loading={model.assignPending}
                dsLoading={model.dsLoading}
                canForced={isAdmin}
                searchTerm={model.dsSearch}
                onSearch={model.handleDsSearch}
                onlyCompatible={model.onlyCompatible}
                onCompatibleChange={model.handleCompatibleChange}
                hasTargetType={!!model.targetToAssign?.targetTypeName}
                onConfirm={model.handleAssignDS}
                onCancel={() => {
                    model.setAssignModalOpen(false);
                }}
            />



            {/* New Phase 2-6 Modals */}
            <BulkAutoConfirmModal
                open={model.bulkAutoConfirmModalOpen}
                targetIds={model.selectedTargetIds as string[]}
                mode={model.bulkAutoConfirmMode}
                t={t}
                onCancel={() => model.setBulkAutoConfirmModalOpen(false)}
                onSuccess={() => {
                    model.setBulkAutoConfirmModalOpen(false);
                    model.setSelectedTargetIds([]);
                    model.refetchTargets();
                }}
            />

            <TargetDetailDrawer
                open={model.detailDrawerOpen}
                target={model.drawerTarget}
                loading={false}
                t={t}
                onClose={() => {
                    model.setDetailDrawerOpen(false);
                    model.setDrawerTarget(null);
                }}
            />

        </StandardListLayout>
    );
};

export default TargetList;

