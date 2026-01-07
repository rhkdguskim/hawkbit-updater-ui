import React from 'react';
import { List, Typography, Progress, Flex, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { StandardModal } from '@/components/patterns';

const { Text } = Typography;

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
                    {t('common:actions.close', 'Close')}
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
                    {t('common:actions.viewAll', 'View All Actions')}
                </Button>
            ]}
            width={600}
        >
            <List
                itemLayout="horizontal"
                dataSource={errorAnalysis}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<Text strong>{item.cause}</Text>}
                            description={
                                <Flex vertical gap={8}>
                                    <Flex vertical gap={4}>
                                        <Progress
                                            percent={item.percentage}
                                            size="small"
                                            status="exception"
                                            showInfo={false}
                                        />
                                        <Flex justify="space-between">
                                            <MetaText type="secondary">
                                                {item.percentage}% {t('common:labels.ofTotal', 'of total errors')}
                                            </MetaText>
                                            <Text key="count" strong>{item.count} {t('common:labels.targets', 'targets')}</Text>
                                        </Flex>
                                    </Flex>

                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'var(--ant-color-fill-quaternary)',
                                        borderRadius: 8,
                                        maxHeight: 120,
                                        overflowY: 'auto'
                                    }}>
                                        <Flex vertical gap={4}>
                                            {item.actions.slice(0, 5).map((action) => {
                                                const targetId = action._links?.target?.href?.split('/').pop() || action.id;
                                                return (
                                                    <Flex key={action.id} justify="space-between" align="center">
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            style={{ padding: 0, height: 'auto', fontSize: 12 }}
                                                            onClick={() => {
                                                                onClose();
                                                                navigate(`/targets/${targetId}/actions`);
                                                            }}
                                                        >
                                                            {targetId}
                                                        </Button>
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            {action.lastModifiedAt ? dayjs(action.lastModifiedAt).fromNow() : '-'}
                                                        </Text>
                                                    </Flex>
                                                );
                                            })}
                                            {item.actions.length > 5 && (
                                                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                                                    {t('common:labels.andMoreCount', { count: item.actions.length - 5 })}
                                                </Text>
                                            )}
                                        </Flex>
                                    </div>
                                </Flex>
                            }
                        />
                    </List.Item>
                )}
            />
        </StandardModal>
    );
};
