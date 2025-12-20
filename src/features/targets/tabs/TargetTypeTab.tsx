import React, { useState } from 'react';
import {
    Card,
    Typography,
    Skeleton,
    Empty,
    Button,
    Space,
    Descriptions,
    Tag,
    Modal,
    Select,
    message,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { MgmtTarget, MgmtTargetType } from '@/api/generated/model';
import {
    useGetTargetTypes,
} from '@/api/generated/target-types/target-types';

const { Title, Text } = Typography;

interface TargetTypeTabProps {
    target: MgmtTarget | null | undefined;
    loading: boolean;
    canEdit?: boolean;
    onAssign: (targetTypeId: number) => void;
    onUnassign: () => void;
    actionLoading?: boolean;
}

const TargetTypeTab: React.FC<TargetTypeTabProps> = ({
    target,
    loading,
    canEdit = false,
    onAssign,
    onUnassign,
    actionLoading = false,
}) => {
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [unassignModalOpen, setUnassignModalOpen] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

    // Fetch target types when modal is open
    const { data: targetTypesData, isLoading: typesLoading } = useGetTargetTypes(
        { limit: 100 },
        { query: { enabled: assignModalOpen } }
    );

    if (loading) {
        return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    const currentType = target?.targetType as (MgmtTargetType & { name?: string }) | undefined;

    const handleAssign = () => {
        if (selectedTypeId) {
            onAssign(selectedTypeId);
            setAssignModalOpen(false);
            setSelectedTypeId(null);
        } else {
            message.warning('Please select a target type');
        }
    };

    const handleUnassign = () => {
        onUnassign();
        setUnassignModalOpen(false);
    };

    return (
        <>
            <Card>
                {currentType ? (
                    <>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Space align="center">
                                <Title level={5} style={{ margin: 0 }}>Current Target Type</Title>
                                <Tag color="blue">{currentType.name}</Tag>
                            </Space>

                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="ID">
                                    {currentType.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Name">
                                    {currentType.name || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Description">
                                    {currentType.description || '-'}
                                </Descriptions.Item>
                            </Descriptions>

                            {canEdit && (
                                <Space>
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => setAssignModalOpen(true)}
                                    >
                                        Change Type
                                    </Button>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => setUnassignModalOpen(true)}
                                    >
                                        Remove Type
                                    </Button>
                                </Space>
                            )}
                        </Space>
                    </>
                ) : (
                    <Empty
                        description={
                            <Space direction="vertical" align="center">
                                <Text>No target type assigned</Text>
                                {canEdit && (
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setAssignModalOpen(true)}
                                    >
                                        Assign Target Type
                                    </Button>
                                )}
                            </Space>
                        }
                    />
                )}
            </Card>

            {/* Assign Target Type Modal */}
            <Modal
                title="Assign Target Type"
                open={assignModalOpen}
                onOk={handleAssign}
                onCancel={() => {
                    setAssignModalOpen(false);
                    setSelectedTypeId(null);
                }}
                confirmLoading={actionLoading}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text>Select a target type to assign:</Text>
                    <Select
                        placeholder="Select target type"
                        style={{ width: '100%' }}
                        loading={typesLoading}
                        value={selectedTypeId}
                        onChange={setSelectedTypeId}
                        options={targetTypesData?.content?.map((type) => ({
                            value: type.id,
                            label: (
                                <Space>
                                    <span>{type.name}</span>
                                    {type.description && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            - {type.description}
                                        </Text>
                                    )}
                                </Space>
                            ),
                        }))}
                    />
                </Space>
            </Modal>

            {/* Unassign Confirmation Modal */}
            <Modal
                title="Remove Target Type"
                open={unassignModalOpen}
                onOk={handleUnassign}
                onCancel={() => setUnassignModalOpen(false)}
                okText="Remove"
                okButtonProps={{ danger: true }}
                confirmLoading={actionLoading}
            >
                <p>
                    Are you sure you want to remove the target type{' '}
                    <Text strong>"{currentType?.name}"</Text> from this target?
                </p>
            </Modal>
        </>
    );
};

export default TargetTypeTab;
