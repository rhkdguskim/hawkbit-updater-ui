import React from 'react';
import { List, Typography, Progress, Flex, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
                    <List.Item
                        actions={[
                            <Text key="count" strong>{item.count}</Text>
                        ]}
                    >
                        <List.Item.Meta
                            title={<Text strong>{item.cause}</Text>}
                            description={
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
                                    </Flex>
                                </Flex>
                            }
                        />
                    </List.Item>
                )}
            />
        </StandardModal>
    );
};
