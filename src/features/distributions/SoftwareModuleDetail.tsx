import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tabs, Table, Button, Upload, message, Modal, Space, Tag, Tooltip } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined, FileOutlined, InboxOutlined } from '@ant-design/icons';
import {
    useGetSoftwareModule,
    useGetArtifacts,
    useUploadArtifact,
    useDeleteArtifact,
} from '@/api/generated/software-modules/software-modules';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';
import type { MgmtArtifact } from '@/api/generated/model';
import ModuleMetadataTab from './components/ModuleMetadataTab';

const SoftwareModuleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const softwareModuleId = parseInt(id || '0', 10);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch Module Details
    const { data: moduleData, isLoading: isModuleLoading } = useGetSoftwareModule(softwareModuleId);

    // Fetch Artifacts
    const { data: artifactsData, isLoading: isArtifactsLoading, refetch: refetchArtifacts } = useGetArtifacts(softwareModuleId);

    // Upload Artifact
    const uploadMutation = useUploadArtifact({
        mutation: {
            onSuccess: () => {
                message.success('Artifact uploaded successfully');
                refetchArtifacts();
            },
            onError: () => {
                message.error('Failed to upload artifact');
            },
        },
    });

    // Delete Artifact
    const deleteArtifactMutation = useDeleteArtifact({
        mutation: {
            onSuccess: () => {
                message.success('Artifact deleted successfully');
                refetchArtifacts();
            },
            onError: () => {
                message.error('Failed to delete artifact');
            },
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            await uploadMutation.mutateAsync({
                softwareModuleId,
                data: { file: file as Blob },
                params: { filename: (file as File).name },
            });
            onSuccess('ok');
        } catch (err) {
            onError({ err });
        }
    };

    const handleDeleteArtifact = (artifactId: number) => {
        Modal.confirm({
            title: 'Delete Artifact',
            content: 'Are you sure you want to delete this artifact?',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteArtifactMutation.mutate({ softwareModuleId, artifactId }),
        });
    };

    const overviewTab = (
        <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{moduleData?.name}</Descriptions.Item>
            <Descriptions.Item label="Version">{moduleData?.version}</Descriptions.Item>
            <Descriptions.Item label="Type">{moduleData?.typeName}</Descriptions.Item>
            <Descriptions.Item label="Vendor">{moduleData?.vendor}</Descriptions.Item>
            <Descriptions.Item label="Description">{moduleData?.description}</Descriptions.Item>
            <Descriptions.Item label="Created By">{moduleData?.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Created At">
                {moduleData?.createdAt ? format(moduleData.createdAt, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Modified By">{moduleData?.lastModifiedBy}</Descriptions.Item>
            <Descriptions.Item label="Last Modified At">
                {moduleData?.lastModifiedAt ? format(moduleData.lastModifiedAt, 'yyyy-MM-dd HH:mm:ss') : '-'}
            </Descriptions.Item>
        </Descriptions>
    );

    const artifactsTab = (
        <div>
            {isAdmin && (
                <Upload.Dragger
                    customRequest={handleUpload}
                    showUploadList={false}
                    style={{ marginBottom: 16 }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for single file upload. Drag and drop your artifact here.
                    </p>
                </Upload.Dragger>
            )}
            <Table
                dataSource={artifactsData}
                rowKey="id"
                loading={isArtifactsLoading}
                pagination={false}
                columns={[
                    {
                        title: 'Filename',
                        dataIndex: 'providedFilename',
                        key: 'providedFilename',
                        render: (text) => (
                            <Space>
                                <FileOutlined />
                                {text}
                            </Space>
                        ),
                    },
                    {
                        title: 'Size',
                        dataIndex: 'size',
                        key: 'size',
                        render: (size) => size ? `${(size / 1024).toFixed(2)} KB` : '-',
                    },
                    {
                        title: 'Hashes',
                        key: 'hashes',
                        render: (_, record: MgmtArtifact) => (
                            <Space direction="vertical" size="small">
                                <Tag>MD5: {record.hashes?.md5?.substring(0, 8)}...</Tag>
                                <Tag>SHA1: {record.hashes?.sha1?.substring(0, 8)}...</Tag>
                            </Space>
                        ),
                    },
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, record: MgmtArtifact) => (
                            <Space>
                                <Tooltip title="Download">
                                    <Button
                                        icon={<DownloadOutlined />}
                                        type="text"
                                        // This is a placeholder as direct download link handling needs careful auth consideration
                                        onClick={() => message.info("Download not fully implemented")}
                                    />
                                </Tooltip>
                                {isAdmin && record.id && (
                                    <Tooltip title="Delete">
                                        <Button
                                            icon={<DeleteOutlined />}
                                            danger
                                            type="text"
                                            onClick={() => handleDeleteArtifact(record.id!)}
                                        />
                                    </Tooltip>
                                )}
                            </Space>
                        ),
                    },
                ]}
            />
        </div>
    );

    return (
        <Card
            title={
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/distributions/modules')} type="text" />
                    {moduleData?.name} <Tag color="blue">{moduleData?.version}</Tag>
                </Space>
            }
            loading={isModuleLoading}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    { key: 'overview', label: 'Overview', children: overviewTab },
                    { key: 'artifacts', label: 'Artifacts', children: artifactsTab },
                    { key: 'metadata', label: 'Metadata', children: <ModuleMetadataTab softwareModuleId={softwareModuleId} isAdmin={isAdmin} /> },
                ]}
            />
        </Card>
    );
};

export default SoftwareModuleDetail;
