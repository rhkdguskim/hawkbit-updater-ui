import React, { useState } from 'react';
import { Card, Table, Tag, Space, Button, Select, Typography, Progress } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';
import type { TableProps } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'finished':
            return 'success';
        case 'running':
            return 'processing';
        case 'paused':
            return 'warning';
        case 'ready':
            return 'cyan';
        case 'creating':
            return 'default';
        case 'starting':
            return 'blue';
        case 'error':
            return 'error';
        case 'waiting_for_approval':
            return 'purple';
        default:
            return 'default';
    }
};

const RolloutList: React.FC = () => {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [statusFilter, setStatusFilter] = useState<string>('');

    const offset = (pagination.current - 1) * pagination.pageSize;

    const { data, isLoading, refetch } = useGetRollouts({
        offset,
        limit: pagination.pageSize,
        q: statusFilter ? `status==${statusFilter}` : undefined,
    });

    const columns: TableProps<MgmtRolloutResponseBody>['columns'] = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase().replace(/_/g, ' ')}
                </Tag>
            ),
        },
        {
            title: 'Total Targets',
            dataIndex: 'totalTargets',
            key: 'totalTargets',
            width: 120,
        },
        {
            title: 'Progress',
            key: 'progress',
            width: 200,
            render: (_, record) => {
                const total = record.totalTargets || 0;
                const finished = (record.totalTargetsPerStatus as Record<string, number>)?.finished || 0;
                const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                return (
                    <Progress
                        percent={percent}
                        size="small"
                        status={record.status === 'error' ? 'exception' : undefined}
                    />
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => navigate(`/rollouts/${record.id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    const handleTableChange: TableProps<MgmtRolloutResponseBody>['onChange'] = (paginationConfig) => {
        setPagination({
            current: paginationConfig.current || 1,
            pageSize: paginationConfig.pageSize || 20,
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={2} style={{ margin: 0 }}>Rollouts</Title>
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
                        <Select
                            placeholder="Filter by status"
                            value={statusFilter || undefined}
                            onChange={setStatusFilter}
                            allowClear
                            style={{ width: 200 }}
                        >
                            <Option value="creating">Creating</Option>
                            <Option value="ready">Ready</Option>
                            <Option value="starting">Starting</Option>
                            <Option value="running">Running</Option>
                            <Option value="paused">Paused</Option>
                            <Option value="finished">Finished</Option>
                            <Option value="error">Error</Option>
                            <Option value="waiting_for_approval">Waiting for Approval</Option>
                        </Select>
                        <Button onClick={() => setStatusFilter('')}>
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
                            showTotal: (total) => `Total ${total} rollouts`,
                        }}
                        onChange={handleTableChange}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default RolloutList;
