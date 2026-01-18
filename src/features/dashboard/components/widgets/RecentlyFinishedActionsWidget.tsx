import React from 'react';
import { Typography, Button, Flex, Tag, Space, List, Popover, Skeleton, Empty } from 'antd';
import {
    CheckCircleOutlined,
    ArrowRightOutlined,
    HistoryOutlined,
    ClockCircleOutlined,
    AimOutlined,
    RocketOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { MgmtAction, MgmtTarget, MgmtActionStatus } from '@/api/generated/model';
import { useNavigate } from 'react-router-dom';
import { useGetAction1 } from '@/api/generated/actions/actions';
import { useGetActionStatusList } from '@/api/generated/targets/targets';
import { getStatusLabel, translateStatusMessage } from '@/utils/statusUtils';
import { isActionErrored } from '@/entities';
import { WidgetContainer, HeaderRow, ActivityCard } from './WidgetStyles';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

interface RecentlyFinishedActionsWidgetProps {
    isLoading: boolean;
    recentlyFinishedItems: {
        target: Partial<MgmtTarget>;
        action: MgmtAction;
    }[];
    maxItems?: number;
}

const ScrollableContent = styled.div`
    flex: 1;
    overflow-y: auto;
    min-height: 0;
`;



const TargetInfo = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

const TimeInfo = styled(Flex)`
    flex-shrink: 0;
    text-align: right;
`;

interface FinishedActionItemProps {
    item: {
        target: Partial<MgmtTarget>;
        action: MgmtAction;
    };
}

const FinishedActionItem: React.FC<FinishedActionItemProps> = ({ item }) => {
    const { t } = useTranslation(['dashboard', 'common', 'actions']);
    const navigate = useNavigate();

    // Poll for latest action data to maintain real-time status
    const { data: actionData } = useGetAction1(item.action.id!, {
        query: {
            enabled: !!item.action.id,
            refetchInterval: 5000,
            staleTime: 0
        }
    });

    // Poll for action status history
    const { data: statusHistoryData } = useGetActionStatusList(
        item.target.controllerId!,
        item.action.id!,
        { limit: 5 },
        {
            query: {
                enabled: !!item.target.controllerId && !!item.action.id,
                refetchInterval: 10000,
                staleTime: 0
            }
        }
    );

    const currentAction = actionData || item.action;
    const statusHistory = statusHistoryData?.content || [];

    const status = currentAction.status?.toLowerCase() || 'finished';
    const cardStatus: 'success' | 'error' | 'canceled' =
        isActionErrored(currentAction) ? 'error' :
            status === 'canceled' ? 'canceled' : 'success';

    const getStatusIcon = () => {
        if (isActionErrored(currentAction)) return <CloseCircleOutlined />;
        if (status === 'canceled') return <ExclamationCircleOutlined />;
        return <CheckCircleOutlined />;
    };

    const getStatusColor = () => {
        if (isActionErrored(currentAction)) return 'error';
        if (status === 'canceled') return 'warning';
        return 'success';
    };

    const historyContent = (
        <div style={{ maxWidth: 320, padding: '4px 8px' }}>
            <Text strong style={{ fontSize: 'var(--ant-font-size)', marginBottom: 8, display: 'block', borderBottom: '1px solid var(--ant-color-border-secondary)', paddingBottom: 4 }}>
                {t('actions:history.title', 'Action History')}
            </Text>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                <List
                    size="small"
                    dataSource={statusHistory}
                    locale={{ emptyText: t('activeUpdates.noHistory') }}
                    renderItem={(s: MgmtActionStatus) => (
                        <List.Item style={{ padding: '6px 0', borderBottom: '1px dashed var(--ant-color-border-secondary)' }}>
                            <Flex vertical gap={2} style={{ width: '100%' }}>
                                <Flex justify="space-between" align="center">
                                    <Tag color="blue" style={{ fontSize: 'var(--ant-font-size-sm)', margin: 0 }}>
                                        {getStatusLabel(s.type, t)}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                        {s.reportedAt ? dayjs(s.reportedAt).format('HH:mm:ss') : '-'}
                                    </Text>
                                </Flex>
                                {s.messages?.[0] && (
                                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }} ellipsis>
                                        {translateStatusMessage(s.messages[0], t)}
                                    </Text>
                                )}
                            </Flex>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );

    const handleClick = () => {
        if (item.target.controllerId) {
            navigate(`/targets/${item.target.controllerId}/actions`);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <Popover content={historyContent} trigger="hover" placement="left">
            <ActivityCard
                $status={cardStatus}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label={item.target.name || item.target.controllerId || ''}
                className="dashboard-clickable"
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
            >
                <TargetInfo align="center" gap={12}>
                    <AimOutlined style={{
                        fontSize: 16,
                        color: cardStatus === 'success' ? 'var(--ant-color-success)' :
                            cardStatus === 'error' ? 'var(--ant-color-error)' :
                                'var(--ant-color-warning)'
                    }} />
                    <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
                        <Flex align="center" gap={8} wrap="wrap">
                            <Text strong style={{ fontSize: 'var(--ant-font-size)' }} ellipsis>
                                {item.target.name || item.target.controllerId || '-'}
                            </Text>
                            <Tag color={getStatusColor()} icon={getStatusIcon()} style={{ margin: 0, fontSize: 'var(--ant-font-size-sm)' }}>
                                {t(`common:status.${status}`, status)}
                            </Tag>
                        </Flex>
                        <Flex align="center" gap={8}>
                            {currentAction.rolloutName && (
                                <Space size={4}>
                                    <RocketOutlined style={{ fontSize: 'var(--ant-font-size-sm)', color: 'var(--ant-color-text-tertiary)' }} />
                                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }} ellipsis>
                                        {currentAction.rolloutName}
                                    </Text>
                                </Space>
                            )}
                        </Flex>
                    </Flex>
                </TargetInfo>
                <TimeInfo vertical align="flex-end" gap={2}>
                    <Text style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                        <ClockCircleOutlined style={{ marginRight: 4, fontSize: 'var(--ant-font-size-sm)' }} />
                        {dayjs(currentAction.lastModifiedAt).fromNow()}
                    </Text>
                </TimeInfo>
            </ActivityCard>
        </Popover>
    );
};

