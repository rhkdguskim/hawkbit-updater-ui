import React from 'react';
import { Descriptions, Typography, Skeleton, Empty, Tag, Card, List, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import type { MgmtDistributionSet } from '@/api/generated/model';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface DistributionSetTabProps {
    installedDS: MgmtDistributionSet | null | undefined;
    assignedDS: MgmtDistributionSet | null | undefined;
    loading: boolean;
    onAssign?: () => void;
    canAssign?: boolean;
}

const DSCard: React.FC<{ ds: MgmtDistributionSet | null | undefined; title: string; type: 'installed' | 'assigned' }> = ({
    ds,
    title,
    type,
}) => {
    if (!ds) {
        return (
            <Card title={title} style={{ marginBottom: 16 }}>
                <Empty description={`No ${type} distribution set`} />
            </Card>
        );
    }

    return (
        <Card
            title={
                <>
                    {title}
                    {type === 'installed' && <Tag color="green" style={{ marginLeft: 8 }}>Current</Tag>}
                    {type === 'assigned' && <Tag color="blue" style={{ marginLeft: 8 }}>Pending</Tag>}
                </>
            }
            style={{ marginBottom: 16 }}
        >
            <Descriptions column={2} size="small">
                <Descriptions.Item label="Name">
                    <Text strong>{ds.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Version">
                    <Tag color="cyan">v{ds.version}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                    {ds.description || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                    {ds.type ? <Tag>{ds.type}</Tag> : <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Required Migration">
                    <Tag color={ds.requiredMigrationStep ? 'orange' : 'default'}>
                        {ds.requiredMigrationStep ? 'Yes' : 'No'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                    {ds.createdAt ? dayjs(ds.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Modules">
                    {ds.modules?.length || 0} module(s)
                </Descriptions.Item>
            </Descriptions>

            {ds.modules && ds.modules.length > 0 && (
                <>
                    <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
                        Software Modules
                    </Title>
                    <List
                        size="small"
                        dataSource={ds.modules}
                        renderItem={(module) => (
                            <List.Item>
                                <Text>{module.name}</Text>
                                <Tag style={{ marginLeft: 8 }}>{module.type}</Tag>
                                <Tag color="blue">v{module.version}</Tag>
                            </List.Item>
                        )}
                    />
                </>
            )}
        </Card>
    );
};

const DistributionSetTab: React.FC<DistributionSetTabProps> = ({
    installedDS,
    assignedDS,
    loading,
    onAssign,
    canAssign,
}) => {
    if (loading) {
        return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    const hasAnyDS = installedDS || assignedDS;

    return (
        <>
            {canAssign && (
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<SyncOutlined />}
                        onClick={onAssign}
                    >
                        Assign Distribution Set
                    </Button>
                </div>
            )}

            {!hasAnyDS && !canAssign ? (
                <Empty description="No distribution sets configured" />
            ) : (
                <>
                    <DSCard ds={installedDS} title="Installed Distribution Set" type="installed" />
                    <DSCard ds={assignedDS} title="Assigned Distribution Set" type="assigned" />
                </>
            )}
        </>
    );
};

export default DistributionSetTab;
