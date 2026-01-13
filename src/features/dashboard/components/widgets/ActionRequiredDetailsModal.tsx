import React from 'react';
import {
    ArrowRightOutlined,
    ClockCircleOutlined,
    LockOutlined,
    RocketOutlined,
    AimOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { StandardModal } from '@/components/patterns';
import { List, Typography, Flex, Button, Card, Tag } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const TitleRow = styled(Flex)`
    && {
        align-items: center;
    }
`;

const ItemCard = styled(Card)`
    && {
        margin-bottom: 12px;
        border-radius: 12px;
        border: 1px solid var(--ant-color-border-secondary);
        .ant-card-body {
            padding: 12px 16px;
        }
    }
`;

interface ActionRequiredDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'DELAYED' | 'APPROVAL_PENDING' | null;
    delayedActions: any[];
    pendingApprovals: any[];
}

export const ActionRequiredDetailsModal: React.FC<ActionRequiredDetailsModalProps> = ({
    visible,
    onClose,
    type,
    delayedActions,
    pendingApprovals
}) => {
    const { t } = useTranslation(['dashboard', 'common', 'rollouts', 'actions']);
    const navigate = useNavigate();

    const items = type === 'DELAYED' ? delayedActions : pendingApprovals;
    const title = type === 'DELAYED'
        ? t('actionRequired.delayedActions', 'Delayed Actions')
        : t('actionRequired.pendingApprovals', 'Pending Approvals');

    const renderActionItem = (action: any) => {
        const targetId = action._links?.target?.href?.split('/').pop() || action.id;
        const time = action.lastModifiedAt || action.createdAt || 0;

        return (
            <ItemCard size="small">
                <Flex justify="space-between" align="center">
                    <Flex vertical gap={4}>
                        <Flex align="center" gap={8}>
                            <AimOutlined style={{ color: 'var(--ant-color-primary)' }} />
                            <Button
                                type="link"
                                style={{ padding: 0, height: 'auto', fontWeight: 600 }}
                                onClick={() => {
                                    onClose();
                                    navigate(`/actions/${action.id}`);
                                }}
                            >
                                {targetId}
                            </Button>
                            <Tag color="warning" style={{ margin: 0 }}>
                                {t(`common:status.${action.status?.toLowerCase() || 'unknown'}`)}
                            </Tag>
                        </Flex>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {action.detailStatus || '-'}
                        </Text>
                    </Flex>
                    <Flex vertical align="flex-end" gap={2}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            <ClockCircleOutlined /> {time ? dayjs(time).fromNow() : '-'}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                            {time ? dayjs(time).format('YYYY-MM-DD HH:mm') : ''}
                        </Text>
                    </Flex>
                </Flex>
            </ItemCard>
        );
    };

    const renderRolloutItem = (rollout: any) => {
        return (
            <ItemCard size="small">
                <Flex justify="space-between" align="center">
                    <Flex vertical gap={4}>
                        <Flex align="center" gap={8}>
                            <RocketOutlined style={{ color: 'var(--ant-color-info)' }} />
                            <Button
                                type="link"
                                style={{ padding: 0, height: 'auto', fontWeight: 600 }}
                                onClick={() => {
                                    onClose();
                                    navigate(`/rollouts/${rollout.id}`);
                                }}
                            >
                                {rollout.name}
                            </Button>
                            <Tag color="processing" style={{ margin: 0 }}>
                                {t('common:status.waiting_for_approval')}
                            </Tag>
                        </Flex>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {t('rollouts:list.columns.totalTargets', 'Total Targets')}: {rollout.totalTargets || 0}
                        </Text>
                    </Flex>
                    <Flex vertical align="flex-end" gap={2}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            <ClockCircleOutlined /> {rollout.createdAt ? dayjs(rollout.createdAt).fromNow() : '-'}
                        </Text>
                        <Tag color="blue" bordered={false} style={{ fontSize: 10, margin: 0 }}>
                            ID: {rollout.id}
                        </Tag>
                    </Flex>
                </Flex>
            </ItemCard>
        );
    };

    return (
        <StandardModal
            title={
                <TitleRow gap="small">
                    {type === 'DELAYED' ? (
                        <ClockCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />
                    ) : (
                        <LockOutlined style={{ color: 'var(--ant-color-info)' }} />
                    )}
                    <span>{title}</span>
                </TitleRow>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t('common:actions.close')}
                </Button>,
                <Button
                    key="view-all"
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => {
                        onClose();
                        navigate(type === 'DELAYED' ? '/actions' : '/rollouts');
                    }}
                >
                    {t('common:labels.viewAll')}
                </Button>
            ]}
            width={600}
        >
            <List
                dataSource={items}
                renderItem={(item) => type === 'DELAYED' ? renderActionItem(item) : renderRolloutItem(item)}
                locale={{ emptyText: t('common:messages.noData') }}
            />
        </StandardModal>
    );
};
