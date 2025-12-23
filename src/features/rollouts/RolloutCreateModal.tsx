import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import RolloutWizard from './RolloutWizard';

interface RolloutCreateModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (rolloutId: number) => void;
}

const RolloutCreateModal: React.FC<RolloutCreateModalProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation(['rollouts']);

    return (
        <Modal
            title={t('wizard.title')}
            open={open}
            onCancel={onClose}
            footer={null}
            width="90%"
            style={{ maxWidth: 1200, top: 20 }}
            styles={{
                body: {
                    maxHeight: 'calc(100vh - 140px)',
                    overflow: 'auto',
                    padding: 0,
                }
            }}
            destroyOnClose
        >
            <RolloutWizard
                isModal={true}
                onClose={onClose}
                onSuccess={onSuccess}
            />
        </Modal>
    );
};

export default RolloutCreateModal;
