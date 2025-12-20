import React from 'react';
import { Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ActivityLog {
    id: string;
    timestamp: number;
    type: 'action' | 'rollout';
    entityId: number;
    event: string;
    user: string;
    status: string;
}

const ActivityLogs: React.FC = () => {
    // This is a placeholder as hawkBit doesn't have a single unified "Activity Log" API 
    // that captures all high-level job events in one go easily without separate requests.
    // In a real app, this might pull from a custom backend or audit log API.

    const mockLogs: ActivityLog[] = [
        { id: '1', timestamp: Date.now() - 1000 * 60 * 5, type: 'action', entityId: 101, event: 'Status Changed', user: 'admin', status: 'finished' },
        { id: '2', timestamp: Date.now() - 1000 * 60 * 15, type: 'rollout', entityId: 50, event: 'Started', user: 'admin', status: 'running' },
        { id: '3', timestamp: Date.now() - 1000 * 60 * 60, type: 'action', entityId: 102, event: 'Created', user: 'operator', status: 'pending' },
    ];

    const columns = [
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (ts: number) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
            width: 180,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'action' ? 'blue' : 'purple'}>{type.toUpperCase()}</Tag>
            ),
            width: 100,
        },
        {
            title: 'ID',
            dataIndex: 'entityId',
            key: 'entityId',
            width: 80,
        },
        {
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user: string) => <Text strong>{user}</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'finished' ? 'green' : 'orange'}>{status.toUpperCase()}</Tag>
            ),
        }
    ];

    return (
        <div style={{ padding: '16px 0' }}>
            <Table
                dataSource={mockLogs}
                columns={columns}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default ActivityLogs;
