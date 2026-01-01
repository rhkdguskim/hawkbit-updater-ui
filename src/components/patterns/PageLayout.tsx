import React from 'react';
import { theme } from 'antd';
import styled from 'styled-components';

const { useToken } = theme;

const StyledLayout = styled.div<{ $padding: string; $gap: string; $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: ${props => props.$fullWidth ? '100%' : 'var(--page-max-width, 1440px)'};
  margin: 0 auto;
  padding: ${props => props.$padding};
  gap: ${props => props.$gap};
  background-color: var(--ant-color-bg-layout);
  overflow: auto;
`;

export interface PageLayoutProps {
    children: React.ReactNode;
    fullWidth?: boolean;
}

/**
 * PageLayout Pattern
 * - Consistent maximum width (inherits from parent)
 * - Standardized padding and spacing between sections
 * - Handles scroll at the page level
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, fullWidth = false }) => {
    const { token } = useToken();

    return (
        <StyledLayout
            $padding={`${token.marginLG}px`}
            $gap={`${token.marginMD}px`}
            $fullWidth={fullWidth}
        >
            {children}
        </StyledLayout>
    );
};
