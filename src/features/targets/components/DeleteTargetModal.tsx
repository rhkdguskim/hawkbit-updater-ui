import React from 'react';
import { Modal, Typography, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { MgmtTarget } from '@/api/generated/model';

const { Text } = Typography;

interface DeleteTargetModalProps {
    open: boolean;
    target: MgmtTarget | null;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteTargetModal: React.FC<DeleteTargetModalProps> = ({
    open,
    target,
    loading,
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal
            title={
                <>
                    <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    Delete Target
                </>
            }
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            okText="Delete"
            okButtonProps={{ danger: true, loading }}
            cancelButtonProps={{ disabled: loading }}
        >
            <Alert
                type="warning"
                message="This action cannot be undone"
                description={
                    <>
                        Are you sure you want to delete the target{' '}
                        <Text strong>{target?.controllerId}</Text>?
                        <br />
                        All associated data including actions and metadata will be removed.
                    </>
                }
                showIcon
                style={{ marginTop: 16 }}
            />
        </Modal>
    );
};

export default DeleteTargetModal;
