import React from 'react';
import { Modal, Button, Space, Typography, Alert } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const { Text } = Typography;

export interface ConfirmModalProps {
    /** Whether the modal is visible */
    open: boolean;
    /** Modal title */
    title: React.ReactNode;
    /** Modal content/description */
    content: React.ReactNode;
    /** Type of confirmation: affects icon and styling */
    type?: 'confirm' | 'danger' | 'warning' | 'info' | 'success';
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Whether the confirm button is in loading state */
    loading?: boolean;
    /** Confirm callback */
    onConfirm: () => void;
    /** Cancel callback */
    onCancel: () => void;
    /** Optional alert message to show at the top */
    alertMessage?: string;
    /** Alert type */
    alertType?: 'success' | 'info' | 'warning' | 'error';
    /** Additional content to render in the modal body */
    extra?: React.ReactNode;
    /** Width of the modal */
    width?: number;
}

const IconWrapper = styled.div<{ $color?: string }>`
    display: flex;
    justify-content: center;
    margin-bottom: var(--ant-margin-md);
    
    .anticon {
        font-size: 48px;
        color: ${props => props.$color || 'var(--ant-color-primary)'};
    }
`;

const ContentWrapper = styled.div`
    text-align: center;
    padding: var(--ant-padding-md) 0;
`;

const TitleText = styled(Text)`
    && {
        display: block;
        font-size: var(--ant-font-size-lg);
        font-weight: 600;
        margin-bottom: var(--ant-margin-sm);
    }
`;

const DescriptionText = styled(Text)`
    && {
        display: block;
        color: var(--ant-color-text-secondary);
    }
`;

const ExtraWrapper = styled.div`
    margin-top: var(--ant-margin-md);
`;

/**
 * Standardized confirmation modal component.
 * Provides consistent styling and behavior for confirmation dialogs.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    content,
    type = 'confirm',
    confirmText,
    cancelText,
    loading = false,
    onConfirm,
    onCancel,
    alertMessage,
    alertType,
    extra,
    width = 420,
}) => {
    const { t } = useTranslation(['common']);

    const typeConfig = {
        confirm: {
            icon: <ExclamationCircleOutlined />,
            color: 'var(--ant-color-primary)',
            danger: false,
        },
        danger: {
            icon: <ExclamationCircleOutlined />,
            color: 'var(--ant-color-error)',
            danger: true,
        },
        warning: {
            icon: <WarningOutlined />,
            color: 'var(--ant-color-warning)',
            danger: false,
        },
        info: {
            icon: <InfoCircleOutlined />,
            color: 'var(--ant-color-info)',
            danger: false,
        },
        success: {
            icon: <CheckCircleOutlined />,
            color: 'var(--ant-color-success)',
            danger: false,
        },
    };

    const config = typeConfig[type];
    const defaultConfirmText = type === 'danger' ? t('actions.delete') : t('actions.confirm');
    const defaultCancelText = t('actions.cancel');

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            width={width}
            centered
            closable={!loading}
            maskClosable={!loading}
            footer={
                <Space style={{ width: '100%', justifyContent: 'center' }}>
                    <Button onClick={onCancel} disabled={loading}>
                        {cancelText || defaultCancelText}
                    </Button>
                    <Button
                        type="primary"
                        danger={config.danger}
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmText || defaultConfirmText}
                    </Button>
                </Space>
            }
        >
            {alertMessage && (
                <Alert
                    message={alertMessage}
                    type={alertType || (type === 'danger' ? 'error' : 'info')}
                    showIcon
                    style={{ marginBottom: 'var(--ant-margin-md)' }}
                />
            )}

            <ContentWrapper>
                <IconWrapper $color={config.color}>
                    {config.icon}
                </IconWrapper>
                <TitleText>{title}</TitleText>
                <DescriptionText>{content}</DescriptionText>
                {extra && <ExtraWrapper>{extra}</ExtraWrapper>}
            </ContentWrapper>
        </Modal>
    );
};

export default ConfirmModal;
