import React, { useState, useMemo } from 'react';
import { Tag, Space, Spin, Typography, Popover, Select, Button, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
    useGetDistributionSetTags,
    useAssignDistributionSet,
    useUnassignDistributionSet,
} from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';

const { Text } = Typography;

interface DistributionSetTagsCellProps {
    distributionSetId: number;
}

export const DistributionSetTagsCell: React.FC<DistributionSetTagsCellProps> = ({ distributionSetId }) => {
    const { t } = useTranslation(['distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [assignedTagIds, setAssignedTagIds] = useState<number[]>([]);

    const { data: allTagsData, isLoading: allTagsLoading } = useGetDistributionSetTags({ limit: 100 });
    const allTags = useMemo(() => allTagsData?.content || [], [allTagsData]);

    const assignMutation = useAssignDistributionSet();
    const unassignMutation = useUnassignDistributionSet();

    const fetchAssignments = async () => {
        if (!allTags.length) return;
        setLoadingAssignments(true);
        const assigned: number[] = [];

        // This is inefficient but matching how hawkBit works for DS tags without a direct "tags per DS" endpoint
        // In a real high-perf scenario, we'd need a custom endpoint or better query support
        try {
            const promises = allTags.map(async (tag) => {
                if (!tag.id) return;
                const response = await fetch(`/rest/v1/distributionsettags/${tag.id}/assigned?q=id==${distributionSetId}`, {
                    headers: {
                        'Authorization': `Basic ${btoa('admin:admin')}`, // Fast-track for demo/dev
                    },
                });
                const data = await response.json();
                if (data.content && data.content.length > 0) {
                    assigned.push(tag.id);
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

    const handleOpenChange = async (open: boolean) => {
        if (open) {
            await fetchAssignments();
            setSelectedTagIds(assignedTagIds);
        }
        setPopoverOpen(open);
    };

    const handleSave = async () => {
        const toAssign = selectedTagIds.filter(id => !assignedTagIds.includes(id));
        const toUnassign = assignedTagIds.filter(id => !selectedTagIds.includes(id));

        try {
            for (const tagId of toAssign) {
                await assignMutation.mutateAsync({ distributionsetTagId: tagId, distributionsetId: distributionSetId });
            }
            for (const tagId of toUnassign) {
                await unassignMutation.mutateAsync({ distributionsetTagId: tagId, distributionsetId: distributionSetId });
            }
            message.success(t('messages.tagsUpdated'));
            setAssignedTagIds(selectedTagIds);
            setPopoverOpen(false);
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        }
    };

    const assignedTags = useMemo(() =>
        allTags.filter(t => t.id && assignedTagIds.includes(t.id)),
        [allTags, assignedTagIds]
    );

    const popoverContent = (
        <div style={{ width: 250 }}>
            <Select
                mode="multiple"
                style={{ width: '100%', marginBottom: 8 }}
                placeholder={t('list.selectTags')}
                value={selectedTagIds}
                onChange={setSelectedTagIds}
                loading={allTagsLoading}
                options={allTags.map(tag => ({
                    value: tag.id,
                    label: <Tag color={tag.colour || 'default'}>{tag.name}</Tag>,
                }))}
            />
            <Space>
                <Button size="small" onClick={() => setPopoverOpen(false)}>
                    {t('common:actions.cancel')}
                </Button>
                <Button
                    type="primary"
                    size="small"
                    onClick={handleSave}
                    loading={assignMutation.isPending || unassignMutation.isPending}
                >
                    {t('common:actions.save')}
                </Button>
            </Space>
        </div>
    );

    return (
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
                        style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                        icon={assignedTags.length ? <EditOutlined /> : <PlusOutlined />}
                    >
                        {assignedTags.length ? '' : t('list.addTag')}
                    </Tag>
                </Popover>
            )}
        </Space>
    );
};
