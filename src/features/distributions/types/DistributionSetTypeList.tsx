import React, { useState, useMemo, useCallback } from 'react';
import { Tag, message, Modal } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetDistributionSetTypes,
    useDeleteDistributionSetType,
} from '@/api/generated/distribution-set-types/distribution-set-types';
import type { MgmtDistributionSetType } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import DistributionSetTypeDialog from './DistributionSetTypeDialog';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createDateColumn } from '@/utils/columnFactory';
import { StrongSmallText } from '@/components/shared/Typography';

const DistributionSetTypeList: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtDistributionSetType | null>(null);
    const [filters, setFilters] = useState<FilterValue[]>([]);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, isFetching, refetch } = useGetDistributionSetTypes({
        offset,
        limit: pagination.pageSize,
    });

    // Filter fields
    const filterFields: FilterField[] = useMemo(() => [
        { key: 'name', label: t('common:table.name'), type: 'text' },
        { key: 'key', label: t('typeManagement.columns.key'), type: 'text' },
        { key: 'description', label: t('common:table.description'), type: 'text' },
    ], [t]);

    const handleFiltersChange = useCallback((newFilters: FilterValue[]) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, current: 1 }));
    }, []);

    const deleteMutation = useDeleteDistributionSetType({
        mutation: {
            onSuccess: () => {
                message.success(t('typeManagement.deleteSuccess'));
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || t('typeManagement.deleteError'));
            },
        },
    });

    const handleDelete = (record: MgmtDistributionSetType) => {
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ distributionSetTypeId: record.id }),
        });
    };

    const handleEdit = (record: MgmtDistributionSetType) => {
        setEditingType(record);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingType(null);
    };

    const handleDialogSuccess = () => {
        handleDialogClose();
        refetch();
    };

    const handleTableChange: TableProps<MgmtDistributionSetType>['onChange'] = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        }));
    };

    const columns: ColumnsType<MgmtDistributionSetType> = useMemo(() => [
        createIdColumn<MgmtDistributionSetType>(t),
        {
            title: t('common:table.name'),
            dataIndex: 'name',
            key: 'name',
            width: 180,
            sorter: true,
            render: (text: string) => <StrongSmallText>{text}</StrongSmallText>,
        },
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            render: (text: string) => <Tag style={{ fontSize: 'var(--ant-font-size-sm)', margin: 0 }}>{text}</Tag>,
        },
        createDescriptionColumn<MgmtDistributionSetType>({ t }),
        createColorColumn<MgmtDistributionSetType>({ t }),
        createDateColumn<MgmtDistributionSetType>({ t, dataIndex: 'lastModifiedAt' }),
        createActionsColumn<MgmtDistributionSetType>({
            t,
            onEdit: handleEdit,
            onDelete: handleDelete,
            canEdit: isAdmin,
            canDelete: isAdmin,
        }),
    ], [t, isAdmin]);

    return (
        <StandardListLayout
            title={t('typeManagement.dsTypeTitle')}
            description={t('typeManagement.dsTypeDescription', { defaultValue: 'Manage distribution set types' })}
            searchBar={
                <FilterBuilder
                    fields={filterFields}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onRefresh={() => refetch()}
                    onAdd={isAdmin ? () => {
                        setEditingType(null);
                        setDialogOpen(true);
                    } : undefined}
                    canAdd={isAdmin}
                    addLabel={t('typeManagement.addType')}
                    loading={isLoading || isFetching}
                />
            }
        >
            <DataView
                loading={isLoading}
                error={null}
                isEmpty={data?.content?.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtDistributionSetType>
                    columns={columns}
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
                    scroll={{ x: 800 }}
                />
            </DataView>

            <DistributionSetTypeDialog
                open={dialogOpen}
                editingType={editingType}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </StandardListLayout>
    );
};

export default DistributionSetTypeList;
