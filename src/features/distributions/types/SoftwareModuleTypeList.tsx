import React, { useState, useMemo, useCallback } from 'react';
import { Tag, message, Modal } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    useGetTypes,
    useDeleteSoftwareModuleType,
} from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleType } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { EnhancedTable, FilterBuilder, DataView, type FilterField, type FilterValue } from '@/components/patterns';
import { StandardListLayout } from '@/components/layout/StandardListLayout';
import SoftwareModuleTypeDialog from './SoftwareModuleTypeDialog';
import { createActionsColumn, createIdColumn, createDescriptionColumn, createColorColumn, createDateColumn, createColoredNameColumn } from '@/utils/columnFactory';
import { SmallText } from '@/components/shared/Typography';

interface SoftwareModuleTypeListProps {
    standalone?: boolean;
}

const SoftwareModuleTypeList: React.FC<SoftwareModuleTypeListProps> = ({ standalone = true }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<MgmtSoftwareModuleType | null>(null);
    const [filters, setFilters] = useState<FilterValue[]>([]);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, isFetching, refetch } = useGetTypes({
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

    const deleteMutation = useDeleteSoftwareModuleType({
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

    const handleDelete = (record: MgmtSoftwareModuleType) => {
        Modal.confirm({
            title: t('typeManagement.deleteConfirmTitle'),
            content: t('typeManagement.deleteConfirmDesc'),
            okText: t('common:actions.delete'),
            okType: 'danger',
            cancelText: t('common:actions.cancel'),
            onOk: () => deleteMutation.mutate({ softwareModuleTypeId: record.id }),
        });
    };

    const handleEdit = (record: MgmtSoftwareModuleType) => {
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

    const handleTableChange: TableProps<MgmtSoftwareModuleType>['onChange'] = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        }));
    };

    const columns: ColumnsType<MgmtSoftwareModuleType> = useMemo(() => [
        createIdColumn<MgmtSoftwareModuleType>(t),
        createColoredNameColumn<MgmtSoftwareModuleType>({ t }),
        {
            title: t('typeManagement.columns.key'),
            dataIndex: 'key',
            key: 'key',
            width: 150,
            render: (text: string) => <Tag style={{ fontSize: 'var(--ant-font-size-sm)', margin: 0 }}>{text}</Tag>,
        },
        createDescriptionColumn<MgmtSoftwareModuleType>({ t }),
        {
            title: t('typeManagement.columns.maxAssignments'),
            dataIndex: 'maxAssignments',
            key: 'maxAssignments',
            width: 100,
            render: (val: number) => <SmallText>{val ?? 1}</SmallText>,
        },
        createColorColumn<MgmtSoftwareModuleType>({ t }),
        createDateColumn<MgmtSoftwareModuleType>({ t, dataIndex: 'lastModifiedAt' }),
        createActionsColumn<MgmtSoftwareModuleType>({
            t,
            onEdit: handleEdit,
            onDelete: handleDelete,
            canEdit: isAdmin,
            canDelete: isAdmin,
        }),
    ], [t, isAdmin]);

    const listContent = (
        <>
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
            <DataView
                loading={isLoading}
                error={null}
                isEmpty={data?.content?.length === 0}
                emptyText={t('common:messages.noData')}
            >
                <EnhancedTable<MgmtSoftwareModuleType>
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
                    scroll={{ x: 900 }}
                />
            </DataView>

            <SoftwareModuleTypeDialog
                open={dialogOpen}
                editingType={editingType}
                onClose={handleDialogClose}
                onSuccess={handleDialogSuccess}
            />
        </>
    );

    if (!standalone) {
        return listContent;
    }

    return (
        <StandardListLayout
            title={t('typeManagement.smTypeTitle')}
            description={t('typeManagement.smTypeDescription', { defaultValue: 'Manage software module types' })}
        >
            {listContent}
        </StandardListLayout>
    );
};

export default SoftwareModuleTypeList;
