import React, { useState } from 'react';
import { Tag, Typography, Skeleton, Empty, Button, Space, Tooltip, Modal } from 'antd';
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
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useGetActionStatusList } from '@/api/generated/targets/targets';
import { ActionStatusTimeline } from '@/components/common/ActionStatusTimeline';
import { EnhancedTable } from '@/components/patterns';
import { useTranslation } from 'react-i18next';

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
            return <CheckCircleOutlined style={{ color: 'var(--ant-color-success)' }} />;
        case 'error':
            return <CloseCircleOutlined style={{ color: 'var(--ant-color-error)' }} />;
        case 'running':
            return <SyncOutlined spin style={{ color: 'var(--ant-color-info)' }} />;
        case 'pending':
        case 'waiting':
            return <ClockCircleOutlined style={{ color: 'var(--ant-color-warning)' }} />;
        case 'canceled':
            return <StopOutlined style={{ color: 'var(--ant-color-text-quaternary)' }} />;
        default:
            return <ClockCircleOutlined />;
    }
};

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
                enabled: modalOpen && !!selectedAction?.id && !!targetId,
            },
        }
    );

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

    const getTypeLabel = (type?: string) => {
        if (!type) return '-';
        const key = type.toLowerCase();
        return t(`actions:typeLabels.${key}`, { defaultValue: type.toUpperCase() });
    };

    const getForceTypeTag = (forceType?: string) => {
        if (forceType === 'forced') {
            return <Tag color="orange">{t('assign.forced')}</Tag>;
        }
        return <Tag>{t('assign.soft')}</Tag>;
    };

    const columns: ColumnsType<MgmtAction> = [
        {
            title: t('table.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <Text strong style={{ fontSize: 12 }}>#{id}</Text>,
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
            render: (type: string) => <Tag style={{ fontSize: 12 }}>{getTypeLabel(type)}</Tag>,
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
            width: 130,
            render: (value: number) => (
                <Text style={{ fontSize: 12 }}>
                    {value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'}
                </Text>
            ),
        },
        {
            title: t('table.lastModified'),
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            width: 130,
            render: (value: number) => (
                <Text style={{ fontSize: 12 }}>
                    {value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'}
                </Text>
            ),
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_: any, record: MgmtAction) => {
                const isActive = record.status === 'running' || record.status === 'pending';
                const canBeForced = record.forceType !== 'forced' && isActive;

                return (
                    <Space size={0} className="action-cell">
                        <Tooltip title={t('actions.viewDetails')}>
                            <Button
                                type="text"
                                size="small"
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
                                    size="small"
                                    icon={<ThunderboltOutlined />}
                                    onClick={() => onForceAction(record)}
                                />
                            </Tooltip>
                        )}
                        {canCancel && isActive && onCancelAction && (
                            <Tooltip title={t('actions.cancel')}>
                                <Button
                                    type="text"
                                    size="small"
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

    if (loading) {
        return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    if (!data?.content?.length) {
        return <Empty description={t('common:messages.noData')} />;
    }

    return (
        <>
            <EnhancedTable<MgmtAction>
                columns={columns}
                dataSource={data.content}
                rowKey="id"
                pagination={false}
                scroll={{ x: 800 }}
            />
            <Modal
                title={
                    <Space align="center">
                        <Text strong>{t('actions:statusHistoryTitle')}</Text>
                        <Tag color="blue">{selectedAction ? `#${selectedAction.id}` : ''}</Tag>
                    </Space>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                destroyOnHidden={true}
                width={680}
            >
                {selectedAction && (
                    <Space direction="vertical" size="middle" style={{ width: '100%', paddingTop: 16 }}>
                        <Space align="center" style={{ width: '100%', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <Space>
                                {getStatusTag(selectedAction.status)}
                                <Text type="secondary">{dayjs(selectedAction.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
                            </Space>
                        </Space>
                        {statusLoading ? (
                            <Skeleton active paragraph={{ rows: 4 }} />
                        ) : (
                            <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                                <ActionStatusTimeline
                                    statuses={statusData?.content}
                                    emptyText={t('actions:statusHistoryEmpty')}
                                />
                            </div>
                        )}
                    </Space>
                )}
            </Modal>
        </>
    );
};

export default ActionsTab;
