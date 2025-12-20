import React, { useState } from 'react';
import { Card, Table, Typography, Space, Button, message, Tag, Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTags, useAssignDistributionSets, useUnassignDistributionSets } from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { useTranslation } from 'react-i18next';
import { LeftOutlined } from '@ant-design/icons';
import type { MgmtTag } from '@/api/generated/model';

const { Title, Text } = Typography;

const DistributionBulkAssign: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const navigate = useNavigate();

    const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
    const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

    // Fetch DS
    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets({ limit: 100 });

    // Fetch Tags
    const { data: tagsData } = useGetDistributionSetTags({ limit: 100 });
    const tags = (tagsData?.content as MgmtTag[]) || [];

    const assignMutation = useAssignDistributionSets();
    const unassignMutation = useUnassignDistributionSets();

    const handleBulkAssign = async () => {
        if (selectedSetIds.length === 0 || !selectedTagId) {
            message.warning('Please select at least one distribution set and one tag');
            return;
        }

        try {
            await assignMutation.mutateAsync({
                distributionsetTagId: selectedTagId,
                data: selectedSetIds
            });
            message.success('Tags assigned successfully to selected sets');
            setSelectedSetIds([]);
        } catch (error) {
            message.error('Failed to assign tags');
        }
    };

    const handleBulkUnassign = async () => {
        if (selectedSetIds.length === 0 || !selectedTagId) {
            message.warning('Please select at least one distribution set and one tag');
            return;
        }

        try {
            await unassignMutation.mutateAsync({
                distributionsetTagId: selectedTagId,
                data: selectedSetIds
            });
            message.success('Tags unassigned successfully from selected sets');
            setSelectedSetIds([]);
        } catch (error) {
            message.error('Failed to unassign tags');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
        }
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Breadcrumb
                items={[
                    { title: t('pageTitle'), href: '/distributions' },
                    { title: 'Distribution Sets', href: '/distributions/sets' },
                    { title: 'Bulk Assignment' },
                ]}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ margin: 0 }}>
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => navigate('/distributions/sets')}
                        style={{ marginRight: 8 }}
                    />
                    Bulk Tag Assignment
                </Title>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                <Card title="Step 1: Select Distribution Sets">
                    <Table
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedSetIds,
                            onChange: (keys) => setSelectedSetIds(keys as number[]),
                        }}
                        columns={columns}
                        dataSource={dsData?.content || []}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        loading={dsLoading}
                        size="small"
                    />
                </Card>

                <Card title="Step 2: Select Tag & Action">
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Text strong>Available Tags:</Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {tags.map(tag => (
                                <Tag.CheckableTag
                                    key={tag.id}
                                    checked={selectedTagId === tag.id}
                                    onChange={(checked) => setSelectedTagId(checked ? tag.id! : null)}
                                    style={{
                                        border: selectedTagId === tag.id ? `1px solid ${tag.colour}` : '1px solid transparent',
                                        backgroundColor: selectedTagId === tag.id ? tag.colour : undefined,
                                        color: selectedTagId === tag.id ? 'white' : undefined,
                                        padding: '4px 8px'
                                    }}
                                >
                                    {tag.name}
                                </Tag.CheckableTag>
                            ))}
                            {tags.length === 0 && <Text type="secondary">No tags found</Text>}
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                block
                                style={{ marginBottom: 12 }}
                                onClick={handleBulkAssign}
                                loading={assignMutation.isPending}
                                disabled={selectedSetIds.length === 0 || !selectedTagId}
                            >
                                Assign Tag
                            </Button>
                            <Button
                                danger
                                block
                                onClick={handleBulkUnassign}
                                loading={unassignMutation.isPending}
                                disabled={selectedSetIds.length === 0 || !selectedTagId}
                            >
                                Unassign Tag
                            </Button>
                        </div>

                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Selected {selectedSetIds.length} distribution sets.
                        </Text>
                    </Space>
                </Card>
            </div>
        </Space>
    );
};

export default DistributionBulkAssign;
