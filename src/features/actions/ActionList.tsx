import React, { useState } from 'react';
import { Card, Table, Tag, Space, Button, Select, Typography, Input } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetActions } from '@/api/generated/actions/actions';
import type { MgmtAction } from '@/api/generated/model';
import type { TableProps } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'finished':
            return 'success';
        case 'error':
            return 'error';
        case 'running':
            return 'processing';
        case 'pending':
            return 'default';
        case 'canceled':
            return 'warning';
        case 'canceling':
            return 'warning';
        case 'wait_for_confirmation':
            return 'purple';
        default:
            return 'default';
    }
};

const ActionList: React.FC = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const offset = (pagination.current - 1) * pagination.pageSize;

    // Build query filter
    const buildQuery = () => {
        const filters: string[] = [];
        if (statusFilter) {
            filters.push(`status==${statusFilter}`);
        }
        if (searchQuery) {
            filters.push(`target.name==*${searchQuery}*`);
        }
        return filters.length > 0 ? filters.join(';') : undefined;
    };

    const { data, isLoading, refetch } = useGetActions({
        offset,
        limit: pagination.pageSize,
        q: buildQuery(),
    });

    const columns: TableProps<MgmtAction>['columns'] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: string) => (
                <Tag color={type === 'forced' ? 'red' : 'blue'}>
                    {type?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Distribution Set',
            key: 'distributionSet',
            render: (_, record) => (
                <span>
                    {record._links?.distributionset?.name || '-'}
                </span>
            ),
        },
        {
            title: 'Force Type',
            dataIndex: 'forceType',
            key: 'forceType',
            width: 100,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => navigate(`/actions/${record.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    const handleTableChange: TableProps<MgmtAction>['onChange'] = (paginationConfig) => {
        setPagination({
            current: paginationConfig.current || 1,
            pageSize: paginationConfig.pageSize || 20,
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>Actions</Title>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        Refresh
                    </Button>
                </div>

                <Card>
                    <Space style={{ marginBottom: 16 }} wrap>
                        <Input
                            placeholder="Search by target..."
                            prefix={<SearchOutlined />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onPressEnter={() => refetch()}
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder="Filter by status"
                            value={statusFilter || undefined}
                            onChange={setStatusFilter}
                            allowClear
                            style={{ width: 180 }}
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="running">Running</Option>
                            <Option value="finished">Finished</Option>
                            <Option value="error">Error</Option>
                            <Option value="canceled">Canceled</Option>
                            <Option value="wait_for_confirmation">Wait for Confirmation</Option>
                        </Select>
                        <Button onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('');
                        }}>
                            Clear Filters
                        </Button>
                    </Space>

                    <Table
                        dataSource={data?.content || []}
                        columns={columns}
                        rowKey="id"
                        loading={isLoading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: data?.total || 0,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} actions`,
                        }}
                        onChange={handleTableChange}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default ActionList;
