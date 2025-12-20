import React, { useState } from 'react';
import { Tag, Popover, Select, Button, Space, Typography, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useAssignTargetType, useUnassignTargetType, getGetTargetsQueryKey } from '@/api/generated/targets/targets';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MgmtTargetType } from '@/api/generated/model';

const { Text } = Typography;

interface TargetTypeCellProps {
    controllerId: string;
    currentTypeId?: number;
    currentTypeName?: string;
}

export const TargetTypeCell: React.FC<TargetTypeCellProps> = ({
    controllerId,
    currentTypeId,
    currentTypeName
}) => {
    const { t } = useTranslation(['targets', 'common']);
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(currentTypeId);

    const { data: typesData, isLoading: typesLoading } = useGetTargetTypes({ limit: 100 });

    const assignTypeMutation = useAssignTargetType();
    const unassignTypeMutation = useUnassignTargetType();

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setSelectedTypeId(currentTypeId);
        }
        setPopoverOpen(open);
    };

    const handleSave = async () => {
        try {
            if (selectedTypeId && selectedTypeId !== currentTypeId) {
                await assignTypeMutation.mutateAsync({
                    targetId: controllerId,
                    data: { id: selectedTypeId }
                });
                message.success(t('messages.typeUpdated'));
            } else if (!selectedTypeId && currentTypeId) {
                await unassignTypeMutation.mutateAsync({ targetId: controllerId });
                message.success(t('messages.typeRemoved'));
            }
            queryClient.invalidateQueries({ queryKey: getGetTargetsQueryKey() });
            setPopoverOpen(false);
        } catch (error) {
            message.error((error as Error).message || t('common:messages.error'));
        }
    };

    const popoverContent = (
        <div style={{ width: 200 }}>
            <Select
                style={{ width: '100%', marginBottom: 8 }}
                placeholder={t('list.selectType')}
                value={selectedTypeId}
                onChange={setSelectedTypeId}
                loading={typesLoading}
                allowClear
                options={(typesData?.content as MgmtTargetType[] || []).map(type => ({
                    value: type.id,
                    label: type.name,
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
                    loading={assignTypeMutation.isPending || unassignTypeMutation.isPending}
                >
                    {t('common:actions.save')}
                </Button>
            </Space>
        </div>
    );

    if (!isAdmin) {
        return currentTypeName ? (
            <Tag color="blue">{currentTypeName}</Tag>
        ) : (
            <Text type="secondary">-</Text>
        );
    }

    return (
        <Popover
            content={popoverContent}
            title={t('list.editType')}
            trigger="click"
            open={popoverOpen}
            onOpenChange={handleOpenChange}
        >
            {currentTypeName ? (
                <Tag color="blue" style={{ cursor: 'pointer' }}>
                    {currentTypeName} <EditOutlined />
                </Tag>
            ) : (
                <Tag
                    style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                    icon={<PlusOutlined />}
                >
                    {t('list.addType')}
                </Tag>
            )}
        </Popover>
    );
};
