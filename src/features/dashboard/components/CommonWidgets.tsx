import React from 'react';
import { Spin, Empty, Button, Tooltip } from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  WidgetCard,
  WidgetHeader,
  WidgetTitle,
  WidgetSubtitle,
  WidgetActions,
  WidgetContent,
  WidgetMetric,
  MetricValue,
  MetricLabel,
  WidgetBadge,
  WidgetEmpty,
  WidgetLoading,
  WidgetError,
  WidgetProgressBar,
  StatusDot,
} from '../styles/widgets';

interface BaseWidgetProps {
  title: string;
  subtitle?: string;
  tooltip?: string;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'glass';
}

/**
 * Base Widget Component
 * Provides consistent header, loading, and error states
 */
export const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  subtitle,
  tooltip,
  isLoading,
  error,
  onRefresh,
  actions,
  children,
  variant = 'default',
}) => {
  return (
    <WidgetCard $variant={variant}>
      <WidgetHeader $withActions={!!actions}>
        <div style={{ flex: 1 }}>
          <WidgetTitle>
            {title}
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined style={{ fontSize: '14px', opacity: 0.6 }} />
              </Tooltip>
            )}
          </WidgetTitle>
          {subtitle && <WidgetSubtitle>{subtitle}</WidgetSubtitle>}
        </div>
        {(actions || onRefresh) && (
          <WidgetActions>
            {actions}
            {onRefresh && (
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={isLoading}
              />
            )}
          </WidgetActions>
        )}
      </WidgetHeader>

      {error ? (
        <WidgetError>{error}</WidgetError>
      ) : isLoading ? (
        <WidgetLoading>
          <Spin />
        </WidgetLoading>
      ) : (
        <WidgetContent>{children}</WidgetContent>
      )}
    </WidgetCard>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  label?: string;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  badge?: {
    text: string;
    type?: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
  status?: 'success' | 'warning' | 'error' | 'default';
  isLoading?: boolean;
  onClick?: () => void;
  tooltip?: string;
}

/**
 * Metric Card Component
 * Displays a single metric with optional trend and status
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  label,
  trend,
  badge,
  status,
  isLoading,
  onClick,
  tooltip,
}) => {
  const CardComponent = onClick ? 'button' : 'div';
  const cardProps = onClick
    ? {
        onClick,
        style: {
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          padding: 0,
          width: '100%',
          textAlign: 'left' as const,
        },
      }
    : {};

  return (
    <CardComponent {...cardProps}>
      <WidgetCard>
        {isLoading ? (
          <WidgetLoading style={{ minHeight: '120px' }}>
            <Spin size="small" />
          </WidgetLoading>
        ) : (
          <>
            <WidgetHeader>
              <WidgetTitle $size="small">
                {status && <StatusDot $status={status} />}
                {title}
                {tooltip && (
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined style={{ fontSize: '12px', opacity: 0.6 }} />
                  </Tooltip>
                )}
              </WidgetTitle>
              {badge && <WidgetBadge $type={badge.type}>{badge.text}</WidgetBadge>}
            </WidgetHeader>

            <WidgetMetric $emphasis>
              <MetricValue $size="large">{value}</MetricValue>
              {label && <MetricLabel>{label}</MetricLabel>}
            </WidgetMetric>

            {trend && (
              <div
                style={{
                  fontSize: '13px',
                  color: trend.isPositive
                    ? 'var(--ant-color-success)'
                    : 'var(--ant-color-error)',
                  marginTop: '8px',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
          </>
        )}
      </WidgetCard>
    </CardComponent>
  );
};

interface StatusCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    status?: 'success' | 'warning' | 'error' | 'default';
    percentage?: number;
  }>;
  isLoading?: boolean;
  emptyText?: string;
}

/**
 * Status Card Component
 * Displays multiple status items with progress bars
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  items,
  isLoading,
  emptyText = 'No data available',
}) => {
  return (
    <BaseWidget title={title} isLoading={isLoading}>
      {items.length === 0 ? (
        <WidgetEmpty>
          <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </WidgetEmpty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item, index) => (
            <div key={index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.status && <StatusDot $status={item.status} />}
                  <span>{item.label}</span>
                </span>
                <MetricValue $size="small">{item.value}</MetricValue>
              </div>
              {item.percentage !== undefined && (
                <WidgetProgressBar
                  $percentage={item.percentage}
                  $color={
                    item.status === 'success'
                      ? 'var(--ant-color-success)'
                      : item.status === 'warning'
                        ? 'var(--ant-color-warning)'
                        : item.status === 'error'
                          ? 'var(--ant-color-error)'
                          : 'var(--ant-color-primary)'
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    label: string;
    onClick: () => void;
  };
  variant?: 'primary' | 'success' | 'warning';
}

/**
 * Quick Action Card
 * Provides a call-to-action for common operations
 */
export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  action,
  variant = 'primary',
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'var(--ant-color-success)';
      case 'warning':
        return 'var(--ant-color-warning)';
      default:
        return 'var(--ant-color-primary)';
    }
  };

  return (
    <WidgetCard style={{ cursor: 'pointer' }} onClick={action.onClick}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
        <div
          style={{
            fontSize: '32px',
            color: getVariantColor(),
            opacity: 0.8,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <WidgetTitle $size="medium">{title}</WidgetTitle>
          <WidgetSubtitle>{description}</WidgetSubtitle>
          <Button
            type="primary"
            size="small"
            style={{ marginTop: '12px' }}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            {action.label}
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

/**
 * Empty State Component
 * Consistent empty state across widgets
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <WidgetEmpty>
      {icon}
      <div>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{title}</div>
        {description && (
          <div style={{ fontSize: '13px', opacity: 0.7 }}>{description}</div>
        )}
      </div>
      {action && (
        <Button type="primary" size="small" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </WidgetEmpty>
  );
};
