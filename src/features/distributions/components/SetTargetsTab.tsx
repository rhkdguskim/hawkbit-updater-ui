import React, { useState } from 'react';
import { useGetAssignedTargets1, useGetInstalledTargets } from '@/api/generated/distribution-sets/distribution-sets';
import { Table, Typography, Segmented, Space, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { MgmtTarget } from '@/api/generated/model';

const { Text } = Typography;

interface SetTargetsTabProps {
    distributionSetId: number;
}

const SetTargetsTab: React.FC<SetTargetsTabProps> = ({ distributionSetId }) => {
    const { t } = useTranslation(['distributions', 'targets', 'common']);
    const navigate = useNavigate();
    const [view, setView] = useState<'assigned' | 'installed'>('assigned');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const offset = (pagination.current - 1) * pagination.pageSize;

    const assignedQuery = useGetAssignedTargets1(distributionSetId, {
        offset,
        limit: pagination.pageSize,
    }, { query: { enabled: view === 'assigned' } });

    const installedQuery = useGetInstalledTargets(distributionSetId, {
        offset,
        limit: pagination.pageSize,
    }, { query: { enabled: view === 'installed' } });

    const data = view === 'assigned' ? assignedQuery.data : installedQuery.data;
    const isLoading = view === 'assigned' ? assignedQuery.isLoading : installedQuery.isLoading;
    const isError = view === 'assigned' ? assignedQuery.isError : installedQuery.isError;

    const getTargetId = (target: MgmtTarget) => {
        if (target.controllerId) return target.controllerId;
        const link = target._links?.self?.href;
        return link ? link.split('/').pop() || '' : '';
    };

    const columns: ColumnsType<MgmtTarget> = [
        {
            title: t('targets:table.controllerId'),
            dataIndex: 'controllerId',
            key: 'controllerId',
            render: (_text: string, record: MgmtTarget) => {
                const targetId = getTargetId(record);
                return targetId ? (
                    <a onClick={() => navigate(`/targets/${targetId}`)}>{targetId}</a>
                ) : (
                    <Text type="secondary">-</Text>
                );
            }
        },
        {
            title: t('targets:table.name'),
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: MgmtTarget) => text || record.controllerId || <Text type="secondary">-</Text>,
        },
        {
            title: t('targets:form.description'),
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text: string | undefined) => text || <Text type="secondary">-</Text>,
        },
        {
            title: t('targets:table.lastControllerRequest'),
            key: 'lastContact',
            render: (_value: unknown, record: MgmtTarget) => {
                const timestamp = view === 'installed'
                    ? record.installedAt
                    : record.lastControllerRequestAt || record.pollStatus?.lastRequestAt;
                return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '-';
            }
        }
    ];

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Segmented
                    options={[
                        { label: t('detail.assignedTargets'), value: 'assigned' },
                        { label: t('detail.installedTargets'), value: 'installed' },
                    ]}
                    value={view}
                    onChange={(val) => {
                        setView(val as 'assigned' | 'installed');
                        setPagination({ ...pagination, current: 1 });
                    }}
                />
                <Text type="secondary">
                    {t('detail.total')}: {data?.total || 0}
                </Text>
            </div>

            {isError ? (
                <Empty description={t('common:messages.error')} />
            ) : (
                <Table
                    dataSource={data?.content || []}
                    rowKey={(record, index) => getTargetId(record) || record.name || `row-${index}`}
                    loading={isLoading}
                    columns={columns}
                    pagination={{
                        ...pagination,
                        total: data?.total || 0,
                        showSizeChanger: true,
                    }}
                    onChange={(p) => setPagination({ current: p.current || 1, pageSize: p.pageSize || 10 })}
                    size="small"
                />
            )}
        </Space>
    );
};

export default SetTargetsTab;
