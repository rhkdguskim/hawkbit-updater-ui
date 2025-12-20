import React, { useState, useMemo } from 'react';
import {
    Typography,
    Card,
    Table,
    Button,
    Space,
    message,
    Select,
    Tag,
    Divider,
    Alert,
    Spin,
} from 'antd';
import { TagsOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';

import { useGetTargets, getGetTargetsQueryKey } from '@/api/generated/targets/targets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useAssignTarget } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useAssignTargetType } from '@/api/generated/targets/targets';
import type { MgmtTarget, MgmtTag, MgmtTargetType } from '@/api/generated/model';
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

const BulkAssignment: React.FC = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { t } = useTranslation(['targets', 'common']);

    const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
    const [assigning, setAssigning] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

    const offset = (pagination.current - 1) * pagination.pageSize;

    // Fetch data
    const { data: targetsData, isLoading: targetsLoading } = useGetTargets({
        offset,
        limit: pagination.pageSize,
    });

    const { data: tagsData, isLoading: tagsLoading } = useGetTargetTags({ limit: 100 });
    const { data: typesData, isLoading: typesLoading } = useGetTargetTypes({ limit: 100 });

    // Mutations
    const assignTagMutation = useAssignTarget({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    const assignTypeMutation = useAssignTargetType({
        mutation: {
            onError: (error) => {
                message.error((error as Error).message || t('common:messages.error'));
            },
        },
    });

    // Handle bulk tag assignment
    const handleAssignTag = async () => {
        if (selectedTagIds.length === 0 || selectedTargetIds.length === 0) {
            message.warning(t('bulkAssign.selectBoth'));
            return;
        }

        setAssigning(true);
        try {
            for (const controllerId of selectedTargetIds) {
                for (const tagId of selectedTagIds) {
                    await assignTagMutation.mutateAsync({
                        targetTagId: tagId,
                        controllerId,
                    });
                }
            }
            message.success(t('bulkAssign.tagAssignSuccess', { count: selectedTargetIds.length }));
            setSelectedTargetIds([]);
            setSelectedTagIds([]);
            queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
        } catch {
            // Error already handled in mutation
        } finally {
            setAssigning(false);
        }
    };

    // Handle bulk type assignment
    const handleAssignType = async () => {
        if (!selectedTypeId || selectedTargetIds.length === 0) {
            message.warning(t('bulkAssign.selectBoth'));
            return;
        }

        setAssigning(true);
        try {
            for (const controllerId of selectedTargetIds) {
                await assignTypeMutation.mutateAsync({
                    targetId: controllerId,
                    data: { id: selectedTypeId },
                });
            }
            message.success(t('bulkAssign.typeAssignSuccess', { count: selectedTargetIds.length }));
            setSelectedTargetIds([]);
            setSelectedTypeId(undefined);
            queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
        } catch {
            // Error already handled in mutation
        } finally {
            setAssigning(false);
        }
    };

    const columns: ColumnsType<MgmtTarget> = useMemo(
        () => [
            {
                title: t('table.controllerId'),
                dataIndex: 'controllerId',
                key: 'controllerId',
            },
            {
                title: t('table.name'),
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
            },
            {
                title: t('table.targetType'),
                dataIndex: 'targetTypeName',
                key: 'targetTypeName',
                render: (typeName: string | undefined) =>
                    typeName ? <Tag color="blue">{typeName}</Tag> : <Text type="secondary">-</Text>,
            },
        ],
        [t]
    );

    const rowSelection = {
        selectedRowKeys: selectedTargetIds,
        onChange: (selectedRowKeys: React.Key[]) => {
            setSelectedTargetIds(selectedRowKeys as string[]);
        },
    };

    if (!isAdmin) {
        return (
            <PageContainer>
                <Alert type="warning" message={t('common:messages.forbidden')} showIcon />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <HeaderRow>
                <Space>
                    <Title level={2} style={{ margin: 0 }}>
                        {t('bulkAssign.title')}
                    </Title>
                </Space>
            </HeaderRow>

            {selectedTargetIds.length > 0 && (
                <Alert
                    type="info"
                    message={t('bulkAssign.selectedCount', { count: selectedTargetIds.length })}
                    showIcon
                />
            )}

            <Card title={t('bulkAssign.selectTargets')}>
                <Spin spinning={assigning}>
                    <Table<MgmtTarget>
                        columns={columns}
                        dataSource={targetsData?.content || []}
                        rowKey="controllerId"
                        loading={targetsLoading}
                        rowSelection={rowSelection}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: targetsData?.total || 0,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        }}
                        size="middle"
                    />
                </Spin>
            </Card>

            <Card>
                <AssignmentSection>
                    {/* Tag Assignment */}
                    <SectionTitle>
                        <TagsOutlined />
                        <Title level={4} style={{ margin: 0 }}>{t('bulkAssign.assignTag')}</Title>
                    </SectionTitle>
                    <Space>
                        <Select
                            placeholder={t('bulkAssign.selectTag')}
                            style={{ width: 350 }}
                            loading={tagsLoading}
                            mode="multiple"
                            value={selectedTagIds}
                            onChange={setSelectedTagIds}
                            allowClear
                            options={(tagsData?.content as MgmtTag[] || []).map((tag) => ({
                                value: tag.id,
                                label: (
                                    <Space>
                                        <Tag color={tag.colour || 'default'}>{tag.name}</Tag>
                                    </Space>
                                ),
                            }))}
                        />
                        <Button
                            type="primary"
                            onClick={handleAssignTag}
                            loading={assigning}
                            disabled={selectedTagIds.length === 0 || selectedTargetIds.length === 0}
                        >
                            {t('bulkAssign.assignTagButton')}
                        </Button>
                    </Space>

                    <Divider />

                    {/* Type Assignment */}
                    <SectionTitle>
                        <AppstoreOutlined />
                        <Title level={4} style={{ margin: 0 }}>{t('bulkAssign.assignType')}</Title>
                    </SectionTitle>
                    <Space>
                        <Select
                            placeholder={t('bulkAssign.selectType')}
                            style={{ width: 250 }}
                            loading={typesLoading}
                            value={selectedTypeId}
                            onChange={setSelectedTypeId}
                            allowClear
                            options={(typesData?.content as MgmtTargetType[] || []).map((type) => ({
                                value: type.id,
                                label: type.name,
                            }))}
                        />
                        <Button
                            type="primary"
                            onClick={handleAssignType}
                            loading={assigning}
                            disabled={!selectedTypeId || selectedTargetIds.length === 0}
                        >
                            {t('bulkAssign.assignTypeButton')}
                        </Button>
                    </Space>
                </AssignmentSection>
            </Card>
        </PageContainer>
    );
};

export default BulkAssignment;
