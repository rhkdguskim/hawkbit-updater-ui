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
    padding: 12px 0 !important;
`;

export const ActionRequiredWidget: React.FC<ActionRequiredWidgetProps> = ({
    isLoading,
    delayedActionsCount,
    pendingApprovalsCount,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const totalCount = delayedActionsCount + pendingApprovalsCount;

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
                            type: 'DELAYED',
                            count: delayedActionsCount,
                            label: t('actionRequired.delayedActions', 'Delayed Actions'),
                            icon: <ClockCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />
                        }] : []),
                        ...(pendingApprovalsCount > 0 ? [{
                            type: 'APPROVAL_PENDING',
                            count: pendingApprovalsCount,
                            label: t('actionRequired.pendingApprovals', 'Pending Approvals'),
                            icon: <LockOutlined style={{ color: 'var(--ant-color-info)' }} />
                        }] : [])
                    ]}
                    renderItem={item => (
                        <ItemRow>
                            <List.Item.Meta
                                avatar={item.icon}
                                title={item.label}
                                description={`${item.count} ${t('common:items', 'items')}`}
                            />
                            <Tag color={item.type === 'DELAYED' ? 'warning' : 'processing'}>
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
