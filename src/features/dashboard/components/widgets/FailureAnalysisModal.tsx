import React from 'react';
import { Modal, List, Typography, Progress, Flex, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface FailureAnalysisModalProps {
    visible: boolean;
    onClose: () => void;
    errorAnalysis: {
        cause: string;
        count: number;
        percentage: number;
        actions: any[];
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
        <Modal
            title={
                <Flex align="center" gap={8}>
                    <ExclamationCircleOutlined style={{ color: 'var(--ant-color-error)' }} />
                    <span>{t('charts.failureAnalysis')}</span>
                </Flex>
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
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.percentage}% {t('common:labels.ofTotal', 'of total errors')}
                                        </Text>
                                    </Flex>
                                </Flex>
                            }
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};
