import React from 'react';
import {
    Descriptions,
    Typography,
    Skeleton,
    Empty,
    Button,
    Card,
    Tag,
    Alert,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { MgmtTargetAutoConfirm } from '@/api/generated/model';
import dayjs from 'dayjs';

const { Text } = Typography;

interface AutoConfirmTabProps {
    data: MgmtTargetAutoConfirm | null | undefined;
    loading: boolean;
    canEdit?: boolean;
    onActivate?: () => void;
    onDeactivate?: () => void;
    actionLoading?: boolean;
}

const AutoConfirmTab: React.FC<AutoConfirmTabProps> = ({
    data,
    loading,
    canEdit = false,
    onActivate,
    onDeactivate,
    actionLoading,
}) => {
    if (loading) {
        return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    if (!data) {
        return <Empty description="AutoConfirm status not available" />;
    }

    const isActive = data.active;

    return (
        <Card>
            <Alert
                type={isActive ? 'success' : 'info'}
                message={
                    isActive
                        ? 'AutoConfirm is Active'
                        : 'AutoConfirm is Inactive'
                }
                description={
                    isActive
                        ? 'All actions will be automatically confirmed without manual intervention.'
                        : 'Actions require manual confirmation before execution.'
                }
                showIcon
                icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                style={{ marginBottom: 24 }}
            />

            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Status">
                    <Tag
                        icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                        color={isActive ? 'success' : 'default'}
                    >
                        {isActive ? 'Enabled' : 'Disabled'}
                    </Tag>
                </Descriptions.Item>
                {data.initiator && (
                    <Descriptions.Item label="Activated By">
                        <Text>{data.initiator}</Text>
                    </Descriptions.Item>
                )}
                {data.remark && (
                    <Descriptions.Item label="Remark">
                        <Text>{data.remark}</Text>
                    </Descriptions.Item>
                )}
                {data.activatedAt && (
                    <Descriptions.Item label="Activated At">
                        {dayjs(data.activatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                )}
            </Descriptions>

            {canEdit && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    {isActive ? (
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={onDeactivate}
                            loading={actionLoading}
                        >
                            Deactivate AutoConfirm
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            onClick={onActivate}
                            loading={actionLoading}
                        >
                            Activate AutoConfirm
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
};

export default AutoConfirmTab;
