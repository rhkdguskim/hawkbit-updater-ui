import styled from 'styled-components';
import { Button, Divider, Typography } from 'antd';
import { fadeInUp } from './CommonStyles';

const { Text } = Typography;

export const SelectionBarContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: rgba(var(--color-primary-rgb), 0.08);
    border-radius: 8px;
    border: 1px solid rgba(var(--color-primary-rgb), 0.2);
    border-left: 4px solid var(--ant-color-primary);
    animation: ${fadeInUp} 0.4s var(--transition-gentle);
    margin-top: 8px;
`;

export const SelectionBarText = styled.span`
    font-weight: 600;
    color: var(--ant-color-primary);
    font-size: 13px;
    letter-spacing: -0.01em;
`;

export const SelectionBarDivider = styled(Divider)`
    && {
        height: 14px;
        border-color: rgba(var(--color-primary-rgb), 0.2);
        margin: 0 12px;
    }
`;

export const SelectionActionButton = styled(Button)`
    &.ant-btn {
        background: rgba(var(--color-primary-rgb), 0.1);
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        color: var(--ant-color-primary);
        font-weight: 600;
        font-size: 13px;
        border-radius: 6px;
        height: 28px;
        padding: 0 10px;
        transition: all 0.2s ease;

        &:hover {
            background: var(--ant-color-primary);
            border-color: var(--ant-color-primary);
            color: white;
            transform: translateY(-1px);
        }

        &.ant-btn-dangerous {
            background: rgba(var(--color-error-rgb), 0.1);
            border-color: rgba(var(--color-error-rgb), 0.2);
            color: var(--ant-color-error);

            &:hover {
                background: var(--ant-color-error);
                color: white;
                border-color: var(--ant-color-error);
            }
        }
    }
`;

export const SelectionCloseButton = styled(Button)`
    &.ant-btn {
        color: var(--text-tertiary);
        &:hover {
            color: var(--ant-color-primary);
        }
    }
`;
