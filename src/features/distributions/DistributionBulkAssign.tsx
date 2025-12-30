import React, { useState } from 'react';
import { Card, Table, Typography, Space, Button, message, Tag, Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTags, useAssignDistributionSets, useUnassignDistributionSets } from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { useTranslation } from 'react-i18next';
import { LeftOutlined } from '@ant-design/icons';
import type { MgmtTag } from '@/api/generated/model';
import styled, { css } from 'styled-components';
import { PageHeader, PageLayout } from '@/components/patterns';

const { Text } = Typography;

const AssignmentGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: var(--ant-margin-lg, 24px);

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const FullWidthStack = styled(Space)`
    && {
        width: 100%;
    }
`;

const TagWrap = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ant-margin-xs, 8px);
`;

const TagActions = styled.div`
    margin-top: var(--ant-margin-lg, 24px);
`;

const ActionButton = styled(Button)`
    && {
        width: 100%;
    }
`;

const PrimaryActionButton = styled(ActionButton)`
    && {
        margin-bottom: var(--ant-margin-sm, 12px);
    }
`;

const MetaText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const ColorCheckableTag = styled(Tag.CheckableTag)<{ $color?: string }>`
    border: 1px solid transparent;
    padding: var(--ant-padding-xxs, 4px) var(--ant-padding-xs, 8px);

    ${props => props.$color && css`
        &.ant-tag-checkable-checked {
            background: ${props.$color};
            border-color: ${props.$color};
            color: var(--ant-color-text-light-solid, #fff);
        }
    `}
`;

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
            message.warning(t('bulkAssignment.warningSelectBoth'));
            return;
        }

        try {
            await assignMutation.mutateAsync({
                distributionsetTagId: selectedTagId,
                data: selectedSetIds
            });
            message.success(t('bulkAssignment.assignSuccess'));
            setSelectedSetIds([]);
        } catch (error) {
            message.error(t('bulkAssignment.assignError'));
        }
    };

    const handleBulkUnassign = async () => {
        if (selectedSetIds.length === 0 || !selectedTagId) {
            message.warning(t('bulkAssignment.warningSelectBoth'));
            return;
        }

        try {
            await unassignMutation.mutateAsync({
                distributionsetTagId: selectedTagId,
                data: selectedSetIds
            });
            message.success(t('bulkAssignment.unassignSuccess'));
            setSelectedSetIds([]);
        } catch (error) {
            message.error(t('bulkAssignment.unassignError'));
        }
    };

    const columns = [
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
            dataIndex: 'typeName',
            key: 'typeName',
        }
    ];

    return (
        <PageLayout>
            <Breadcrumb
                items={[
                    { title: t('pageTitle'), href: '/distributions' },
                    { title: t('list.title'), href: '/distributions/sets' },
                    { title: t('bulkAssignment.title') },
                ]}
            />

            <PageHeader
                title={t('bulkAssignment.bulkTagAssignment')}
                backLabel={t('common:actions.back', { defaultValue: 'Back' })}
                onBack={() => navigate('/distributions/sets')}
            />

            <AssignmentGrid>
                <Card title={t('bulkAssignment.step1')}>
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

                <Card title={t('bulkAssignment.step2')}>
                    <FullWidthStack direction="vertical" size="middle">
                        <Text strong>{t('bulkAssignment.availableTags')}</Text>
                        <TagWrap>
                            {tags.map(tag => (
                                <ColorCheckableTag
                                    key={tag.id}
                                    checked={selectedTagId === tag.id}
                                    onChange={(checked) => setSelectedTagId(checked ? tag.id! : null)}
                                    $color={tag.colour}
                                >
                                    {tag.name}
                                </ColorCheckableTag>
                            ))}
                            {tags.length === 0 && <Text type="secondary">{t('bulkAssignment.noTagsFound')}</Text>}
                        </TagWrap>

                        <TagActions>
                            <PrimaryActionButton
                                type="primary"
                                block
                                onClick={handleBulkAssign}
                                loading={assignMutation.isPending}
                                disabled={selectedSetIds.length === 0 || !selectedTagId}
                            >
                                {t('bulkAssignment.assign')}
                            </PrimaryActionButton>
                            <ActionButton
                                danger
                                block
                                onClick={handleBulkUnassign}
                                loading={unassignMutation.isPending}
                                disabled={selectedSetIds.length === 0 || !selectedTagId}
                            >
                                {t('bulkAssignment.unassign')}
                            </ActionButton>
                        </TagActions>

                        <MetaText type="secondary">
                            {t('bulkAssignment.selectedCount', { count: selectedSetIds.length })}
                        </MetaText>
                    </FullWidthStack>
                </Card>
            </AssignmentGrid>
        </PageLayout>
    );
};

export default DistributionBulkAssign;
