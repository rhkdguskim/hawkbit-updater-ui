import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Tag, List, Badge, Empty, Skeleton } from 'antd';
import {
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    LockOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface ActionRequiredWidgetProps {
    isLoading: boolean;
    delayedActionsCount: number;
    pendingApprovalsCount: number;
    onActionClick?: (type: 'DELAYED' | 'APPROVAL_PENDING') => void;
}

const Container = styled.div`
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
`;

const Header = styled(Flex)`
    border-bottom: 1px solid var(--ant-color-border-secondary);
    padding-bottom: 12px;
`;

const IconBadge = styled.div<{ $hasItems: boolean }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: ${props => props.$hasItems ? 'var(--ant-color-error-bg)' : 'var(--ant-color-success-bg)'};
    color: ${props => props.$hasItems ? 'var(--ant-color-error)' : 'var(--ant-color-success)'};
`;

const ItemRow = styled(List.Item)`
    padding: 12px 12px !important;
    border-radius: 12px;
    transition: all 0.2s ease;
    cursor: pointer;
    margin: 4px 0;

    &:hover {
        background: var(--ant-color-fill-quaternary);
        transform: translateX(4px);
    }
`;

export const ActionRequiredWidget: React.FC<ActionRequiredWidgetProps> = ({
    isLoading,
    delayedActionsCount,
    pendingApprovalsCount,
    onActionClick,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const totalCount = delayedActionsCount + pendingApprovalsCount;
    const handleRowKeyDown = (type: 'DELAYED' | 'APPROVAL_PENDING') => (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onActionClick?.(type);
        }
    };

    if (isLoading) {
        return (
            <Container>
                <Skeleton active paragraph={{ rows: 3 }} />
            </Container>
        );
    }

    return (
        <Container>
            <Header align="center" justify="space-between">
                <Flex align="center" gap={12}>
                    <IconBadge $hasItems={totalCount > 0}>
                        <ExclamationCircleOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <Title level={5} style={{ margin: 0 }}>
                            {t('actionRequired.title', 'Action Required')}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('actionRequired.subtitle', 'Items needing immediate attention')}
                        </Text>
                    </Flex>
                </Flex>
                <Badge count={totalCount} overflowCount={99} />
            </Header>

            {totalCount > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={[
                        ...(delayedActionsCount > 0 ? [{
                            type: 'DELAYED' as const,
                            count: delayedActionsCount,
                            label: t('actionRequired.delayedActions', 'Delayed Actions'),
                            icon: <ClockCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />
                        }] : []),
                        ...(pendingApprovalsCount > 0 ? [{
                            type: 'APPROVAL_PENDING' as const,
                            count: pendingApprovalsCount,
                            label: t('actionRequired.pendingApprovals', 'Pending Approvals'),
                            icon: <LockOutlined style={{ color: 'var(--ant-color-info)' }} />
                        }] : [])
                    ]}
                    renderItem={item => (
                        <ItemRow
                            onClick={() => onActionClick?.(item.type)}
                            onKeyDown={handleRowKeyDown(item.type)}
                            role="button"
                            tabIndex={0}
                            aria-label={item.label}
                            className="dashboard-clickable"
                        >
                            <List.Item.Meta
                                avatar={
                                    <div style={{
                                        padding: '8px',
                                        background: item.type === 'DELAYED' ? 'var(--ant-color-warning-bg)' : 'var(--ant-color-info-bg)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                    </div>
                                }
                                title={<Text strong>{item.label}</Text>}
                                description={`${item.count} ${t('common:items', 'items')}`}
                            />
                            <Tag color={item.type === 'DELAYED' ? 'warning' : 'processing'} style={{ borderRadius: '6px' }}>
                                {t('common:actions.view', 'View')}
                            </Tag>
                        </ItemRow>
                    )}
                />
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('actionRequired.noItems', 'Everything is on track')}
                    />
                </Flex>
            )}
        </Container>
    );
};

export default ActionRequiredWidget;
