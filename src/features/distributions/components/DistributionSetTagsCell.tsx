import React, { useState, useMemo } from 'react';
import { Tag, Space, Spin, Typography, Popover, Select, Button, message, Divider } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
    useGetDistributionSetTags,
    useAssignDistributionSet,
    useUnassignDistributionSet,
    useCreateDistributionSetTags,
} from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import { TagFormModal } from '@/components/common';
import type { TagFormValues } from '@/components/common';

const { Text } = Typography;

interface DistributionSetTagsCellProps {
    distributionSetId: number;
}

export const DistributionSetTagsCell: React.FC<DistributionSetTagsCellProps> = ({ distributionSetId }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // State for assigned tags
    const [assignedTagIds, setAssignedTagIds] = useState<number[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const { data: allTagsData, isLoading: allTagsLoading, refetch: refetchAllTags } = useGetDistributionSetTags({ limit: 100 });
    const allTags = useMemo(() => allTagsData?.content || [], [allTagsData]);

    // Fetch assignments manually on mount (N+1 approach as authorized)
    React.useEffect(() => {
        const fetchAssignments = async () => {
            if (!allTags.length) {
                setLoadingAssignments(false);
                return;
            }
            // Only show loading if we don't have tags yet (or maybe always?)
            // setAssignedTagIds([]); // Don't clear if we want to keep showing while updating? 
            // Better to clear or show loading to avoid stale data.
            setLoadingAssignments(true);

            const assigned: number[] = [];
            const token = useAuthStore.getState().token;

            try {
                // Optimization: Limit concurrency if needed, but for now simple Promise.all
                const promises = allTags.map(async (tag) => {
                    if (!tag.id) return;
                    try {
                        const response = await fetch(`/rest/v1/distributionsettags/${tag.id}/assigned?q=id==${distributionSetId}`, {
                            headers: {
                                'Authorization': `Basic ${token}`,
                            },
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.content && data.content.length > 0) {
                                assigned.push(tag.id);
                            }
                        }
                    } catch (e) {
                        // ignore error
                    }
                });
                await Promise.all(promises);
                setAssignedTagIds(assigned);
            } catch (error) {
                console.error('Failed to fetch DS tags', error);
            } finally {
                setLoadingAssignments(false);
            }
        };

        if (allTags.length > 0) {
            fetchAssignments();
        } else if (!allTagsLoading) {
            setLoadingAssignments(false);
        }
    }, [allTags, distributionSetId, allTagsLoading]);

    const assignedTags = useMemo(() =>
        allTags.filter(t => t.id && assignedTagIds.includes(t.id)),
        [allTags, assignedTagIds]
    );

    const assignMutation = useAssignDistributionSet();
    const unassignMutation = useUnassignDistributionSet();
    const createTagMutation = useCreateDistributionSetTags();


    const handleOpenChange = async (open: boolean) => {
        setPopoverOpen(open);
    };

    const handleSelect = async (value: number) => {
        try {
            await assignMutation.mutateAsync({ distributionsetTagId: value, distributionsetId: distributionSetId });
            message.success(t('messages.tagsUpdated'));
            setAssignedTagIds(prev => [...prev, value]);
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        }
    };

    const handleDeselect = async (value: number) => {
        try {
            await unassignMutation.mutateAsync({ distributionsetTagId: value, distributionsetId: distributionSetId });
            message.success(t('messages.tagsUpdated'));
            setAssignedTagIds(prev => prev.filter(id => id !== value));
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        }
    };

    const handleCreateTag = async (values: TagFormValues) => {
        try {
            const data = await createTagMutation.mutateAsync({ data: [values] });
            message.success(t('tagManagement.createSuccess'));
            setCreateModalOpen(false);

            await refetchAllTags();

            // Auto-select the newly created tag
            const newTag = data?.[0];
            if (newTag?.id) {
                await assignMutation.mutateAsync({ distributionsetTagId: newTag.id, distributionsetId: distributionSetId });
                setAssignedTagIds(prev => [...prev, newTag.id!]);
            }
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
                value={assignedTagIds}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                loading={allTagsLoading || assignMutation.isPending || unassignMutation.isPending}
                allowClear={false}
                options={allTags.map(tag => ({
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
                            {t('tagManagement.addTag')}
                        </Button>
                    </>
                )}
            />
        </div>
    );

    return (
        <>
            <Space size={[0, 4]} wrap style={{ maxWidth: '100%' }}>
                {loadingAssignments ? (
                    <Spin size="small" />
                ) : (
                    <>
                        {assignedTags.map((tag) => (
                            <Tag key={tag.id} color={tag.colour || 'default'}>
                                {tag.name}
                            </Tag>
                        ))}
                        {!assignedTags.length && !isAdmin && <Text type="secondary">-</Text>}
                    </>
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
                            icon={assignedTags.length ? <EditOutlined /> : <PlusOutlined />}
                        >
                            {assignedTags.length ? '' : t('list.addTag')}
                        </Tag>
                    </Popover>
                )}
            </Space>

            <TagFormModal
                open={createModalOpen}
                mode="create"
                loading={createTagMutation.isPending}
                onSubmit={handleCreateTag}
                onCancel={() => setCreateModalOpen(false)}
                translations={{
                    createTitle: t('tagManagement.addTag'),
                    nameLabel: t('tagManagement.columns.name'),
                    namePlaceholder: t('tagManagement.namePlaceholder'),
                    nameRequired: t('tagManagement.nameRequired'),
                    descriptionLabel: t('tagManagement.columns.description'),
                    descriptionPlaceholder: t('tagManagement.descriptionPlaceholder'),
                    colourLabel: t('tagManagement.columns.colour'),
                }}
            />
        </>
    );
};
