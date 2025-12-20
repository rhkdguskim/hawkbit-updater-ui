import React from 'react';
import { Card, Row, Col, Statistic, Button, Badge } from 'antd';
import {
    ClockCircleOutlined,
    SyncOutlined,
    SafetyCertificateOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetRollouts } from '@/api/generated/rollouts/rollouts';

const StyledCard = styled(Card)`
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .ant-card-body {
        padding: 24px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
`;

const StatusItem = styled.div<{ $clickable?: boolean }>`
    text-align: center;
    padding: 12px 8px;
    border-radius: 8px;
    transition: all 0.2s;
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};

    &:hover {
        background-color: ${props => props.$clickable ? 'rgba(0,0,0,0.02)' : 'transparent'};
    }
`;

export const RolloutStatusCard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();

    // Parallel fetching for counts
    // Using limit=1 to minimize data transfer, we only need 'total' from metadata
    const queryOptions = { query: { refetchInterval: 30000 } }; // 30s polling per PRD

    const { data: readyData, isLoading: readyLoading } = useGetRollouts({ q: 'status==ready', limit: 1 }, queryOptions);
    const { data: runningData, isLoading: runningLoading } = useGetRollouts({ q: 'status==running', limit: 1 }, queryOptions);
    const { data: waitingData, isLoading: waitingLoading } = useGetRollouts({ q: 'status==waiting_for_approval', limit: 1 }, queryOptions);
    const { data: stoppedData, isLoading: stoppedLoading } = useGetRollouts({ q: 'status==stopped', limit: 1 }, queryOptions);

    const readyCount = readyData?.total || 0;
    const runningCount = runningData?.total || 0;
    const waitingCount = waitingData?.total || 0;
    const stoppedCount = stoppedData?.total || 0;

    const isLoading = readyLoading || runningLoading || waitingLoading || stoppedLoading;

    const handleNavigate = (status: string) => {
        navigate(`/rollouts?q=status==${status}`);
    };

    return (
        <StyledCard
            loading={isLoading}
            title={t('rolloutStatus.title')}
            extra={
                waitingCount > 0 && (
                    <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => handleNavigate('waiting_for_approval')}
                    >
                        {t('rolloutStatus.approveAll')}
                    </Button>
                )
            }
        >
            <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ height: '100%' }}>
                <Col span={6}>
                    <StatusItem $clickable onClick={() => handleNavigate('ready')}>
                        <Statistic
                            title={t('rolloutStatus.ready')}
                            value={readyCount}
                            prefix={<ClockCircleOutlined style={{ color: '#8c8c8c' }} />}
                            styles={{ content: { fontSize: '1.5rem', fontWeight: 600 } }}
                        />
                    </StatusItem>
                </Col>
                <Col span={6}>
                    <StatusItem $clickable onClick={() => handleNavigate('running')}>
                        <Statistic
                            title={t('rolloutStatus.running')}
                            value={runningCount}
                            prefix={<SyncOutlined spin style={{ color: '#1890ff' }} />}
                            styles={{ content: { fontSize: '1.5rem', fontWeight: 600, color: '#1890ff' } }}
                        />
                    </StatusItem>
                </Col>
                <Col span={6}>
                    {waitingCount > 0 ? (
                        <Badge count={waitingCount} offset={[10, 0]}>
                            <StatusItem $clickable onClick={() => handleNavigate('waiting_for_approval')}>
                                <Statistic
                                    title={t('rolloutStatus.waitingApproval')}
                                    value={waitingCount}
                                    prefix={<SafetyCertificateOutlined style={{ color: '#faad14' }} />}
                                    styles={{ content: { fontSize: '1.5rem', fontWeight: 600, color: '#faad14' } }}
                                />
                            </StatusItem>
                        </Badge>
                    ) : (
                        <StatusItem $clickable onClick={() => handleNavigate('waiting_for_approval')}>
                            <Statistic
                                title={t('rolloutStatus.waitingApproval')}
                                value={0}
                                prefix={<SafetyCertificateOutlined style={{ color: '#d9d9d9' }} />}
                                styles={{ content: { fontSize: '1.5rem', fontWeight: 600, color: '#d9d9d9' } }}
                            />
                        </StatusItem>
                    )}
                </Col>
                <Col span={6}>
                    <StatusItem $clickable onClick={() => handleNavigate('stopped')}>
                        <Statistic
                            title={t('rolloutStatus.stopped')}
                            value={stoppedCount}
                            prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                            styles={{ content: { fontSize: '1.5rem', fontWeight: 600, color: '#ff4d4f' } }}
                        />
                    </StatusItem>
                </Col>
            </Row>
        </StyledCard>
    );
};
