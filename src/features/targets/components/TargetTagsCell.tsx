import React, { useState, useMemo } from 'react';
import { Tag, Space, Spin, Typography, Popover, Select, Button, message, Divider, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetTags, getGetTagsQueryKey } from '@/api/generated/targets/targets';
import { useGetTargetTags, useAssignTarget, useUnassignTarget, useCreateTargetTags, getGetTargetTagsQueryKey } from '@/api/generated/target-tags/target-tags';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { TagFormModal } from '@/components/common';
import type { TagFormValues } from '@/components/common';
import type { MgmtTag } from '@/api/generated/model';
import { useInView } from '@/hooks/useInView';

const { Text } = Typography;

interface TargetTagsCellProps {
    controllerId: string;
    availableTags?: MgmtTag[];
}

export const TargetTagsCell: React.FC<TargetTagsCellProps> = ({ controllerId, availableTags }) => {
    const { t } = useTranslation(['targets', 'common']);
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const { ref, inView } = useInView();

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // 1. Tags for this specific target
    // Only fetch if in view to prevent N+1 storm
    const { data: currentTags, isLoading } = useGetTags(controllerId, {
        query: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            enabled: inView,
        },
    });

    // 2. All available tags (for the dropdown)
    // Use passed availableTags if provided to avoid fetching 100 tags 50 times.
    const { data: fetchedTagsData, isLoading: allTagsLoading, refetch: refetchAllTags } = useGetTargetTags(
        { limit: 100 },
        { query: { enabled: !availableTags && popoverOpen } } // Delay fetch until popover opens or if not provided
    );

    const allTags = useMemo(() => availableTags || (fetchedTagsData?.content as MgmtTag[]) || [], [availableTags, fetchedTagsData]);
    const isTagsLoading = !availableTags && allTagsLoading;

    const assignTagMutation = useAssignTarget();
    const unassignTagMutation = useUnassignTarget();

    const createTagMutation = useCreateTargetTags({
        mutation: {
            onSuccess: async (data) => {
                message.success(t('tagManagement.createSuccess'));
                setCreateModalOpen(false);
                if (!availableTags) await refetchAllTags();
                await queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() }); // Always invalidate global tags

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

    const tagOptions = useMemo(() => allTags.map(tag => ({
        value: tag.id,
        label: <Tag color={tag.colour || 'default'}>{tag.name}</Tag>,
    })), [allTags]);

    const popoverContent = useMemo(() => (
        <div style={{ width: 280 }}>
            <Select
                mode="multiple"
                style={{ width: '100%', marginBottom: 0 }}
                placeholder={t('list.selectTags')}
                value={(currentTags || []).map(tag => tag.id!)}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                loading={isTagsLoading || assignTagMutation.isPending || unassignTagMutation.isPending}
                allowClear={false}
                options={tagOptions}
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
    ), [allTags, currentTags, isTagsLoading, assignTagMutation.isPending, unassignTagMutation.isPending, t, handleSelect, handleDeselect, tagOptions]);

    // Placeholder for intersection observer
    if (!inView) {
        return <div ref={ref} style={{ minHeight: 24, minWidth: 50 }} />;
    }

    if (isLoading) {
        return (
            <div ref={ref} style={{ minHeight: 24, display: 'flex', alignItems: 'center' }}>
                <Spin size="small" />
            </div>
        );
    }

    return (
        <div ref={ref}>
            <Space size={[0, 4]} wrap style={{ maxWidth: '100%' }}>
                {(currentTags || []).slice(0, 3).map((tag) => (
                    <Tag key={tag.id} color={tag.colour || 'default'}>
                        {tag.name}
                    </Tag>
                ))}
                {(currentTags || []).length > 3 && (
                    <Tooltip
                        title={
                            <Space direction="vertical" size={2}>
                                {(currentTags || []).slice(3).map((tag) => (
                                    <Tag key={tag.id} color={tag.colour || 'default'} style={{ margin: 0 }}>
                                        {tag.name}
                                    </Tag>
                                ))}
                            </Space>
                        }
                    >
                        <Tag>+{(currentTags || []).length - 3}</Tag>
                    </Tooltip>
                )}
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
        </div>
    );
};
