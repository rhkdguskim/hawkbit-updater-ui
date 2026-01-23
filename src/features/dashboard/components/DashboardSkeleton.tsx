import React from 'react';
import { Skeleton } from 'antd';
import styled from 'styled-components';
import { WidgetCard, WidgetGrid } from '../styles/widgets';
import { loadingShimmer } from '../styles/animations';

const SkeletonWidget = styled(WidgetCard)`
  ${loadingShimmer}
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SkeletonCol = styled.div<{ $flex?: number }>`
  flex: ${({ $flex = 1 }) => $flex};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/**
 * Loading skeleton for Dashboard
 * Provides a smooth loading experience with shimmer effect
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div>
      {/* Header Skeleton */}
      <SkeletonWidget style={{ marginBottom: '24px' }}>
        <Skeleton.Input
          active
          style={{ width: '300px', height: '40px', marginBottom: '12px' }}
        />
        <Skeleton.Input active style={{ width: '200px' }} />
      </SkeletonWidget>

      {/* Top Row - KPI Cards */}
      <SkeletonRow>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCol key={i}>
            <SkeletonWidget>
              <Skeleton.Input
                active
                style={{ width: '120px', marginBottom: '16px' }}
              />
              <Skeleton.Input
                active
                style={{ width: '80px', height: '32px', marginBottom: '8px' }}
              />
              <Skeleton.Input active style={{ width: '100px' }} />
            </SkeletonWidget>
          </SkeletonCol>
        ))}
      </SkeletonRow>

      {/* Middle Row - Operations */}
      <SkeletonRow>
        <SkeletonCol $flex={1.2}>
          <SkeletonWidget style={{ height: '400px' }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </SkeletonWidget>
        </SkeletonCol>
        <SkeletonCol $flex={1.8}>
          <SkeletonWidget style={{ height: '400px' }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </SkeletonWidget>
        </SkeletonCol>
      </SkeletonRow>

      {/* Bottom Row - Analytics */}
      <WidgetGrid $columns={2}>
        {[1, 2].map((i) => (
          <SkeletonWidget key={i} style={{ height: '320px' }}>
            <Skeleton active paragraph={{ rows: 5 }} />
          </SkeletonWidget>
        ))}
      </WidgetGrid>
    </div>
  );
};

/**
 * Compact skeleton for smaller widgets
 */
export const CompactWidgetSkeleton: React.FC = () => {
  return (
    <SkeletonWidget>
      <Skeleton.Input active style={{ width: '140px', marginBottom: '12px' }} />
      <Skeleton.Input active style={{ width: '60px', height: '28px' }} />
    </SkeletonWidget>
  );
};

/**
 * Chart skeleton
 */
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
  return (
    <SkeletonWidget style={{ height: `${height}px` }}>
      <Skeleton.Input
        active
        style={{ width: '150px', marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: height - 80 }}>
        {[60, 80, 70, 90, 75, 85].map((h, i) => (
          <Skeleton.Button
            key={i}
            active
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '4px',
            }}
          />
        ))}
      </div>
    </SkeletonWidget>
  );
};

/**
 * List skeleton for tables/lists
 */
export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <SkeletonWidget>
      <Skeleton.Input active style={{ width: '180px', marginBottom: '16px' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <Skeleton.Avatar active size="small" />
          <div style={{ flex: 1 }}>
            <Skeleton.Input
              active
              style={{ width: '100%', marginBottom: '6px' }}
              size="small"
            />
            <Skeleton.Input active style={{ width: '60%' }} size="small" />
          </div>
        </div>
      ))}
    </SkeletonWidget>
  );
};
