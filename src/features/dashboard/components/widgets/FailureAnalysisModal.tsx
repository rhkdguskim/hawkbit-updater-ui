import React from 'react';
import { List, Typography, Progress, Flex, Button, Card, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleOutlined, ArrowRightOutlined, AimOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { StandardModal } from '@/components/patterns';

const { Text, Paragraph } = Typography;

const TitleRow = styled(Flex)`
    && {
        align-items: center;
    }
`;

const TitleIcon = styled(ExclamationCircleOutlined)`
    color: var(--ant-color-error);
`;

const MetaText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

const CauseCard = styled(Card)`
    && {
        margin-bottom: 16px;
        border-radius: 12px;
        .ant-card-body {
            padding: 16px;
        }
    }
`;

const TargetListContainer = styled.div`
    margin-top: 12px;
    padding: 8px 12px;
    background: var(--ant-color-fill-quaternary);
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
`;

const ActionRow = styled(Flex)`
    padding: 6px 0;
    &:not(:last-child) {
        border-bottom: 1px solid var(--ant-color-border-secondary);
    }
`;

interface FailureAnalysisModalProps {
    visible: boolean;
    onClose: () => void;
    errorAnalysis: {
        cause: string;
        count: number;
        percentage: number;
        actions: import('@/api/generated/model').MgmtAction[];
    }[];
}

export const FailureAnalysisModal: React.FC<FailureAnalysisModalProps> = ({
    visible,
    onClose,
    errorAnalysis
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const navigate = useNavigate();

    return (
        <StandardModal
            title={
                <TitleRow gap="small">
                    <TitleIcon />
                    <span>{t('charts.failureAnalysis')}</span>
                </TitleRow>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t('common:actions.close')}
                </Button>,
                <Button
                    key="all"
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => {
                        onClose();
                        navigate('/actions');
                    }}
                >
                    {t('common:labels.viewAll', 'View All Actions')}
                </Button>
            ]}
            width={650}
        >
            {errorAnalysis.length === 0 ? (
                <Empty description={t('common:messages.noData')} />
            ) : (
                <List
                    dataSource={errorAnalysis}
                    renderItem={(item) => (
                        <CauseCard size="small" variant="borderless">
                            <Flex vertical gap={12}>
                                <Flex justify="space-between" align="flex-start">
                                    <Paragraph strong style={{ marginBottom: 0, fontSize: 15, flex: 1 }}>
                                        {item.cause}
                                    </Paragraph>
                                    <Text key="count" strong style={{ whiteSpace: 'nowrap', marginLeft: 16 }}>
                                        {item.count} {t('common:labels.targets')}
                                    </Text>
                                </Flex>

                                <Flex vertical gap={4}>
                                    <Progress
                                        percent={item.percentage}
                                        size={[300, 12]}
                                        status="exception"
                                        showInfo={false}
                                        strokeColor="var(--ant-color-error)"
                                    />
                                    <MetaText type="secondary">
                                        {item.percentage}% {t('common:labels.ofTotal')}
                                    </MetaText>
                                </Flex>

                                <TargetListContainer>
                                    <Flex vertical>
                                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)', marginBottom: 4 }}>
                                            <AimOutlined /> {t('common:nav.targets')}
                                        </Text>
                                        {item.actions.map((action) => {
                                            const targetId = action._links?.target?.href?.split('/').pop() || action.id;
                                            return (
                                                <ActionRow key={action.id} justify="space-between" align="center">
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<AimOutlined style={{ fontSize: 'var(--ant-font-size-sm)' }} />}
                                                        style={{ padding: 0, height: 'auto', fontSize: 'var(--ant-font-size-sm)', display: 'flex', alignItems: 'center' }}
                                                        onClick={() => {
                                                            onClose();
                                                            navigate(`/targets/${targetId}/actions`);
                                                        }}
                                                    >
                                                        {targetId}
                                                    </Button>
                                                    <Flex align="center" gap={4}>
                                                        <ClockCircleOutlined style={{ fontSize: 'var(--ant-font-size-sm)', color: 'var(--ant-color-text-tertiary)' }} />
                                                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                                            {action.lastModifiedAt ? dayjs(action.lastModifiedAt).format('YYYY-MM-DD HH:mm') : '-'}
                                                        </Text>
                                                    </Flex>
                                                </ActionRow>
                                            );
                                        })}
                                    </Flex>
                                </TargetListContainer>
                            </Flex>
                        </CauseCard>
                    )}
                />
            )}
        </StandardModal>
    );
};
