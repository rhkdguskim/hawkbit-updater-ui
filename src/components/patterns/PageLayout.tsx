import { theme, Card } from 'antd';
import styled, { css } from 'styled-components';

const { useToken } = theme;

const scrollStyles = css`
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--ant-color-fill-secondary);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const StyledLayout = styled.div<{ $padding: string; $gap: string; $fullWidth?: boolean; $fullHeight?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: ${props => props.$fullWidth ? '100%' : 'var(--page-max-width, 1440px)'};
  margin: 0 auto;
  padding: ${props => props.$padding};
  gap: ${props => props.$gap};
  background: transparent;
  isolation: isolate;
  
  ${props => props.$fullHeight ? css`
    height: 100%;
  ` : scrollStyles}
`;

export interface PageLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  fullHeight?: boolean;
  padding?: string;
  gap?: string;
}

/**
 * PageLayout Pattern
 * - Consistent maximum width (inherits from parent)
 * - Standardized padding and spacing between sections
 * - Handles scroll at the page level (unless fullHeight is true)
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  fullWidth = false,
  fullHeight = false,
  padding,
  gap,
}) => {
  const { token } = useToken();

  return (
    <StyledLayout
      $padding={padding ?? `${token.marginLG}px ${token.padding}px ${token.marginLG}px`}
      $gap={gap ?? `${token.marginXS}px`}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
    >
      {children}
    </StyledLayout>
  );
};

/**
 * Standard Section Card
 * Consistent card styling for all pages
 */
export const SectionCard = styled(Card)`
    border-radius: var(--ant-border-radius-lg, 12px);
    width: 100%;
    
    .ant-card-head {
        padding: var(--ant-padding, 16px) var(--ant-padding-lg, 24px);
        min-height: auto;
        border-bottom: 1px solid var(--ant-color-split);
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size-lg, 16px);
        font-weight: 600;
    }
    
    .ant-card-body {
        padding: var(--ant-padding-lg, 24px);
    }
`;

/**
 * Section card that grows to fill available height
 */
export const FullHeightSectionCard = styled(SectionCard)`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;

    .ant-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
`;
