import React from 'react';
import { Card, Table, Typography, Spin, Alert, Tag, Space, Button } from 'antd';
import { ReloadOutlined, LockOutlined } from '@ant-design/icons';
import { useGetTenantConfiguration } from '@/api/generated/system-configuration/system-configuration';
import { useAuthStore } from '@/stores/useAuthStore';
import { Navigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Configuration key descriptions
const configDescriptions: Record<string, string> = {
    'pollingTime': 'Default polling interval for targets (HH:mm:ss)',
    'pollingOverdueTime': 'Time after which a target is considered offline (HH:mm:ss)',
    'authentication.targettoken.enabled': 'Enable Target Token authentication',
    'authentication.gatewaytoken.enabled': 'Enable Gateway Token authentication',
    'rollout.approval.enabled': 'Require approval for rollouts',
    'repository.actions.autoclose.enabled': 'Automatically close finished actions',
    'maintenanceWindowPollCount': 'Number of polls during maintenance window',
    'anonymous.download.enabled': 'Allow anonymous artifact downloads',
    'multi.assignments.enabled': 'Enable multiple distribution set assignments',
    'batch.assignments.enabled': 'Enable batch assignments',
    'action.cleanup.enabled': 'Enable automatic action cleanup',
    'action.cleanup.actionExpiry': 'Action expiry time for cleanup',
    'action.cleanup.actionStatus': 'Action statuses to clean up',
};

const formatValue = (value: unknown): React.ReactNode => {
    if (typeof value === 'boolean') {
        return (
            <Tag color={value ? 'success' : 'default'}>
                {value ? 'Enabled' : 'Disabled'}
            </Tag>
        );
    }
    if (value === null || value === undefined) {
        return <Text type="secondary">-</Text>;
    }
    if (Array.isArray(value)) {
        return value.join(', ') || '-';
    }
    return String(value);
};

const Configuration: React.FC = () => {
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const { data, isLoading, error, refetch } = useGetTenantConfiguration();

    // Admin only access
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (isLoading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <Alert
                    type="error"
                    message="Failed to load configuration"
                    description="Unable to fetch system configuration. Please check your permissions."
                    showIcon
                />
            </div>
        );
    }

    // Transform config data to table format
    const configData = data ? Object.entries(data).map(([key, value]) => ({
        key,
        value: (value as { value?: unknown })?.value ?? value,
        description: configDescriptions[key] || key,
    })) : [];

    const columns = [
        {
            title: 'Configuration Key',
            dataIndex: 'key',
            key: 'key',
            width: '35%',
            render: (key: string) => <Text code>{key}</Text>,
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            width: '25%',
            render: formatValue,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <Title level={2} style={{ margin: 0 }}>System Configuration</Title>
                        <Tag icon={<LockOutlined />} color="blue">Read-only</Tag>
                    </Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        Refresh
                    </Button>
                </div>

                <Card>
                    <Table
                        dataSource={configData}
                        columns={columns}
                        pagination={false}
                        rowKey="key"
                    />
                </Card>
            </Space>
        </div>
    );
};

export default Configuration;
