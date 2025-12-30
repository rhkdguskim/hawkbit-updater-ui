import React from 'react';
import { Typography, theme, Space } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;
const { useToken } = theme;

const SectionContainer = styled.div<{ $marginBottom: string }>`
  margin-bottom: ${props => props.$marginBottom};
`;

const SectionHeader = styled.div<{ $marginBottom: string }>`
  margin-bottom: ${props => props.$marginBottom};
  border-bottom: 1px solid var(--ant-color-border-secondary);
  padding-bottom: var(--ant-padding-xs, 8px);
`;

const SectionTitle = styled(Title)`
    margin: 0;
`;

const SectionBody = styled(Space)`
    && {
        width: 100%;
    }
`;

export interface FormSectionProps {
    title?: string;
    children: React.ReactNode;
}

/**
 * FormSection Pattern
 * - Consistent spacing between form sections
 * - Standardized section headers
 */
export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
    const { token } = useToken();

    return (
        <SectionContainer $marginBottom={`${token.marginLG}px`}>
            {title && (
                <SectionHeader $marginBottom={`${token.marginMD}px`}>
                    <SectionTitle level={4}>
                        {title}
                    </SectionTitle>
                </SectionHeader>
            )}
            <SectionBody direction="vertical" size="middle">
                {children}
            </SectionBody>
        </SectionContainer>
    );
};
