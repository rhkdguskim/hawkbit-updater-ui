/**
 * Target Detail Drawer Component
 * Side drawer for quick detail view without navigation
 */
import React from 'react';
import { Drawer, Tabs, Skeleton, Typography, Space, Tag, Descriptions, Button } from 'antd';
import {
    CloseOutlined,
    ExportOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { MgmtTarget } from '@/api/generated/model';
import { isTargetOnline } from '@/entities';
import dayjs from 'dayjs';
import styled from 'styled-components';

const { Text, Title } = Typography;

const DrawerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const DrawerContent = styled.div`
    .ant-descriptions-item-label {
        width: 140px;
    }
`;

interface TargetDetailDrawerProps {
    open: boolean;
    target: MgmtTarget | null;
    loading: boolean;
    t: (key: string, options?: Record<string, unknown>) => string;
    onClose: () => void;
}

export const TargetDetailDrawer: React.FC<TargetDetailDrawerProps> = ({
    open,
    target,
    loading,
    t,
    onClose,
}) => {
    const getStatusTag = () => {
        if (!target?.pollStatus?.lastRequestAt) {
            return <Tag color="default">{t('status.neverConnected')}</Tag>;
        }
        if (isTargetOnline(target)) {
            return <Tag color="green">{t('status.online')}</Tag>;
        }
        return <Tag color="red">{t('status.offline')}</Tag>;
    };

    const getUpdateStatusTag = () => {
        switch (target?.updateStatus) {
            case 'in_sync':
                return <Tag icon={<CheckCircleOutlined />} color="success">{t('status.inSync')}</Tag>;
            case 'pending':
                return <Tag icon={<SyncOutlined spin />} color="processing">{t('status.pending')}</Tag>;
            case 'error':
                return <Tag icon={<CloseCircleOutlined />} color="error">{t('status.error')}</Tag>;
            default:
                return <Tag icon={<ExclamationCircleOutlined />} color="default">{t('status.unknown')}</Tag>;
        }
    };

    return (
        <Drawer
            title={
                <DrawerHeader>
                    <Space direction="vertical" size={0}>
                        <Title level={5} style={{ margin: 0 }}>
                            {target?.name || target?.controllerId || t('detail.title')}
                        </Title>
                        {target?.description && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {target.description}
                            </Text>
                        )}
                    </Space>
                    <Space>
                        {target && (
                            <Link to={`/targets/${target.controllerId}`}>
                                <Button size="small" icon={<ExportOutlined />}>
                                    {t('actions.viewDetails')}
                                </Button>
                            </Link>
                        )}
                    </Space>
                </DrawerHeader>
            }
            placement="right"
            width={480}
            open={open}
            onClose={onClose}
            closeIcon={<CloseOutlined />}
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 8 }} />
            ) : target ? (
                <DrawerContent>
                    <Tabs
                        defaultActiveKey="info"
                        items={[
                            {
                                key: 'info',
                                label: t('detail.tabs.overview'),
                                children: (
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item label={t('table.controllerId')}>
                                            <Text copyable>{target.controllerId}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('table.name')}>
                                            {target.name || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('table.ipAddress')}>
                                            {target.ipAddress || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('overview.address')}>
                                            {target.address || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('table.status')}>
                                            {getStatusTag()}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('table.updateStatus')}>
                                            {getUpdateStatusTag()}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('table.targetType')}>
                                            {target.targetTypeName || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('table.autoConfirm')}>
                                            {target.autoConfirmActive ? (
                                                <Tag color="green">{t('autoConfirm.enabled')}</Tag>
                                            ) : (
                                                <Tag>{t('autoConfirm.disabled')}</Tag>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('overview.lastPoll')}>
                                            {target.pollStatus?.lastRequestAt
                                                ? dayjs(target.pollStatus.lastRequestAt).format('YYYY-MM-DD HH:mm:ss')
                                                : t('overview.never')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('overview.nextPoll')}>
                                            {target.pollStatus?.nextExpectedRequestAt
                                                ? dayjs(target.pollStatus.nextExpectedRequestAt).format('YYYY-MM-DD HH:mm:ss')
                                                : '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('overview.created')}>
                                            {target.createdAt
                                                ? dayjs(target.createdAt).format('YYYY-MM-DD HH:mm')
                                                : '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={t('overview.lastModified')}>
                                            {target.lastModifiedAt
                                                ? dayjs(target.lastModifiedAt).format('YYYY-MM-DD HH:mm')
                                                : '-'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                ),
                            },
                        ]}
                    />
                </DrawerContent>
            ) : (
                <Text type="secondary">{t('detail.notFoundTitle')}</Text>
            )}
        </Drawer>
    );
};

export default TargetDetailDrawer;
