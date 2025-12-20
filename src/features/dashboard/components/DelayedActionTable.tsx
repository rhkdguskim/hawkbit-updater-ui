import React from 'react';
import { Card, Table, Tag, Button, Tooltip } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetActions } from '@/api/generated/actions/actions';
import dayjs from 'dayjs';
import type { MgmtAction } from '@/api/generated/model';

const StyledCard = styled(Card)`
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .ant-card-body {
        padding: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .ant-table-wrapper {
        flex: 1;
        overflow: hidden;
    }
`;

const HeaderWrapper = styled.div`
    padding: 24px 24px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
`;

export const DelayedActionTable: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();

    // Fetch active actions only to reduce payload
    // status!=finished;status!=error;status!=canceled
    // Note: FIQL injection might be tricky with multiple '!='.
    // simpler: fetch all recent or just fetch active if possible.
    // HawkBit FIQL: status=in=(SCHEDULED,RETRIEVING,RUNNING)
    // Fetch recent actions and filter client-side to avoid API restrictions/errors
    const { data, isLoading } = useGetActions({
        limit: 100
    }, {
        query: { refetchInterval: 15000 }
    });

    const activeActions = data?.content
        ? data.content.filter(a => ['scheduled', 'retrieving', 'running'].includes(a.status?.toLowerCase() || ''))
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
        : [];
    const now = dayjs();

    const delayedActions = activeActions.filter(action => {
        if (!action.createdAt) return false;
        const created = dayjs(action.createdAt);
        const diffMinutes = now.diff(created, 'minute');
        const status = action.status?.toLowerCase();

        if (status === 'running') {
            return diffMinutes > 30; // Running > 30m
        } else {
            // scheduled, retrieving
            return diffMinutes > 10; // Pending > 10m
        }
    });

    const columns = [
        {
            title: t('delayedActions.target'),
            dataIndex: 'id', // Action ID isn't target name.
            key: 'target',
            render: (_: any, record: MgmtAction) => (
                // We assume UI needs to fetch target name or just show links
                // Record usually doesn't have target Name deeply populated unless expanded?
                // HawkBit Action model has nothing about Target Name directly. It usually has targetId URL.
                // We'll show Action ID or check if we can get Target info.
                // Actually MgmtAction usually has `params` or `messages`.
                // Let's just show "Action #{id}" and maybe "forceType".
                // If we really need Target Name, we would need to fetch targets or use a more complex API.
                // For now, let's link to Action Detail.
                <span style={{ fontWeight: 500 }}>#{record.id}</span>
            )
        },
        {
            title: t('delayedActions.forceType'),
            dataIndex: 'forceTime',
            key: 'forceType',
            render: (forceTime: number) => (
                <Tag color={forceTime === -1 ? 'orange' : 'blue'}>
                    {forceTime === -1 ? 'FORCED' : 'SOFT'}
                </Tag>
            )
        },
        {
            title: t('delayedActions.elapsed'),
            key: 'elapsed',
            render: (_: any, record: MgmtAction) => {
                const created = dayjs(record.createdAt);
                const diff = now.diff(created, 'minute');
                return (
                    <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                        {diff}m
                    </span>
                );
            }
        },
        {
            key: 'action',
            width: 50,
            render: (_: any, record: MgmtAction) => (
                <Tooltip title="View Detail">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => navigate(`/actions?q=id==${record.id}`)} // Or specific detail page
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <StyledCard>
            <HeaderWrapper>
                <span>
                    <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    {t('delayedActions.title')}
                </span>
                {delayedActions.length > 0 && <Tag color="error">{delayedActions.length}</Tag>}
            </HeaderWrapper>
            <Table
                dataSource={delayedActions}
                columns={columns}
                rowKey="id"
                pagination={false}
                scroll={{ y: 200 }}
                loading={isLoading}
                locale={{ emptyText: t('delayedActions.noDelayed') }}
                size="small"
            />
        </StyledCard>
    );
};
