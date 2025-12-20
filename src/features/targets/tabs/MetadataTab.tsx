import React from 'react';
import { Table, Typography, Skeleton, Empty, Button, Space, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { PagedListMgmtMetadata, MgmtMetadata } from '@/api/generated/model';

const { Text } = Typography;

interface MetadataTabProps {
    data: PagedListMgmtMetadata | null | undefined;
    loading: boolean;
    canEdit?: boolean;
    onAdd?: () => void;
    onEdit?: (metadata: MgmtMetadata) => void;
    onDelete?: (metadata: MgmtMetadata) => void;
}

const MetadataTab: React.FC<MetadataTabProps> = ({
    data,
    loading,
    canEdit = false,
    onAdd,
    onEdit,
    onDelete,
}) => {
    if (loading) {
        return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    const metadata = data?.content || [];

    if (metadata.length === 0 && !canEdit) {
        return <Empty description="No metadata found" />;
    }

    const columns: TableProps<MgmtMetadata>['columns'] = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            width: 250,
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text: string) => (
                <Text copyable style={{ wordBreak: 'break-all' }}>
                    {text || '-'}
                </Text>
            ),
        },
    ];

    // Add actions column if canEdit
    if (canEdit) {
        columns.push({
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit?.(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete?.(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        });
    }

    return (
        <>
            {canEdit && (
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                        Add Metadata
                    </Button>
                </div>
            )}
            <Table<MgmtMetadata>
                columns={columns}
                dataSource={metadata}
                rowKey="key"
                pagination={metadata.length > 10 ? { pageSize: 10 } : false}
                size="middle"
                locale={{ emptyText: <Empty description="No metadata. Click 'Add Metadata' to create." /> }}
            />
        </>
    );
};

export default MetadataTab;
