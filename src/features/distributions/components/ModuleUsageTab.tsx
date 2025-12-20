import React, { useState } from 'react';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { Table, Tag, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const { Text } = Typography;

interface ModuleUsageTabProps {
    softwareModuleId: number;
}

const ModuleUsageTab: React.FC<ModuleUsageTabProps> = ({ softwareModuleId }) => {
    useTranslation(['distributions', 'common']);
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const offset = (pagination.current - 1) * pagination.pageSize;

    // HawkBit RQL: assignedSM.id=={id}
    const { data, isLoading } = useGetDistributionSets({
        offset,
        limit: pagination.pageSize,
        q: `assignedSM.id==${softwareModuleId}`
    });

    const columns = [
        {
            title: 'DS Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <a onClick={() => navigate(`/distributions/sets/${record.id}`)}>{text}</a>
            )
        },
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
            render: (v: string) => <Tag color="blue">{v}</Tag>
        },
        {
            title: 'Type',
            dataIndex: 'typeName',
            key: 'typeName',
            render: (v: string) => <Tag color="cyan">{v}</Tag>
        },
        {
            title: 'Last Modified',
            dataIndex: 'lastModifiedAt',
            key: 'lastModifiedAt',
            render: (val: number) => val ? format(val, 'yyyy-MM-dd HH:mm:ss') : '-'
        }
    ];

    if (!data?.total && !isLoading) {
        return <Empty description="This module is not used in any Distribution Set" />;
    }

    return (
        <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: 16 }}>
                <Text strong>Distribution Sets using this module:</Text>
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

export default ModuleUsageTab;
