import React from 'react';
import { Card, Table, Button, Tag, message, Popconfirm } from 'antd';
import { CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useGetRollouts, useApprove } from '@/api/generated/rollouts/rollouts';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import type { MgmtRolloutResponseBody } from '@/api/generated/model';

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
`;

const HeaderWrapper = styled.div`
    padding: 24px 24px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
`;

export const PendingApprovalList: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin'; // Only admin can approve

    const { data, isLoading } = useGetRollouts({
        q: 'status==waiting_for_approval',
        limit: 5
    }, {
        query: { refetchInterval: 30000 }
    });

    const pendingRollouts = data?.content || [];

    const approveMutation = useApprove({
        mutation: {
            onSuccess: () => {
                message.success('Rollout approved successfully');
                queryClient.invalidateQueries({ queryKey: ['/rest/v1/rollouts'] });
            },
            onError: () => {
                message.error('Failed to approve rollout');
            }
        }
    });

    const handleApprove = (id: number) => {
        approveMutation.mutate({ rolloutId: id });
    };

    const columns = [
        {
            title: t('pendingApprovals.rollout'),
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: MgmtRolloutResponseBody) => (
                <a onClick={() => navigate(`/rollouts/${record.id}`)} style={{ fontWeight: 500 }}>
                    {text}
                </a>
            )
        },
        {
            title: t('pendingApprovals.groups'),
            key: 'groups',
            render: (_: any, record: MgmtRolloutResponseBody) => {
                // MgmtRollout usually has groups count or we can just show total targets
                return (
                    <Tag>{record.totalTargets || 0} Targets</Tag>
                );
            }
        },
        {
            key: 'action',
            width: 100,
            render: (_: any, record: MgmtRolloutResponseBody) => (
                isAdmin ? (
                    <Popconfirm
                        title="Approve this rollout?"
                        onConfirm={() => handleApprove(record.id!)}
                        okText="Approve"
                        cancelText="Cancel"
                    >
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            loading={approveMutation.isPending && approveMutation.variables?.rolloutId === record.id}
                        >
                            {t('pendingApprovals.approve')}
                        </Button>
                    </Popconfirm>
                ) : null
            )
        }
    ];

    return (
        <StyledCard>
            <HeaderWrapper>
                <span>
                    <SafetyCertificateOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    {t('pendingApprovals.title')}
                </span>
                {pendingRollouts.length > 0 && <Tag color="warning">{pendingRollouts.length}</Tag>}
            </HeaderWrapper>
            <Table
                dataSource={pendingRollouts}
                columns={columns}
                rowKey="id"
                pagination={false}
                loading={isLoading}
                locale={{ emptyText: t('pendingApprovals.noApprovals') }}
                size="small"
            />
        </StyledCard>
    );
};
