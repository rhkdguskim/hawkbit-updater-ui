import React from 'react';
import CreateDistributionSetWizard from './CreateDistributionSetWizard';

interface CreateDistributionSetModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

/**
 * Wrapper component that renders the CreateDistributionSetWizard.
 * Kept for backward compatibility with existing code.
 */
const CreateDistributionSetModal: React.FC<CreateDistributionSetModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    return (
        <CreateDistributionSetWizard
            visible={visible}
            onCancel={onCancel}
            onSuccess={onSuccess}
        />
    );
};

export default CreateDistributionSetModal;
