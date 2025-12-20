import React, { useState } from 'react';
import { Modal, Table, message } from 'antd';
import type { TableProps } from 'antd';
import { useGetSoftwareModules } from '@/api/generated/software-modules/software-modules';
import type { MgmtSoftwareModule } from '@/api/generated/model';
import DistributionSearchBar from './DistributionSearchBar';

interface AssignModuleModalProps {
    visible: boolean;
    onCancel: () => void;
    onAssign: (moduleIds: number[]) => void;
    isAssigning: boolean;
    excludedModuleIds?: number[];
}

const AssignModuleModal: React.FC<AssignModuleModalProps> = ({
    visible,
    onCancel,
    onAssign,
    isAssigning,
    excludedModuleIds = [],
}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data: modulesData, isLoading } = useGetSoftwareModules({
        offset,
        limit: pagination.pageSize,
        q: searchQuery || undefined,
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleOk = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one module');
            return;
        }
        onAssign(selectedRowKeys as number[]);
        setSelectedRowKeys([]);
    };

    const handleCancel = () => {
        setSelectedRowKeys([]);
        onCancel();
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record: MgmtSoftwareModule) => ({
            disabled: excludedModuleIds.includes(record.id),
        }),
    };

    const columns: TableProps<MgmtSoftwareModule>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: 'Type',
            dataIndex: 'typeName',
            key: 'typeName',
        },
        {
            title: 'Vendor',
            dataIndex: 'vendor',
            key: 'vendor',
        },
    ];

    return (
        <Modal
            title="Assign Software Modules"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={isAssigning}
            width={800}
            destroyOnHidden
        >
            <DistributionSearchBar
                type="module"
                onSearch={handleSearch}
                onRefresh={() => { }}
                canAdd={false}
            />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={modulesData?.content || []}
                rowKey="id"
                pagination={{
                    ...pagination,
                    total: modulesData?.total || 0,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
                loading={isLoading}
                size="small"
                style={{ marginTop: 16 }}
            />
        </Modal>
    );
};

export default AssignModuleModal;
