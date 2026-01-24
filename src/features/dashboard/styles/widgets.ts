import styled, { css } from 'styled-components';
import { fadeIn, hoverLift, smoothTransition, respectMotionPreference } from './animations';

/**
 * Enhanced Widget Styles for Dashboard
 * Provides consistent, beautiful card designs with improved accessibility
 */

export const WidgetCard = styled.div<{ $variant?: 'default' | 'highlight' | 'glass' }>`
  background: var(--ant-color-bg-container);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--ant-color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  ${smoothTransition()}

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeIn} 0.4s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: opacity 0.1s;
  }

  ${({ $variant }) => {
    switch ($variant) {
      case 'highlight':
        return css`
          background: linear-gradient(
            135deg,
            var(--ant-color-primary-bg) 0%,
            var(--ant-color-bg-container) 100%
          );
          border-color: var(--ant-color-primary-border);
        `;
      case 'glass':
        return css`
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-color: rgba(255, 255, 255, 0.3);

          [data-theme='dark'] &,
          .dark-mode & {
            background: rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.1);
          }
        `;
      default:
        return '';
    }
  }}

  &:hover {
    border-color: var(--ant-color-primary-border-hover);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  [data-theme='dark'] &,
  .dark-mode & {
    background: var(--ant-color-bg-elevated);
    border-color: var(--ant-color-border-secondary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &:hover {
      border-color: var(--ant-color-primary-border);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
  }
`;

export const WidgetHeader = styled.div<{ $withActions?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;

  ${({ $withActions }) =>
    $withActions &&
    css`
      padding-bottom: 12px;
      border-bottom: 1px solid var(--ant-color-border);
    `}
`;

export const WidgetTitle = styled.h3<{ $size?: 'small' | 'medium' | 'large' }>`
  margin: 0;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);
  color: var(--ant-color-text);
  line-height: var(--line-height-tight);
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return css`
          font-size: var(--font-size-sm);
        `;
      case 'large':
        return css`
          font-size: var(--font-size-lg);
        `;
      default:
        return css`
          font-size: var(--font-size-base);
        `;
    }
  }}
`;

export const WidgetSubtitle = styled.p`
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--ant-color-text-secondary);
  line-height: var(--line-height-snug);
`;

export const WidgetActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const WidgetContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const WidgetMetric = styled.div<{ $emphasis?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 8px;

  ${({ $emphasis }) =>
    $emphasis &&
    css`
      padding: 12px;
      background: var(--ant-color-fill-quaternary);
      border-radius: 8px;
    `}
`;

export const MetricValue = styled.span<{ $size?: 'small' | 'medium' | 'large'; $color?: string }>`
  font-family: var(--font-mono);
  font-weight: var(--font-weight-bold);
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  line-height: var(--line-height-tight);
  color: ${({ $color }) => $color || 'var(--ant-color-text)'};

  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return css`
          font-size: var(--font-size-lg);
        `;
      case 'large':
        return css`
          font-size: var(--font-size-4xl);
        `;
      default:
        return css`
          font-size: var(--font-size-2xl);
        `;
    }
  }}
`;

export const MetricLabel = styled.span`
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--ant-color-text-secondary);
  line-height: var(--line-height-normal);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
`;

export const WidgetBadge = styled.span<{ $type?: 'success' | 'warning' | 'error' | 'info' | 'default' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  white-space: nowrap;

  ${({ $type = 'default' }) => {
    switch ($type) {
      case 'success':
        return css`
          background: var(--ant-color-success-bg);
          color: var(--ant-color-success-text);
          border: 1px solid var(--ant-color-success-border);
        `;
      case 'warning':
        return css`
          background: var(--ant-color-warning-bg);
          color: var(--ant-color-warning-text);
          border: 1px solid var(--ant-color-warning-border);
        `;
      case 'error':
        return css`
          background: var(--ant-color-error-bg);
          color: var(--ant-color-error-text);
          border: 1px solid var(--ant-color-error-border);
        `;
      case 'info':
        return css`
          background: var(--ant-color-info-bg);
          color: var(--ant-color-info-text);
          border: 1px solid var(--ant-color-info-border);
        `;
      default:
        return css`
          background: var(--ant-color-fill-quaternary);
          color: var(--ant-color-text-secondary);
          border: 1px solid var(--ant-color-border);
        `;
    }
  }}
`;

export const WidgetGrid = styled.div<{ $columns?: number; $gap?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, 1fr);
  gap: ${({ $gap = 16 }) => $gap}px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const WidgetDivider = styled.div`
  height: 1px;
  background: var(--ant-color-border);
  margin: 16px 0;
`;

export const WidgetEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--ant-color-text-tertiary);
  gap: 12px;
  min-height: 200px;

  svg {
    font-size: 48px;
    opacity: 0.5;
  }
`;

export const WidgetLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--ant-color-text-secondary);
`;

export const WidgetError = styled.div`
  padding: 20px;
  background: var(--ant-color-error-bg);
  border: 1px solid var(--ant-color-error-border);
  border-radius: 8px;
  color: var(--ant-color-error-text);
  text-align: center;
`;

// Interactive widget that can be clicked
export const InteractiveWidget = styled(WidgetCard)`
  cursor: pointer;
  ${hoverLift}

  &:focus-visible {
    outline: 2px solid var(--ant-color-primary);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Compact widget for smaller spaces
export const CompactWidget = styled(WidgetCard)`
  padding: 16px;

  ${WidgetTitle} {
    font-size: var(--font-size-sm);
  }

  ${MetricValue} {
    font-size: var(--font-size-xl);
  }
`;

// Status indicator dot
export const StatusDot = styled.span<{ $status: 'success' | 'warning' | 'error' | 'default' }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;

  ${({ $status }) => {
    switch ($status) {
      case 'success':
        return css`
          background: var(--ant-color-success);
          box-shadow: 0 0 8px var(--ant-color-success);
        `;
      case 'warning':
        return css`
          background: var(--ant-color-warning);
          box-shadow: 0 0 8px var(--ant-color-warning);
        `;
      case 'error':
        return css`
          background: var(--ant-color-error);
          box-shadow: 0 0 8px var(--ant-color-error);
        `;
      default:
        return css`
          background: var(--ant-color-text-quaternary);
        `;
    }
  }}
`;

// Progress bar
export const WidgetProgressBar = styled.div<{ $percentage: number; $color?: string }>`
  width: 100%;
  height: 8px;
  background: var(--ant-color-fill-quaternary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $percentage }) => $percentage}%;
    background: ${({ $color }) => $color || 'var(--ant-color-primary)'};
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;
