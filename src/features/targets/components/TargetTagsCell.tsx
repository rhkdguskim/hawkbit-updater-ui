import React, { useState } from 'react';
import { Tag, Space, Spin, Typography, Popover, Select, Button, message, Divider } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetTags, getGetTagsQueryKey } from '@/api/generated/targets/targets';
import { useGetTargetTags, useAssignTarget, useUnassignTarget, useCreateTargetTags, getGetTargetTagsQueryKey } from '@/api/generated/target-tags/target-tags';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { TagFormModal } from '@/components/common';
import type { TagFormValues } from '@/components/common';
import type { MgmtTag } from '@/api/generated/model';

const { Text } = Typography;

interface TargetTagsCellProps {
    controllerId: string;
}

export const TargetTagsCell: React.FC<TargetTagsCellProps> = ({ controllerId }) => {
    const { t } = useTranslation(['targets', 'common']);
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const { data: currentTags, isLoading } = useGetTags(controllerId, {
        query: {
            staleTime: 0,
            refetchOnMount: 'always',
        },
    });
    const { data: allTagsData, isLoading: allTagsLoading, refetch: refetchAllTags } = useGetTargetTags({ limit: 100 });

    const assignTagMutation = useAssignTarget();
    const unassignTagMutation = useUnassignTarget();

    const createTagMutation = useCreateTargetTags({
        mutation: {
            onSuccess: async (data) => {
                message.success(t('tagManagement.createSuccess'));
                setCreateModalOpen(false);
                await refetchAllTags();
                // Auto-select the newly created tag
                const newTag = data?.[0];
                if (newTag?.id) {
                    await assignTagMutation.mutateAsync({ controllerId, targetTagId: newTag.id });
                }
            },
            onError: (error) => {
                message.error((error as Error).message || t('common:error'));
            },
        },
    });

    const handleOpenChange = (open: boolean) => {
        setPopoverOpen(open);
    };

    const handleCreateTag = (values: TagFormValues) => {
        createTagMutation.mutate({ data: [values] });
    };

    const handleSelect = async (value: number) => {
        try {
            await assignTagMutation.mutateAsync({ controllerId, targetTagId: value });
            message.success(t('tagManagement.tagAssigned'));
            queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetTagsQueryKey(controllerId) });
        } catch (error) {
            message.error((error as Error).message || t('common:error'));
            // Revert selection if needed (handled by refetch)
        }
    };

    const handleDeselect = async (value: number) => {
        try {
            await unassignTagMutation.mutateAsync({ controllerId, targetTagId: value });
            message.success(t('tagManagement.tagUnassigned'));
            queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetTagsQueryKey(controllerId) });
        } catch (error) {
            message.error((error as Error).message || t('common:error'));
        }
    };

    const popoverContent = (
        <div style={{ width: 280 }}>
            <Select
                mode="multiple"
                style={{ width: '100%', marginBottom: 0 }}
                placeholder={t('list.selectTags')}
                value={(currentTags || []).map(tag => tag.id!)}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                loading={allTagsLoading || assignTagMutation.isPending || unassignTagMutation.isPending}
                allowClear={false}
                options={(allTagsData?.content as MgmtTag[] || []).map(tag => ({
                    value: tag.id,
                    label: <Tag color={tag.colour || 'default'}>{tag.name}</Tag>,
                }))}
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalOpen(true)}
                            style={{ width: '100%' }}
                        >
                            {t('tagManagement.add')}
                        </Button>
                    </>
                )}
            />
        </div>
    );

    if (isLoading) {
        return <Spin size="small" />;
    }

    return (
        <>
            <Space size={[0, 4]} wrap style={{ maxWidth: '100%' }}>
                {(currentTags || []).map((tag) => (
                    <Tag key={tag.id} color={tag.colour || 'default'}>
                        {tag.name}
                    </Tag>
                ))}
                {isAdmin && (
                    <Popover
                        content={popoverContent}
                        title={t('list.editTags')}
                        trigger="click"
                        open={popoverOpen}
                        onOpenChange={handleOpenChange}
                    >
                        <Tag
                            style={{
                                cursor: 'pointer',
                                background: 'transparent',
                                border: '1px solid var(--ant-color-border, #d9d9d9)',
                            }}
                            icon={currentTags?.length ? <EditOutlined /> : <PlusOutlined />}
                        >
                            {currentTags?.length ? '' : t('list.addTag')}
                        </Tag>
                    </Popover>
                )}
                {!isAdmin && (!currentTags || currentTags.length === 0) && (
                    <Text type="secondary">-</Text>
                )}
            </Space>

            <TagFormModal
                open={createModalOpen}
                mode="create"
                loading={createTagMutation.isPending}
                onSubmit={handleCreateTag}
                onCancel={() => setCreateModalOpen(false)}
                translations={{
                    createTitle: t('tagManagement.createTitle'),
                    nameLabel: t('table.name'),
                    namePlaceholder: t('form.namePlaceholder'),
                    nameRequired: t('common:validation.required'),
                    descriptionLabel: t('form.description'),
                    descriptionPlaceholder: t('form.descriptionPlaceholder'),
                    colourLabel: t('tagManagement.colour'),
                }}
            />
        </>
    );
};
