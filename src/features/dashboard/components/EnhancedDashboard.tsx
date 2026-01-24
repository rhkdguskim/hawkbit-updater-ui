import React from 'react';
import styled from 'styled-components';
import { fadeIn, staggerChildren, respectMotionPreference } from '../styles/animations';
import { WidgetCard } from '../styles/widgets';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const HeaderSection = styled.section`
  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.4s ease-out;
  }
`;

const TopRowSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.5s ease-out 0.1s both;

    > * {
      animation: ${fadeIn} 0.4s ease-out both;
      ${staggerChildren(6, 100, 80)}
    }
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const OperationsRow = styled.section`
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(400px, 1.5fr);
  gap: 20px;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const OperationsLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OperationsRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TrendsRow = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.5s ease-out 0.3s both;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SignalsRow = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.5s ease-out 0.4s both;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface DashboardSectionProps {
  header?: React.ReactNode;
  topRow?: React.ReactNode[];
  opsLeft?: React.ReactNode[];
  opsRight?: React.ReactNode[];
  trends?: React.ReactNode[];
  signals?: React.ReactNode[];
}

/**
 * Enhanced Dashboard Layout
 *
 * Provides a beautiful, responsive layout with:
 * - Smooth animations
 * - Staggered loading effects
 * - Responsive grid system
 * - Accessibility support
 * - Dark mode support
 */
export const EnhancedDashboard: React.FC<DashboardSectionProps> = ({
  header,
  topRow = [],
  opsLeft = [],
  opsRight = [],
  trends = [],
  signals = [],
}) => {
  return (
    <DashboardContainer>
      {/* Header */}
      {header && <HeaderSection>{header}</HeaderSection>}

      {/* KPI Cards Top Row */}
      {topRow.length > 0 && (
        <TopRowSection aria-label="Key Performance Indicators">
          {topRow.map((node, index) => (
            <React.Fragment key={`top-${index}`}>{node}</React.Fragment>
          ))}
        </TopRowSection>
      )}

      {/* Operations Section */}
      {(opsLeft.length > 0 || opsRight.length > 0) && (
        <OperationsRow aria-label="Active Operations">
          {opsLeft.length > 0 && (
            <OperationsLeft>
              {opsLeft.map((node, index) => (
                <React.Fragment key={`ops-left-${index}`}>{node}</React.Fragment>
              ))}
            </OperationsLeft>
          )}
          {opsRight.length > 0 && (
            <OperationsRight>
              {opsRight.map((node, index) => (
                <React.Fragment key={`ops-right-${index}`}>{node}</React.Fragment>
              ))}
            </OperationsRight>
          )}
        </OperationsRow>
      )}

      {/* Trends & Analytics Section */}
      {trends.length > 0 && (
        <TrendsRow aria-label="Trends and Analytics">
          {trends.map((node, index) => (
            <React.Fragment key={`trend-${index}`}>{node}</React.Fragment>
          ))}
        </TrendsRow>
      )}

      {/* Signals & Alerts Section */}
      {signals.length > 0 && (
        <SignalsRow aria-label="Signals and Alerts">
          {signals.map((node, index) => (
            <React.Fragment key={`signal-${index}`}>{node}</React.Fragment>
          ))}
        </SignalsRow>
      )}
    </DashboardContainer>
  );
};

/**
 * Responsive Dashboard Widget Wrapper
 * Auto-adjusts based on content and screen size
 */
export const ResponsiveWidget = styled(WidgetCard)<{
  $minHeight?: number;
  $maxHeight?: number;
}>`
  min-height: ${({ $minHeight = 200 }) => $minHeight}px;
  max-height: ${({ $maxHeight }) => ($maxHeight ? `${$maxHeight}px` : 'none')};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    min-height: ${({ $minHeight = 200 }) => Math.max($minHeight - 50, 150)}px;
  }
`;

/**
 * Dashboard section with title
 */
export const DashboardSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionTitle = styled.h2`
  font-family: var(--font-sans);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--ant-color-text);
  margin: 0;
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--ant-color-border);
  }
`;
