import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tabs, Table, Button, message, Space, Tag } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import {
    useGetDistributionSet,
    useGetAssignedSoftwareModules,
    useAssignSoftwareModules,
} from '@/api/generated/distribution-sets/distribution-sets';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';
import AssignModuleModal from './components/AssignModuleModal';
import SetMetadataTab from './components/SetMetadataTab';
import SetTagsTab from './components/SetTagsTab';
import type { MgmtSoftwareModuleAssignment, MgmtSoftwareModule } from '@/api/generated/model';
import type { TableProps } from 'antd';

const DistributionSetDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const distributionSetId = parseInt(id || '0', 10);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [activeTab, setActiveTab] = useState('overview');
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);

    // Fetch Distribution Set Details
    const { data: setData, isLoading: isSetLoading } = useGetDistributionSet(distributionSetId);

    // Fetch Assigned Modules
    const {
        data: assignedModulesData,
        isLoading: isModulesLoading,
        refetch: refetchModules
    } = useGetAssignedSoftwareModules(distributionSetId);

    // Assign Mutation
    const assignMutation = useAssignSoftwareModules({
        mutation: {
            onSuccess: () => {
                message.success('Modules assigned successfully');
                setIsAssignModalVisible(false);
                refetchModules();
            },
            onError: (error) => {
                message.error((error as Error).message || 'Failed to assign modules');
            },
        },
    });

    const handleAssignModules = (moduleIds: number[]) => {
        const assignments: MgmtSoftwareModuleAssignment[] = moduleIds.map((id) => ({ id }));
        assignMutation.mutate({ distributionSetId, data: assignments });
    };

    // Note: HawkBit API documentation for removing an assigned module from a DS is specific.
    // Usually it involves updating the list of assigned modules or a specific DELETE endpoint.
    // Based on the generated client, we might not have a direct unassign endpoint exposed easily or it might be 'deleteAssignedSoftwareModule' which I should check.
    // For now, I will omit the unassign button if I'm not sure, or verify if assign replaces the list.
    // The `assignSoftwareModules` (POST) usually adds to the list or replaces it?
    // REST API usually: POST adds, PUT replaces.
    // Let's assume for now we just show the list. Unassigning might require more investigation on the specific API endpoint.

    const overviewTab = (
        <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{setData?.name}</Descriptions.Item>
            <Descriptions.Item label="Version">{setData?.version}</Descriptions.Item>
            <Descriptions.Item label="Type">{setData?.typeName}</Descriptions.Item>
            <Descriptions.Item label="Description">{setData?.description}</Descriptions.Item>
            <Descriptions.Item label="Required Migration Step">
                <Tag color={setData?.requiredMigrationStep ? 'red' : 'green'}>
                    {setData?.requiredMigrationStep ? 'Yes' : 'No'}
                </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Functionally Complete">
                <Tag color={setData?.complete ? 'success' : 'warning'}>
                    {setData?.complete ? 'Yes' : 'No'}
                </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created By">{setData?.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Created At">
                {setData?.createdAt ? format(setData.createdAt, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Modified By">{setData?.lastModifiedBy}</Descriptions.Item>
            <Descriptions.Item label="Last Modified At">
                {setData?.lastModifiedAt ? format(setData.lastModifiedAt, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Descriptions.Item>
        </Descriptions>
    );

    const columns: TableProps<MgmtSoftwareModule>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <a onClick={() => navigate(`/distributions/modules/${record.id}`)}>{text}</a>
            )
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

    const modulesTab = (
        <div>
            {isAdmin && (
                <div style={{ marginBottom: 16 }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAssignModalVisible(true)}
                    >
                        Assign Module
                    </Button>
                </div>
            )}
            <Table
                dataSource={assignedModulesData?.content || []}
                rowKey="id"
                loading={isModulesLoading}
                pagination={false}
                columns={columns}
            />
            <AssignModuleModal
                visible={isAssignModalVisible}
                onCancel={() => setIsAssignModalVisible(false)}
                onAssign={handleAssignModules}
                isAssigning={assignMutation.isPending}
                // Exclude already assigned modules to prevent duplicates if necessary,
                // though backend might handle it.
                excludedModuleIds={assignedModulesData?.content?.map((m) => m.id).filter((id): id is number => id !== undefined) || []}
            />
        </div>
    );

    return (
        <Card
            title={
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/distributions/sets')} type="text" />
                    {setData?.name} <Tag color="blue">{setData?.version}</Tag>
                </Space>
            }
            loading={isSetLoading}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    { key: 'overview', label: 'Overview', children: overviewTab },
                    { key: 'modules', label: 'Assigned Modules', children: modulesTab },
                    { key: 'metadata', label: 'Metadata', children: <SetMetadataTab distributionSetId={distributionSetId} isAdmin={isAdmin} /> },
                    { key: 'tags', label: 'Tags', children: <SetTagsTab distributionSetId={distributionSetId} isAdmin={isAdmin} /> },
                ]}
            />
        </Card>
    );
};

export default DistributionSetDetail;
