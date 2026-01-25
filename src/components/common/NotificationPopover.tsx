import React from 'react';
import styled from 'styled-components';
import { Typography, Button, List, Empty, Badge, Tag, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    CheckOutlined
} from '@ant-design/icons';
import { useNotificationStore, type Notification } from '@/stores/useNotificationStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import 'dayjs/locale/zh-cn';

const { Text, Title } = Typography;

dayjs.extend(relativeTime);

const PopoverContainer = styled.div`
    width: 360px;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    max-height: 500px;
`;

const Header = styled.div`
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--ant-color-bg-container);
    border-radius: 8px 8px 0 0;
`;

const NotificationList = styled.div`
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
    padding: 0;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: var(--ant-color-text-quaternary);
        border-radius: 3px;
    }
`;

const NotificationItem = styled.div<{ $read: boolean }>`
    padding: 12px 16px;
    display: flex;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid var(--border-color);
    background: ${props => props.$read ? 'transparent' : 'var(--ant-color-primary-bg)'};
    opacity: ${props => props.$read ? 0.7 : 1};
    position: relative;

    &:hover {
        background: var(--ant-control-item-bg-hover);
        opacity: 1;
        
        .delete-btn {
            opacity: 1;
        }
    }

    &:last-child {
        border-bottom: none;
    }
`;

const IconWrapper = styled.div<{ $type: string }>`
    font-size: 18px;
    margin-top: 2px;
    color: ${props => {
        switch (props.$type) {
            case 'success': return 'var(--ant-color-success)';
            case 'warning': return 'var(--ant-color-warning)';
            case 'error': return 'var(--ant-color-error)';
            default: return 'var(--ant-color-info)';
        }
    }};
`;

const Content = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
`;

const TimeText = styled(Text)`
    font-size: 11px;
    color: var(--ant-color-text-tertiary);
    white-space: nowrap;
`;

const Footer = styled.div`
    padding: 8px 16px;
    border-top: 1px solid var(--border-color);
    text-align: center;
    background: var(--ant-color-bg-container);
    border-radius: 0 0 8px 8px;
`;

const DeleteButton = styled(Button)`
    position: absolute;
    right: 8px;
    bottom: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    padding: 0;
    height: 20px;
    width: 20px;
    font-size: 12px;
`;

export const NotificationPopover: React.FC = () => {
    const { t, i18n } = useTranslation(['common']);
    const navigate = useNavigate();
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification
    } = useNotificationStore();

    const getLocale = () => {
        switch (i18n.language) {
            case 'ko': return 'ko';
            case 'zh': return 'zh-cn';
            default: return 'en';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleOutlined />;
            case 'warning': return <ExclamationCircleOutlined />;
            case 'error': return <CloseCircleOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const handleItemClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearAll();
    };

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllAsRead();
    };

    return (
        <PopoverContainer>
            <Header>
                <Title level={5} style={{ margin: 0 }}>
                    {t('notifications.title', 'Notifications')}
                </Title>
                <Tooltip title={t('notifications.markAllRead', 'Mark all as read')}>
                    <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllRead}
                        disabled={notifications.length === 0 || !notifications.some(n => !n.read)}
                    />
                </Tooltip>
            </Header>

            <NotificationList>
                {notifications.length > 0 ? (
                    notifications.map(item => (
                        <NotificationItem
                            key={item.id}
                            $read={item.read}
                            onClick={() => handleItemClick(item)}
                        >
                            <IconWrapper $type={item.type}>
                                {getIcon(item.type)}
                            </IconWrapper>
                            <Content>
                                <ItemHeader>
                                    <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                                    <TimeText>
                                        {dayjs(item.timestamp).locale(getLocale()).fromNow()}
                                    </TimeText>
                                </ItemHeader>
                                {item.message && (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {item.message}
                                    </Text>
                                )}
                            </Content>
                            <DeleteButton
                                className="delete-btn"
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(item.id);
                                }}
                            />
                        </NotificationItem>
                    ))
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={t('notifications.empty', 'No notifications')}
                        style={{ margin: '32px 0' }}
                    />
                )}
            </NotificationList>

            {notifications.length > 0 && (
                <Footer>
                    <Button type="link" size="small" onClick={handleClearAll} danger>
                        {t('notifications.clearAll', 'Clear all')}
                    </Button>
                </Footer>
            )}
        </PopoverContainer>
    );
};
