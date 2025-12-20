import React, { useState, useCallback } from 'react';
import { Table, Card, Tag, Tooltip, Space, Button, message, Modal } from 'antd';
import type { TableProps } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
    useGetDistributionSets,
    useDeleteDistributionSet,
} from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtDistributionSet } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';
import DistributionSearchBar from './components/DistributionSearchBar';
import CreateDistributionSetModal from './components/CreateDistributionSetModal';
import { format } from 'date-fns';

const DistributionSetList: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    // Pagination & Sorting State
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [sort, setSort] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    // Calculate offset for API
    const offset = (pagination.current - 1) * pagination.pageSize;

    // API Query
    const {
        data,
        isLoading,
        refetch,
    } = useGetDistributionSets({
        offset,
        limit: pagination.pageSize,
        sort: sort || undefined,
        q: searchQuery || undefined,
    });

    // Delete Mutation
    const deleteMutation = useDeleteDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success('Distribution Set deleted successfully');
                refetch();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to delete Distribution Set');
            },
        },
    });

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Distribution Set',
            content: 'Are you sure you want to delete this Distribution Set?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => deleteMutation.mutate({ distributionSetId: id }),
        });
    };

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    const handleTableChange: TableProps<MgmtDistributionSet>['onChange'] = (
        newPagination,
        _,
        sorter
    ) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 20,
        }));

        if (Array.isArray(sorter)) {
            // Handle multiple sorters if needed
        } else if (sorter.field && sorter.order) {
            const field = sorter.field as string;
            const order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
            setSort(`${field}:${order}`);
        } else {
            setSort('');
        }
    };

    const columns: TableProps<MgmtDistributionSet>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text, record) => (
                <a onClick={() => navigate(`/distributions/sets/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
            sorter: true,
        },
        {
            title: 'Type',
            dataIndex: 'typeName',
            key: 'typeName',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Completeness',
            dataIndex: 'complete',
            key: 'complete',
            render: (complete: boolean) => (
                <Tag color={complete ? 'success' : 'warning'}>
                    {complete ? 'Complete' : 'Incomplete'}
                </Tag>
            ),
        },
        {
            title: 'Last Modified',
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            sorter: true,
            width: 180,
            render: (val: number) => (val ? format(val, 'yyyy-MM-dd HH:mm') : '-'),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/distributions/sets/${record.id}`)}
                        />
                    </Tooltip>
                    {isAdmin && (
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record.id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <DistributionSearchBar
                type="set"
                onSearch={handleSearch}
                onRefresh={refetch}
                onAdd={() => setIsCreateModalVisible(true)}
                canAdd={isAdmin}
                loading={isLoading}
            />
            <Table
                columns={columns}
                dataSource={data?.content || []}
                rowKey="id"
                pagination={{
                    ...pagination,
                    total: data?.total || 0,
                    showSizeChanger: true,
                }}
                loading={isLoading}
                onChange={handleTableChange}
            />
            <CreateDistributionSetModal
                visible={isCreateModalVisible}
                onCancel={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    setIsCreateModalVisible(false);
                    refetch();
                }}
            />
        </Card>
    );
};

export default DistributionSetList;
