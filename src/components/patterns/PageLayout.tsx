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
  animation: fadeIn 0.4s var(--transition-gentle) forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
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
    border-radius: 12px;
    width: 100%;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    background: var(--bg-container);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--gradient-primary);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover::before {
        opacity: 1;
    }
    
    .ant-card-head {
        padding: 16px 24px;
        min-height: 48px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size-lg);
        font-weight: 600;
        letter-spacing: -0.015em;
    }
    
    .ant-card-body {
        padding: 24px;
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
