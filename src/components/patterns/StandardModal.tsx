import React from 'react';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
    .ant-modal-content {
        border-radius: var(--ant-border-radius-lg, 20px);
        overflow: hidden;
    }

    .ant-modal-header {
        padding: var(--ant-padding-lg, 24px);
        margin: 0;
        border-bottom: 1px solid var(--ant-color-border-secondary);
    }

    .ant-modal-body {
        padding: var(--ant-padding-lg, 24px);
    }

    .ant-modal-footer {
        padding: var(--ant-padding-lg, 24px);
        border-top: 1px solid var(--ant-color-border-secondary);
    }
`;

export const StandardModal: React.FC<ModalProps> = (props) => {
    return <StyledModal {...props} />;
};

export default StandardModal;
