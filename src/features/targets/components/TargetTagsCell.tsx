import React, { useState } from 'react';
import { Tag, Space, Spin, Typography, Popover, Select, Button, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetTags } from '@/api/generated/targets/targets';
import { useGetTargetTags, useAssignTarget, useUnassignTarget, getGetTargetTagsQueryKey } from '@/api/generated/target-tags/target-tags';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
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
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    const { data: currentTags, isLoading } = useGetTags(controllerId);
    const { data: allTagsData, isLoading: allTagsLoading } = useGetTargetTags({ limit: 100 });

    const assignTagMutation = useAssignTarget();
    const unassignTagMutation = useUnassignTarget();

    const handleOpenChange = (open: boolean) => {
        if (open) {
            // Initialize selectedTagIds with current tags
            setSelectedTagIds((currentTags || []).map(tag => tag.id!));
        }
        setPopoverOpen(open);
    };

    const handleSave = async () => {
        const currentTagIds = (currentTags || []).map(tag => tag.id!);
        const toAssign = selectedTagIds.filter(id => !currentTagIds.includes(id));
        const toUnassign = currentTagIds.filter(id => !selectedTagIds.includes(id));

        try {
            for (const tagId of toAssign) {
                await assignTagMutation.mutateAsync({ controllerId, targetTagId: tagId });
            }
            for (const tagId of toUnassign) {
                await unassignTagMutation.mutateAsync({ controllerId, targetTagId: tagId });
            }
            message.success(t('messages.tagsUpdated'));
            queryClient.invalidateQueries({ queryKey: getGetTargetTagsQueryKey() });
            setPopoverOpen(false);
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        }
    };

    const popoverContent = (
        <div style={{ width: 250 }}>
            <Select
                mode="multiple"
                style={{ width: '100%', marginBottom: 8 }}
                placeholder={t('list.selectTags')}
                value={selectedTagIds}
                onChange={setSelectedTagIds}
                loading={allTagsLoading}
                options={(allTagsData?.content as MgmtTag[] || []).map(tag => ({
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
                    loading={assignTagMutation.isPending || unassignTagMutation.isPending}
                >
                    {t('common:actions.save')}
                </Button>
            </Space>
        </div>
    );

    if (isLoading) {
        return <Spin size="small" />;
    }

    return (
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
                        style={{ cursor: 'pointer', borderStyle: 'dashed' }}
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
    );
};
