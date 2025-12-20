import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { MgmtMetadata } from '@/api/generated/model';

const { Text } = Typography;

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
    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Delete Metadata</span>
                </Space>
            }
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            okText="Delete"
            okButtonProps={{ danger: true }}
            confirmLoading={loading}
        >
            <p>
                Are you sure you want to delete the metadata entry{' '}
                <Text strong>"{metadata?.key}"</Text>?
            </p>
            <p>This action cannot be undone.</p>
        </Modal>
    );
};

export default DeleteMetadataModal;
