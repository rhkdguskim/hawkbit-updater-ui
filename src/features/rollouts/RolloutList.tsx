import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Space, Button, Select, Typography, Progress } from 'antd';
import { ReloadOutlined, PlusOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';
import type { TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/useAuthStore';
import styled from 'styled-components';
import { keepPreviousData } from '@tanstack/react-query';

const { Title, Text } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    height: 100%;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

const HeaderMeta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const FilterBar = styled(Card)`
    border-radius: 14px;
`;

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'finished':
            return 'success';
        case 'running':
            return 'processing';
        case 'paused':
            return 'warning';
        case 'ready':
            return 'cyan';
        case 'creating':
            return 'default';
        case 'starting':
            return 'blue';
        case 'error':
            return 'error';
        case 'waiting_for_approval':
            return 'purple';
        default:
            return 'default';
    }
};

const RolloutList: React.FC = () => {
    const { t } = useTranslation(['rollouts', 'common']);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [statusFilter, setStatusFilter] = useState<string>('');

    const offset = (pagination.current - 1) * pagination.pageSize;

    useEffect(() => {
        const statusParam = searchParams.get('status') || '';
        setStatusFilter(statusParam);
    }, [searchParams]);

    const { data, isLoading, isFetching, refetch } = useGetRollouts(
        {
            offset,
            limit: pagination.pageSize,
            q: statusFilter ? `status==${statusFilter}` : undefined,
        },
        {
            query: {
                placeholderData: keepPreviousData,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        }
    );

    const getStatusLabel = (status?: string) => {
        if (!status) return t('common:status.unknown', { defaultValue: 'UNKNOWN' });
        const key = status.toLowerCase();
        return t(`common:status.${key}`, { defaultValue: status.replace(/_/g, ' ').toUpperCase() });
    };

    const statusOptions = useMemo(() => [
        { value: 'creating', label: t('filter.creating') },
        { value: 'ready', label: t('filter.ready') },
        { value: 'starting', label: t('filter.starting') },
        { value: 'running', label: t('filter.running') },
        { value: 'paused', label: t('filter.paused') },
        { value: 'finished', label: t('filter.finished') },
        { value: 'error', label: t('filter.error') },
        { value: 'waiting_for_approval', label: t('filter.waitingForApproval') },
        { value: 'scheduled', label: t('filter.scheduled') },
    ], [t]);

    const columns: TableProps<MgmtRolloutResponseBody>['columns'] = [
        {
            title: t('columns.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: t('columns.name'),
            dataIndex: 'name',
            key: 'name',
            render: (value: string, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{value}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {t('columns.totalTargets')}: {record.totalTargets || 0}
                    </Text>
                </Space>
            ),
        },
        {
            title: t('columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => (
                <Tag color={getStatusColor(status)} style={{ borderRadius: 999 }}>
                    {getStatusLabel(status)}
                </Tag>
            ),
        },
        {
            title: t('columns.progress'),
            key: 'progress',
            width: 200,
            render: (_, record) => {
                const total = record.totalTargets || 0;
                const finished = (record.totalTargetsPerStatus as Record<string, number>)?.finished || 0;
                const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
                return (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Progress
                            percent={percent}
                            size="small"
                            status={record.status === 'error' ? 'exception' : undefined}
                            strokeColor={record.status === 'error' ? undefined : '#3b82f6'}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('columns.progressLabel', { percent })}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: t('columns.actions'),
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/rollouts/${record.id}`)}
                >
                    {t('actions.view')}
                </Button>
            ),
        },
    ];

    const handleTableChange: TableProps<MgmtRolloutResponseBody>['onChange'] = (paginationConfig) => {
        setPagination({
            current: paginationConfig.current || 1,
            pageSize: paginationConfig.pageSize || 20,
        });
    };

    const handleStatusChange = (value?: string) => {
        const nextValue = value || '';
        setStatusFilter(nextValue);
        setPagination((prev) => ({ ...prev, current: 1 }));
        if (nextValue) {
            setSearchParams({ status: nextValue });
        } else {
            setSearchParams({});
        }
    };

    return (
        <PageContainer>
            <HeaderRow>
                <HeaderMeta>
                    <Title level={2} style={{ margin: 0 }}>{t('pageTitle')}</Title>
                    <Text type="secondary">{t('subtitle')}</Text>
                </HeaderMeta>
                <Space>
                    {isAdmin && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/rollouts/create')}
                        >
                            {t('createRollout')}
                        </Button>
                    )}
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        {t('refresh')}
                    </Button>
                </Space>
            </HeaderRow>

            <FilterBar>
                <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space wrap>
                        <Select
                            placeholder={t('filter.placeholder')}
                            value={statusFilter || undefined}
                            onChange={handleStatusChange}
                            allowClear
                            style={{ width: 220 }}
                            suffixIcon={<FilterOutlined />}
                            options={statusOptions}
                        />
                        {statusFilter && (
                            <Tag color={getStatusColor(statusFilter)} style={{ borderRadius: 999 }}>
                                {getStatusLabel(statusFilter)}
                            </Tag>
                        )}
                        <Button onClick={() => handleStatusChange('')} disabled={!statusFilter}>
                            {t('filter.clearFilters')}
                        </Button>
                    </Space>
                </Space>
            </FilterBar>

            <Card
                style={{ flex: 1, height: '100%', overflow: 'hidden' }}
                styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
            >
                <div style={{ flex: 1, minHeight: 0 }}>
                    <Table
                        dataSource={data?.content || []}
                        columns={columns}
                        rowKey="id"
                        loading={isLoading || isFetching}
                        locale={{ emptyText: t('empty') }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: data?.total || 0,
                            showSizeChanger: true,
                            showTotal: (total, range) => t('pagination.range', { start: range[0], end: range[1], total }),
                            position: ['topRight'],
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1000, y: '100%' }}
                    />
                </div>
            </Card>
        </PageContainer>
    );
};

export default RolloutList;
