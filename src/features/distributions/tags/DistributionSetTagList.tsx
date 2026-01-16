import React, { useMemo, useCallback } from 'react';
import { message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetDistributionSetTags,
    useDeleteDistributionSetTag,
    useCreateDistributionSetTags,
    useUpdateDistributionSetTag,
} from '@/api/generated/distribution-set-tags/distribution-set-tags';
import type { MgmtTag } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { TagFormModal } from '@/components/common';
import type { TagFormValues } from '@/components/common';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createTagNameColumn, createDateColumn } from '@/utils/columnFactory';
import { useListFilterStore } from '@/stores/useListFilterStore';
import { useServerTable } from '@/hooks/useServerTable';

interface DistributionSetTagListProps {
    standalone?: boolean;
}

const DistributionSetTagList: React.FC<DistributionSetTagListProps> = ({ standalone = true }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // List Filter Store Integration
    const {
        distributionSetTags: persistentState,
        setDistributionSetTags: setPersistentState
    } = useListFilterStore();

    const { filters, visibleColumns } = persistentState;

    const setFilters = useCallback((newFilters: FilterValue[]) => {
        setPersistentState({ filters: newFilters });
    }, [setPersistentState]);

    const setVisibleColumns = useCallback((columns: string[]) => {
        setPersistentState({ visibleColumns: columns });
    }, [setPersistentState]);

    const {
        pagination,
        offset,
        handleTableChange,
        resetPagination,
    } = useServerTable<MgmtTag>({ syncToUrl: standalone });

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingTag, setEditingTag] = React.useState<MgmtTag | null>(null);

    const { data, isLoading, isFetching, refetch } = useGetDistributionSetTags({
        offset,
        limit: pagination.pageSize,
    });

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('common:table.name'), type: 'text' },
        { key: 'description', label: t('common:table.description'), type: 'text' },
    ], [t]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        resetPagination();
    }, [resetPagination, setFilters]);

    const deleteMutation = useDeleteDistributionSetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.deleteSuccess'));
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || t('tagManagement.deleteError'));
            },
        },
    });

    const handleDelete = (record: MgmtTag) => {
        Modal.confirm({
            title: t('tagManagement.deleteConfirmTitle'),
            content: t('tagManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ distributionsetTagId: record.id }),
        });
    };

    const handleEdit = (record: MgmtTag) => {
        setEditingTag(record);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingTag(null);
    };

    const createMutation = useCreateDistributionSetTags({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.createSuccess'));
                handleDialogClose();
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || t('tagManagement.createError'));
            },
        },
    });

    const updateMutation = useUpdateDistributionSetTag({
        mutation: {
            onSuccess: () => {
                message.success(t('tagManagement.updateSuccess'));
                handleDialogClose();
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || t('tagManagement.updateError'));
            },
        },
    });

    const handleSubmit = (values: TagFormValues) => {
        if (editingTag) {
            updateMutation.mutate({
                distributionsetTagId: editingTag.id,
                data: {
                    name: values.name,
                    description: values.description,
                    colour: values.colour,
                },
            });
        } else {
            createMutation.mutate({
                data: [{
                    name: values.name,
                    description: values.description,
                    colour: values.colour,
                }],
            });
        }
    };

    const columns: ColumnsType<MgmtTag> = useMemo(() => [
        createIdColumn<MgmtTag>(t),
        createTagNameColumn<MgmtTag>({ t }),
        createDescriptionColumn<MgmtTag>({ t }),
        createColorColumn<MgmtTag>({
            t,
            editable: isAdmin,
            onUpdate: async (record, newColor) => {
                await updateMutation.mutateAsync({
                    distributionsetTagId: record.id,
                    data: {
                        name: record.name,
                        description: record.description,
                        colour: newColor,
                    },
                });
            }
        }),
        createDateColumn<MgmtTag>({ t, dataIndex: 'lastModifiedAt' }),
        createActionsColumn<MgmtTag>({
            t,
            onEdit: handleEdit,
            onDelete: handleDelete,
            canEdit: isAdmin,
            canDelete: isAdmin,
        }),
    ], [t, isAdmin]);

    // Handle column visibility
    const displayColumns = useMemo(() => {
        if (!visibleColumns || visibleColumns.length === 0) return columns;
        return columns.filter(col =>
            col.key === 'actions' || visibleColumns.includes(col.key as string)
        );
    }, [columns, visibleColumns]);

    const columnOptions = useMemo(() => [
        { key: 'id', label: t('common:table.id'), defaultVisible: false },
        { key: 'name', label: t('common:table.name'), defaultVisible: true },
        { key: 'description', label: t('common:table.description'), defaultVisible: true },
        { key: 'colour', label: t('common:table.color'), defaultVisible: true },
        { key: 'lastModifiedAt', label: t('common:table.lastModified'), defaultVisible: true },
    ], [t]);

    const listContent = (
        <>
            <div style={{ marginBottom: 16 }}>
                <FilterBuilder
                    fields={filterFields}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onRefresh={() => refetch()}
                    onAdd={isAdmin ? () => {
                        setEditingTag(null);
                        setDialogOpen(true);
                    } : undefined}
                    canAdd={isAdmin}
                    addLabel={t('tagManagement.addTag')}
                    loading={isLoading || isFetching}
                    columns={columnOptions}
                    visibleColumns={visibleColumns}
                    onVisibilityChange={setVisibleColumns}
                />
            </div>
            <DataView
                loading={isLoading}
                error={null}
                isEmpty={data?.content?.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtTag>
                    columns={displayColumns}
                    dataSource={data?.content || []}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        total: data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        position: ['topRight'],
                    }}
                    loading={isLoading}
                    onChange={handleTableChange}
                    scroll={{ x: 700 }}
                />
            </DataView>

            <TagFormModal
                open={dialogOpen}
                mode={editingTag ? 'edit' : 'create'}
                initialData={editingTag}
                loading={createMutation.isPending || updateMutation.isPending}
                onSubmit={handleSubmit}
                onCancel={handleDialogClose}
                translations={{
                    createTitle: t('tagManagement.addTag'),
                    editTitle: t('tagManagement.editTag'),
                    nameLabel: t('common:table.name'),
                    namePlaceholder: t('tagManagement.namePlaceholder'),
                    nameRequired: t('common:validation.required'),
                    descriptionLabel: t('common:table.description'),
                    descriptionPlaceholder: t('tagManagement.descriptionPlaceholder'),
                    colourLabel: t('common:table.color'),
                    cancelText: t('common:actions.cancel'),
                }}
            />
        </>
    );

    if (!standalone) {
        return (
            <div style={{ marginTop: 16 }}>
                {listContent}
            </div>
        );
    }

    return (
        <StandardListLayout
            title={t('tagManagement.title')}
            description={t('tagManagement.description', { defaultValue: 'Manage distribution set tags' })}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default DistributionSetTagList;
