import React from 'react';
import { Table, Tag, Typography, Skeleton, Empty, Button, Space, Tooltip, Modal, Timeline } from 'antd';
import type { TableProps } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    StopOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import type { MgmtAction, PagedListMgmtAction } from '@/api/generated/model';
import dayjs from 'dayjs';
import { useState, useMemo } from 'react';
import { useGetActionStatusList } from '@/api/generated/targets/targets';

const { Text } = Typography;

interface ActionsTabProps {
    data: PagedListMgmtAction | null | undefined;
    loading: boolean;
    targetId: string;
    onCancelAction?: (action: MgmtAction) => void;
    onForceAction?: (action: MgmtAction) => void;
    canForce?: boolean;
    canCancel?: boolean;
}

const getStatusIcon = (status?: string) => {
    switch (status) {
        case 'finished':
            return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        case 'error':
            return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
        case 'running':
            return <SyncOutlined spin style={{ color: '#1890ff' }} />;
        case 'pending':
        case 'waiting':
            return <ClockCircleOutlined style={{ color: '#faad14' }} />;
        case 'canceled':
            return <StopOutlined style={{ color: '#8c8c8c' }} />;
        default:
            return <ClockCircleOutlined />;
    }
};

import { useTranslation } from 'react-i18next';
// ...

const ActionsTab: React.FC<ActionsTabProps> = ({
    data,
    loading,
    targetId,
    onCancelAction,
    onForceAction,
    canForce,
    canCancel,
}) => {
    const { t } = useTranslation(['targets', 'actions', 'common']);
    const [selectedAction, setSelectedAction] = useState<MgmtAction | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { data: statusData, isLoading: statusLoading } = useGetActionStatusList(
        targetId,
        selectedAction?.id || 0,
        undefined,
        {
            query: {
                enabled: modalOpen && !!selectedAction?.id,
            },
        }
    );
    if (loading) {
        return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    if (!data?.content?.length) {
        return <Empty description={t('common:messages.noData')} />;
    }

    const getStatusTag = (status?: string) => {
        const icon = getStatusIcon(status);
        const colorMap: Record<string, string> = {
            finished: 'success',
            error: 'error',
            running: 'processing',
            pending: 'warning',
            waiting: 'warning',
            canceled: 'default',
        };
        const label = status
            ? t(`common:status.${status.toLowerCase()}`, { defaultValue: status.toUpperCase() })
            : t('common:status.unknown');
        return (
            <Tag icon={icon} color={colorMap[status || ''] || 'default'}>
                {label}
            </Tag>
        );
    };

    const getStatusTone = (status?: string, code?: number) => {
        const normalized = status?.toLowerCase() || '';
        if (normalized.includes('error') || normalized.includes('failed') || (code && code >= 400)) {
            return 'error';
        }
        if (normalized.includes('finished') || normalized.includes('success')) {
            return 'success';
        }
        if (normalized.includes('running') || normalized.includes('processing') || normalized.includes('retrieving')) {
            return 'processing';
        }
        if (normalized.includes('pending') || normalized.includes('waiting')) {
            return 'warning';
        }
        return 'default';
    };

    const getForceTypeTag = (forceType?: string) => {
        if (forceType === 'forced') {
            return <Tag color="orange">{t('assign.forced')}</Tag>;
        }
        return <Tag>{t('assign.soft')}</Tag>;
    };

    const getTypeLabel = (type?: string) => {
        if (!type) return '-';
        const key = type.toLowerCase();
        return t(`actions:typeLabels.${key}`, { defaultValue: type.toUpperCase() });
    };

    const columns: TableProps<MgmtAction>['columns'] = [
        {
            title: t('table.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <Text strong>#{id}</Text>,
        },
        {
            title: t('table.status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => getStatusTag(status),
        },
        {
            title: t('table.type'),
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => <Tag>{getTypeLabel(type)}</Tag>,
        },
        {
            title: t('table.forceType'),
            dataIndex: 'forceType',
            key: 'forceType',
            width: 100,
            render: (forceType: string) => getForceTypeTag(forceType),
        },
        {
            title: t('table.started'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value: number) =>
                value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-',
        },
        {
            title: t('table.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            render: (value: number) =>
                value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-',
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 150,
            render: (_, record) => {
                const isActive = record.status === 'running' || record.status === 'pending';
                const canBeForced = record.forceType !== 'forced' && isActive;

                return (
                    <Space size="small">
                        <Tooltip title={t('actions.viewDetails')}>
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    setSelectedAction(record);
                                    setModalOpen(true);
                                }}
                            />
                        </Tooltip>
                        {canForce && canBeForced && onForceAction && (
                            <Tooltip title={t('actions.force')}>
                                <Button
                                    type="text"
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => onForceAction(record)}
                                />
                            </Tooltip>
                        )}
                        {canCancel && isActive && onCancelAction && (
                            <Tooltip title={t('actions.cancel')}>
                                <Button
                                    type="text"
                                    danger
                                    icon={<StopOutlined />}
                                    onClick={() => onCancelAction(record)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <Table<MgmtAction>
                columns={columns}
                dataSource={data.content}
                rowKey="id"
                pagination={false}
                size="middle"
            />
            <Modal
                title={t('actions:statusHistoryTitle')}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                destroyOnClose
                width={640}
            >
                {selectedAction && (
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Space>
                            <Text strong>
                                {t('actions:statusHistoryHeader', { id: selectedAction.id })}
                            </Text>
                            {getStatusTag(selectedAction.status)}
                        </Space>
                        {statusLoading ? (
                            <Skeleton active paragraph={{ rows: 4 }} />
                        ) : statusData?.content?.length ? (
                            <Timeline
                                items={[...statusData.content]
                                    .sort((a, b) => (b.reportedAt || b.timestamp || 0) - (a.reportedAt || a.timestamp || 0))
                                    .map((status) => ({
                                        color: getStatusTone(status.type, status.code),
                                        children: (
                                            <Space direction="vertical" size={4}>
                                                <Text strong>
                                                    {status.type || t('common:status.unknown')}
                                                </Text>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {status.reportedAt || status.timestamp
                                                        ? dayjs(status.reportedAt || status.timestamp).format('YYYY-MM-DD HH:mm')
                                                        : '-'}
                                                </Text>
                                                {status.code !== undefined && (
                                                    <Tag>{t('actions:statusCode', { code: status.code })}</Tag>
                                                )}
                                                {status.messages?.length ? (
                                                    <Space direction="vertical" size={2}>
                                                        {status.messages.map((message, index) => (
                                                            <Text key={`${status.id}-${index}`}>{message}</Text>
                                                        ))}
                                                    </Space>
                                                ) : null}
                                            </Space>
                                        ),
                                    }))}
                            />
                        ) : (
                            <Empty description={t('actions:statusHistoryEmpty')} />
                        )}
                    </Space>
                )}
            </Modal>
        </>
    );
};

export default ActionsTab;
