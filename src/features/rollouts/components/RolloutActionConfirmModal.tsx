import React from 'react';
import { Modal, Typography, Space, Divider, Alert } from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    CaretRightOutlined,
    StopOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const { Text, Title } = Typography;

export type RolloutActionType = 'start' | 'pause' | 'resume' | 'cancel';

interface RolloutActionConfirmModalProps {
    open: boolean;
    actionType: RolloutActionType;
    rolloutName: string;
    targetCount: number;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ModalContent = styled.div`
    padding: 8px 0;
`;

const RolloutNameText = styled(Text)`
    && {
        font-size: 16px;
        font-weight: 600;
        color: var(--ant-color-primary);
    }
`;

const MessageText = styled(Text)`
    && {
        font-size: 14px;
        color: var(--ant-color-text-secondary);
    }
`;

const TargetCountText = styled(Text)`
    && {
        font-size: 14px;
        color: var(--ant-color-text);
        margin-top: 8px;
        display: block;
    }
`;

const IconWrapper = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${props => props.$color}15;
    color: ${props => props.$color};
    font-size: 24px;
    margin-bottom: 16px;
`;

const getActionConfig = (actionType: RolloutActionType) => {
    switch (actionType) {
        case 'start':
            return {
                icon: <PlayCircleOutlined />,
                color: 'var(--ant-color-success)',
                okType: 'primary' as const,
            };
        case 'pause':
            return {
                icon: <PauseCircleOutlined />,
                color: 'var(--ant-color-warning)',
                okType: 'primary' as const,
            };
        case 'resume':
            return {
                icon: <CaretRightOutlined />,
                color: 'var(--ant-color-info)',
                okType: 'primary' as const,
            };
        case 'cancel':
            return {
                icon: <StopOutlined />,
                color: 'var(--ant-color-error)',
                okType: 'primary' as const,
            };
        default:
            return {
                icon: <ExclamationCircleOutlined />,
                color: 'var(--ant-color-warning)',
                okType: 'primary' as const,
            };
    }
};

const RolloutActionConfirmModal: React.FC<RolloutActionConfirmModalProps> = ({
    open,
    actionType,
    rolloutName,
    targetCount,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    const { t } = useTranslation(['rollouts', 'common']);
    const config = getActionConfig(actionType);

    const getTitle = () => {
        return t(`actionConfirm.${actionType}.title`);
    };

    const getMessage = () => {
        return t(`actionConfirm.${actionType}.message`);
    };

    const getTargetInfo = () => {
        return t(`actionConfirm.${actionType}.targetInfo`, { count: targetCount });
    };

    const getOkText = () => {
        return t(`actionConfirm.${actionType}.okText`);
    };

    const showWarning = actionType === 'cancel';

    return (
        <Modal
            open={open}
            title={
                <Space>
                    {config.icon}
                    {getTitle()}
                </Space>
            }
            onOk={onConfirm}
            onCancel={onCancel}
            okText={getOkText()}
            cancelText={t('common:actions.cancel')}
            okButtonProps={{
                loading,
                danger: actionType === 'cancel',
            }}
            centered
            width={440}
        >
            <ModalContent>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <IconWrapper $color={config.color}>
                            {config.icon}
                        </IconWrapper>
                        <Title level={5} style={{ margin: 0 }}>
                            <RolloutNameText>"{rolloutName}"</RolloutNameText>
                        </Title>
                    </div>

                    <Divider style={{ margin: '8px 0' }} />

                    <div style={{ textAlign: 'center' }}>
                        <MessageText>{getMessage()}</MessageText>
                        <TargetCountText strong>
                            {getTargetInfo()}
                        </TargetCountText>
                    </div>

                    {showWarning && (
                        <Alert
                            type="warning"
                            icon={<ExclamationCircleOutlined />}
                            message={t('actionConfirm.cancel.warning')}
                            showIcon
                        />
                    )}
                </Space>
            </ModalContent>
        </Modal>
    );
};

export default RolloutActionConfirmModal;
