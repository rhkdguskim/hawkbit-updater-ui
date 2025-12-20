import React, { useState } from 'react';
import { Modal, Select, Tag, Space, message, Typography, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetDistributionSetTags,
    useAssignDistributionSet,
    useUnassignDistributionSet
} from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { getGetDistributionSetsQueryKey } from '@/api/generated/distribution-sets/distribution-sets';
import type { MgmtTag } from '@/api/generated/model';

interface BulkManageSetTagsModalProps {
    open: boolean;
    setIds: number[];
    onCancel: () => void;
    onSuccess: () => void;
}

const BulkManageSetTagsModal: React.FC<BulkManageSetTagsModalProps> = ({
    open,
    setIds,
    onCancel,
    onSuccess,
}) => {
    const { t } = useTranslation(['distributions', 'common']);
    const queryClient = useQueryClient();
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [mode, setMode] = useState<'assign' | 'unassign'>('assign');
    const [processing, setProcessing] = useState(false);

    const { data: tagsData, isLoading: tagsLoading } = useGetDistributionSetTags({ limit: 100 });

    const assignTagMutation = useAssignDistributionSet();
    const unassignTagMutation = useUnassignDistributionSet();

    const handleOk = async () => {
        if (selectedTagIds.length === 0) {
            message.warning(t('bulkAssignment.selectTags'));
            return;
        }

        setProcessing(true);
        try {
            for (const setId of setIds) {
                for (const tagId of selectedTagIds) {
                    if (mode === 'assign') {
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
            const successMsg = mode === 'assign'
                ? t('bulkAssignment.tagAssignSuccess', { count: setIds.length })
                : t('bulkAssignment.tagUnassignSuccess', { count: setIds.length });
            message.success(successMsg);

            setSelectedTagIds([]);
            queryClient.invalidateQueries({ queryKey: getGetDistributionSetsQueryKey() });
            onSuccess();
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal
            title={t('bulkAssignment.manageTags')}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={processing}
            okText={mode === 'assign' ? t('bulkAssignment.assign') : t('bulkAssignment.unassign')}
            cancelText={t('common:actions.cancel')}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Typography.Text strong>
                    {t('bulkAssignment.selectedSetsCount', { count: setIds.length })}
                </Typography.Text>

                <div>
                    <Typography.Text>{t('bulkAssignment.mode')}: </Typography.Text>
                    <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
                        <Radio value="assign">{t('bulkAssignment.assign')}</Radio>
                        <Radio value="unassign">{t('bulkAssignment.unassign')}</Radio>
                    </Radio.Group>
                </div>

                <Select
                    mode="multiple"
                    placeholder={t('bulkAssignment.selectTagsPlaceholder')}
                    style={{ width: '100%' }}
                    value={selectedTagIds}
                    onChange={setSelectedTagIds}
                    loading={tagsLoading}
                    options={(tagsData?.content as MgmtTag[] || []).map((tag) => ({
                        value: tag.id,
                        label: (
                            <Space>
                                <Tag color={tag.colour || 'default'}>{tag.name}</Tag>
                            </Space>
                        ),
                    }))}
                />
            </Space>
        </Modal>
    );
};

export default BulkManageSetTagsModal;
