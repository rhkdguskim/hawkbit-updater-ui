import React from 'react';
import { Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MgmtMetadata } from '@/api/generated/model';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';

const TitleIcon = styled(ExclamationCircleOutlined)`
    color: var(--ant-color-error);
`;

interface DeleteMetadataModalProps {
    open: boolean;
    metadata: MgmtMetadata | null;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteMetadataModal: React.FC<DeleteMetadataModalProps> = ({
    open,
    metadata,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    return (
        <StandardModal
            title={
                <Space size="small">
                    <TitleIcon />
                    <span>{t('metadata.deleteTitle')}</span>
                </Space>
            }
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            okText={t('common:actions.delete')}
            cancelText={t('common:actions.cancel')}
            okButtonProps={{ danger: true }}
            confirmLoading={loading}
        >
            <p>
                {t('metadata.deleteConfirm', { key: metadata?.key })}
            </p>
            <p>{t('metadata.deleteDesc')}</p>
        </StandardModal>
    );
};

export default DeleteMetadataModal;