export const RecentlyFinishedActionsWidget: React.FC<RecentlyFinishedActionsWidgetProps> = ({
    isLoading,
    recentlyFinishedItems,
    maxItems = 5
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const navigate = useNavigate();

    const displayedItems = recentlyFinishedItems.slice(0, maxItems);

    if (isLoading) {
        return (
            <WidgetContainer>
                <Skeleton active paragraph={{ rows: 4 }} />
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer>
            <HeaderRow align="center" justify="space-between">
                <Flex align="center" gap={12}>
                    <HistoryOutlined style={{ fontSize: 18, color: 'var(--ant-color-success)' }} />
                    <Flex vertical gap={0}>
                        <Title level={5} style={{ margin: 0 }}>
                            {t('actionActivity.recentlyCompleted', 'Recently Completed')}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                            {displayedItems.length > 0
                                ? t('recentActions.subtitle', '{{count}} completed', { count: displayedItems.length })
                                : t('recentActions.empty', 'No recent completions')
                            }
                        </Text>
                    </Flex>
                </Flex>
                <Button
                    type="link"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={() => navigate('/actions')}
                >
                    {t('common:labels.viewAll')}
                </Button>
            </HeaderRow>

            <ScrollableContent>
                {displayedItems.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('recentActions.empty')}
                        style={{ padding: '24px 0' }}
                    />
                ) : (
                    displayedItems.map((item) => (
                        <FinishedActionItem key={item.action.id} item={item} />
                    ))
                )}
            </ScrollableContent>
        </WidgetContainer>
    );
};
