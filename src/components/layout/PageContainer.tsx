import styled from 'styled-components';

/**
 * Page Container
 * Provides consistent layout and spacing for all pages
 */
export const PageContainer = styled.div<{
  $maxWidth?: string;
  $noPadding?: boolean;
  $centered?: boolean;
}>`
  width: 100%;
  max-width: ${({ $maxWidth = '100%' }) => $maxWidth};
  margin: ${({ $centered }) => ($centered ? '0 auto' : '0')};
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '0')};
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0; /* Important for flex scrolling */

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

/**
 * Page Header
 * Consistent header section for all pages
 */
export const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--ant-color-text);

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const PageDescription = styled.p`
  font-size: 14px;
  color: var(--ant-color-text-secondary);
  margin: 0;
  line-height: 1.5;
`;

/**
 * Page Content
 * Main content area with consistent spacing
 */
export const PageContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

/**
 * Page Section
 * Grouped content section
 */
export const PageSection = styled.section<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 16 }) => $gap}px;
`;

/**
 * Page Grid
 * Responsive grid layout for cards/widgets
 */
export const PageGrid = styled.div<{
  $columns?: number;
  $minWidth?: string;
  $gap?: number;
}>`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(${({ $minWidth = '300px' }) => $minWidth}, 1fr)
  );
  gap: ${({ $gap = 20 }) => $gap}px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

/**
 * Page Actions
 * Action buttons section
 */
export const PageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

/**
 * Responsive Row
 * Two-column layout that stacks on mobile
 */
export const ResponsiveRow = styled.div<{
  $leftWidth?: string;
  $gap?: number;
  $reverse?: boolean;
}>`
  display: grid;
  grid-template-columns: ${({ $leftWidth = '1fr' }) => `${$leftWidth} 1fr`};
  gap: ${({ $gap = 20 }) => $gap}px;
  align-items: start;

  ${({ $reverse }) =>
    $reverse &&
    `
    direction: rtl;
    > * {
      direction: ltr;
    }
  `}

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    direction: ltr;
  }
`;

/**
 * Card Grid
 * Specialized grid for card layouts
 */
export const CardGrid = styled.div<{ $minCardWidth?: string }>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${({ $minCardWidth = '280px' }) => $minCardWidth}, 1fr)
  );
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

/**
 * Flex Container
 * Utility flex container with common patterns
 */
export const FlexContainer = styled.div<{
  $direction?: 'row' | 'column';
  $align?: string;
  $justify?: string;
  $gap?: number;
  $wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
  align-items: ${({ $align = 'stretch' }) => $align};
  justify-content: ${({ $justify = 'flex-start' }) => $justify};
  gap: ${({ $gap = 16 }) => $gap}px;
  ${({ $wrap }) => $wrap && 'flex-wrap: wrap;'}
`;

/**
 * Scrollable Container
 * Container with custom scrollbar
 */
export const ScrollableContainer = styled.div<{ $maxHeight?: string }>`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: ${({ $maxHeight = '100%' }) => $maxHeight};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ant-color-border-secondary);
    border-radius: 3px;

    &:hover {
      background: var(--ant-color-border);
    }
  }
`;
