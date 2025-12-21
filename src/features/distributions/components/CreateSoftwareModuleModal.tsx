import React from 'react';
import CreateModuleWizard from './CreateModuleWizard';

interface CreateSoftwareModuleModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

/**
 * Wrapper component that renders the CreateModuleWizard.
 * Kept for backward compatibility with existing code.
 */
const CreateSoftwareModuleModal: React.FC<CreateSoftwareModuleModalProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    return (
        <CreateModuleWizard
            visible={visible}
            onCancel={onCancel}
            onSuccess={onSuccess}
        />
    );
};

export default CreateSoftwareModuleModal;
