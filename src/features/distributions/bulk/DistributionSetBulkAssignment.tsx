import React, { useState } from 'react';
import {
    Typography,
    Card,
    Table,
    Button,
    Space,
    message,
    Select,
    Tag,
    Alert,
} from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';

import { useGetDistributionSets, getGetDistributionSetsQueryKey } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTags, useAssignDistributionSet, useUnassignDistributionSet } from '@/api/generated/distribution-set-tags/distribution-set-tags';
import type { MgmtDistributionSet, MgmtTag } from '@/api/generated/model';
import { useAuthStore } from '@/stores/useAuthStore';

const { Title, Text } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;

const AssignmentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const DistributionSetBulkAssignment: React.FC = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['distributions', 'common']);

    const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [assignMode, setAssignMode] = useState<'assign' | 'unassign'>('assign');

    const offset = (pagination.current - 1) * pagination.pageSize;

    // Fetch data
    const { data: setsData, isLoading: setsLoading } = useGetDistributionSets({
        offset,
        limit: pagination.pageSize,
    });

    const { data: tagsData, isLoading: tagsLoading } = useGetDistributionSetTags({ limit: 100 });

    // Mutations
    const assignTagMutation = useAssignDistributionSet({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const unassignTagMutation = useUnassignDistributionSet({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    // Handle bulk tag assignment/unassignment
    const handleAssignTags = async () => {
        if (selectedTagIds.length === 0 || selectedSetIds.length === 0) {
            message.warning(t('bulkAssignment.selectBoth'));
            return;
        }

        setAssigning(true);
        try {
            for (const setId of selectedSetIds) {
                for (const tagId of selectedTagIds) {
                    if (assignMode === 'assign') {
                        await assignTagMutation.mutateAsync({
                            distributionsetTagId: tagId,
                            distributionsetId: setId,
                        });
                    } else {
                        await unassignTagMutation.mutateAsync({
                            distributionsetTagId: tagId,
                            distributionsetId: setId,
                        });
                    }
                }
            }
            const successMsg = assignMode === 'assign'
                ? t('bulkAssignment.tagAssignSuccess', { count: selectedSetIds.length })
                : t('bulkAssignment.tagUnassignSuccess', { count: selectedSetIds.length });
            message.success(successMsg);
            setSelectedSetIds([]);
            setSelectedTagIds([]);
            queryClient.invalidateQueries({ queryKey: getGetDistributionSetsQueryKey() });
        } catch {
            // Error already handled in mutation
        } finally {
            setAssigning(false);
        }
    };

    const columns: ColumnsType<MgmtDistributionSet> = [
        {
            title: t('list.columns.name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('list.columns.version'),
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: t('list.columns.type'),
            dataIndex: 'type',
            key: 'type',
            render: (type) => type?.name || '-',
        },
    ];

    return (
        <PageContainer>
            <HeaderRow>
                <Title level={2} style={{ margin: 0 }}>
                    {t('bulkAssignment.pageTitle')}
                </Title>
            </HeaderRow>

            <Card>
                <Alert
                    message={t('bulkAssignment.instruction')}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <div style={{ marginBottom: 16 }}>
                    <Text strong>{t('bulkAssignment.selectedSets', { count: selectedSetIds.length })}</Text>
                </div>

                <Table
                    columns={columns}
                    dataSource={setsData?.content || []}
                    rowKey="id"
                    loading={setsLoading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: setsData?.total || 0,
                        showSizeChanger: true,
                        onChange: (page, pageSize) => {
                            setPagination({ current: page, pageSize });
                        },
                    }}
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedSetIds,
                        onChange: (keys) => setSelectedSetIds(keys as number[]),
                    }}
                />
            </Card>

            <Card>
                <AssignmentSection>
                    <SectionTitle>
                        <TagsOutlined />
                        <Text strong>{t('bulkAssignment.tagAssignment')}</Text>
                    </SectionTitle>

                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div>
                            <Text>{t('bulkAssignment.assignMode')}: </Text>
                            <Select
                                value={assignMode}
                                onChange={setAssignMode}
                                style={{ width: 200, marginLeft: 8 }}
                                options={[
                                    { value: 'assign', label: t('bulkAssignment.assign') },
                                    { value: 'unassign', label: t('bulkAssignment.unassign') },
                                ]}
                            />
                        </div>

                        <div>
                            <Text>{t('bulkAssignment.selectTags')}: </Text>
                            <Select
                                mode="multiple"
                                placeholder={t('bulkAssignment.selectTagsPlaceholder')}
                                style={{ width: '100%', marginTop: 8 }}
                                value={selectedTagIds}
                                onChange={setSelectedTagIds}
                                loading={tagsLoading}
                                options={
                                    tagsData?.content?.map((tag: MgmtTag) => ({
                                        value: tag.id,
                                        label: (
                                            <Tag color={tag.colour || 'blue'}>
                                                {tag.name}
                                            </Tag>
                                        ),
                                    })) || []
                                }
                            />
                        </div>

                        <Button
                            type="primary"
                            onClick={handleAssignTags}
                            loading={assigning}
                            disabled={!isAdmin || selectedSetIds.length === 0 || selectedTagIds.length === 0}
                            icon={<TagsOutlined />}
                        >
                            {assignMode === 'assign' ? t('bulkAssignment.assignTags') : t('bulkAssignment.unassignTags')}
                        </Button>
                    </Space>
                </AssignmentSection>
            </Card>
        </PageContainer>
    );
};

export default DistributionSetBulkAssignment;
