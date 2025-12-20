import React, { useState } from 'react';
import { useGetAssignedTargets1, useGetInstalledTargets } from '@/api/generated/distribution-sets/distribution-sets';
import { Table, Typography, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const { Text } = Typography;

interface SetTargetsTabProps {
    distributionSetId: number;
}

const SetTargetsTab: React.FC<SetTargetsTabProps> = ({ distributionSetId }) => {
    useTranslation(['distributions', 'common']);
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

    const columns = [
        {
            title: 'Controller ID',
            dataIndex: 'controllerId',
            key: 'controllerId',
            render: (text: string) => (
                <a onClick={() => navigate(`/targets/${text}`)}>{text}</a>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Last Contact',
            dataIndex: 'lastContact',
            key: 'lastContact',
            render: (val: number) => val ? format(val, 'yyyy-MM-dd HH:mm:ss') : '-'
        }
    ];

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Segmented
                    options={[
                        { label: 'Assigned Targets', value: 'assigned' },
                        { label: 'Installed Targets', value: 'installed' },
                    ]}
                    value={view}
                    onChange={(val) => {
                        setView(val as any);
                        setPagination({ ...pagination, current: 1 });
                    }}
                />
                <Text type="secondary">
                    Total: {data?.total || 0}
                </Text>
            </div>

            <Table
                dataSource={data?.content || []}
                rowKey="id"
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
        </div>
    );
};

export default SetTargetsTab;
