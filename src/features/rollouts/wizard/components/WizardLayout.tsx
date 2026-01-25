import { Card, Col, Flex, Input, Row, Typography } from 'antd';
import styled, { css } from 'styled-components';

const { Text } = Typography;
const { TextArea } = Input;

export const ReleaseNotesArea = styled(TextArea)`
    && {
        min-height: 220px;
        padding: 12px;
        border-radius: var(--ant-border-radius-lg, 12px);
        background: var(--ant-color-fill-alter);
        line-height: 1.5;
        font-family: var(--font-mono);
    }
`;

export const ReleaseNotesHint = styled(Text)`
    display: block;
    font-size: var(--ant-font-size-sm);
`;

export const ReleaseNotesPreview = styled.div`
    white-space: pre-wrap;
    background: var(--ant-color-fill-alter);
    border: 1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06));
    border-radius: var(--ant-border-radius-lg, 12px);
    padding: 12px;
    min-height: 80px;
`;

export const WizardLayout = styled(Flex)`
    flex: 1;
    min-height: 0;
`;

export const WizardContent = styled(Flex)`
    flex: 1;
    min-height: 0;
`;

export const WizardScrollable = styled.div`
    flex: 1;
    min-height: 0;
    overflow: auto;
`;

export const WizardShell = styled.div`
    padding: var(--ant-padding-lg, 24px);
    height: 100%;
    display: flex;
    flex-direction: column;
`;

export const WizardRow = styled(Row)`
    flex: 1;
    min-height: 0;
`;

export const WizardRightCol = styled(Col)`
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

export const WizardCard = styled(Card)<{ $isModal?: boolean }>`
    ${props => props.$isModal && css`
        box-shadow: none;
        border: none;
        background: transparent;
    `}
`;

export const StepsCard = styled(Card)`
    border-radius: var(--ant-border-radius, 12px);

    .ant-card-body {
        padding: var(--ant-padding, 16px) var(--ant-padding-lg, 24px);
    }
`;

export const ActionsBar = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--ant-margin-xs, 8px);
    margin-top: var(--ant-margin-xs, 8px);
`;
