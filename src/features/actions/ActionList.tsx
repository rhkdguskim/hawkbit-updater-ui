import React, { useCallback, useState } from 'react';
import { Card, Table, Tag, Space, Button, Select, Typography, Input, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetActions } from '@/api/generated/actions/actions';
import type { MgmtAction } from '@/api/generated/model';
import type { TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { keepPreviousData } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { Option } = Select;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    padding: 24px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'finished':
            return 'success';
        case 'error':
            return 'error';
        case 'running':
            return 'processing';
        case 'pending':
            return 'default';
        case 'canceled':
            return 'warning';
        case 'canceling':
            return 'warning';
        case 'wait_for_confirmation':
            return 'purple';
        default:
            return 'default';
    }
};

const isActionErrored = (action: MgmtAction) => {
    const status = action.status?.toLowerCase() || '';
    const detail = action.detailStatus?.toLowerCase() || '';
    const hasErrorStatus = status === 'error' || status === 'failed';
    const hasErrorDetail = detail.includes('error') || detail.includes('failed');
    const hasErrorCode = typeof action.lastStatusCode === 'number' && action.lastStatusCode >= 400;
    return hasErrorStatus || hasErrorDetail || hasErrorCode;
};

const getActionDisplayStatus = (action: MgmtAction) => {
    if (isActionErrored(action)) {
        return 'error';
    }
    return action.status;
};

const ActionList: React.FC = () => {
    const { t } = useTranslation(['actions', 'common']);
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const offset = (pagination.current - 1) * pagination.pageSize;

    // Build query filter
    const buildQuery = () => {
        const filters: string[] = [];
        if (statusFilter.length > 0) {
            // Multiple status filter: status=in=(pending,running)
            filters.push(`status=in=(${statusFilter.join(',')})`);
        }
        if (searchQuery) {
            filters.push(`target.name==*${searchQuery}*`);
        }
        return filters.length > 0 ? filters.join(';') : undefined;
    };

    // Check if any running actions exist for auto-refresh
    const hasRunningActions = (content?: MgmtAction[]) =>
        content?.some((a) => ['running', 'pending', 'canceling'].includes(a.status || ''));

    const { data, isLoading, isFetching, refetch } = useGetActions(
        {
            offset,
            limit: pagination.pageSize,
            q: buildQuery(),
        },
        {
            query: {
                refetchInterval: (query) => {
                    return hasRunningActions(query.state.data?.content) ? 5000 : false;
                },
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

    const getTypeLabel = (type?: string) => {
        if (!type) return '-';
        const key = type.toLowerCase();
        return t(`actions:typeLabels.${key}`, { defaultValue: type.toUpperCase() });
    };

    const columns: TableProps<MgmtAction>['columns'] = [
        {
            title: t('columns.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: t('columns.status'),
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (_: string, record) => {
                const displayStatus = getActionDisplayStatus(record);
                return (
                    <Tag color={getStatusColor(displayStatus)}>
                        {getStatusLabel(displayStatus)}
                    </Tag>
                );
            },
        },
        {
            title: t('columns.type'),
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type: string) => (
                <Tag color={type === 'forced' ? 'red' : 'blue'}>
                    {getTypeLabel(type)}
                </Tag>
            ),
        },
        {
            title: t('columns.distributionSet'),
            key: 'distributionSet',
            render: (_, record) => (
                <span>
                    {record._links?.distributionset?.name || '-'}
                </span>
            ),
        },
        {
            title: t('columns.forceType'),
            dataIndex: 'forceType',
            key: 'forceType',
            width: 100,
            render: (text: string) => text ? t(`forceTypes.${text}`) : '-',
        },
        {
            title: t('columns.actions'),
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Tooltip title={t('actions.view')}>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/actions/${record.id}`)}
                    />
                </Tooltip>
            ),
        },
    ];

    const handleTableChange: TableProps<MgmtAction>['onChange'] = (paginationConfig) => {
        setPagination({
            current: paginationConfig.current || 1,
            pageSize: paginationConfig.pageSize || 20,
        });
    };

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    const handleStatusChange = useCallback((value: string[]) => {
        setStatusFilter(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    return (
        <PageContainer>
            <HeaderRow>
                <div>
                    <Title level={2} style={{ margin: 0 }}>{t('pageTitle')}</Title>
                    <Text type="secondary">{t('subtitle')}</Text>
                </div>
            </HeaderRow>

            <Card
                style={{ flex: 1, height: '100%', overflow: 'hidden' }}
                styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
            >
                <Space style={{ marginBottom: 16 }} wrap>
                    <Input
                        placeholder={t('filter.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={{ width: 220 }}
                        allowClear
                    />
                    <Select
                        mode="multiple"
                        placeholder={t('filter.statusPlaceholder')}
                        value={statusFilter}
                        onChange={handleStatusChange}
                        allowClear
                        style={{ minWidth: 220 }}
                    >
                        <Option value="pending">{t('filter.pending')}</Option>
                        <Option value="running">{t('filter.running')}</Option>
                        <Option value="finished">{t('filter.finished')}</Option>
                        <Option value="error">{t('filter.error')}</Option>
                        <Option value="canceled">{t('filter.canceled')}</Option>
                        <Option value="wait_for_confirmation">{t('filter.waitForConfirmation')}</Option>
                    </Select>
                    <Button onClick={() => {
                        setSearchQuery('');
                        setStatusFilter([]);
                        setPagination((prev) => ({ ...prev, current: 1 }));
                    }}>
                        {t('filter.clearFilters')}
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        loading={isLoading || isFetching}
                    >
                        {t('refresh')}
                    </Button>
                </Space>

                <div style={{ flex: 1, minHeight: 0 }}>
                    <Table
                        dataSource={data?.content || []}
                        columns={columns}
                        rowKey="id"
                        loading={isLoading || isFetching}
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

export default ActionList;
