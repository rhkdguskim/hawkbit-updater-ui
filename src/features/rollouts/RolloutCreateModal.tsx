import React from 'react';
import { useTranslation } from 'react-i18next';
import RolloutWizard from './RolloutWizard';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';

const WizardModal = styled(StandardModal)`
    top: 40px;

    .ant-modal-body {
        height: calc(100vh - 160px);
        padding: 0;
        overflow: hidden;
    }
`;

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
        <WizardModal
            title={t('wizard.title')}
            open={open}
            onCancel={onClose}
            footer={null}
            width={1100}
            destroyOnClose
        >
            <RolloutWizard
                isModal={true}
                onClose={onClose}
                onSuccess={onSuccess}
            />
        </WizardModal>
    );
};

export default RolloutCreateModal;
