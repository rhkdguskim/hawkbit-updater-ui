/* eslint-disable react-refresh/only-export-components */
import styled, { keyframes, css } from 'styled-components';
import { Card, Typography } from 'antd';

import { fadeInUp, pulse, shimmer, IconBadge as SharedIconBadge } from './CommonStyles';

export { fadeInUp, pulse, shimmer };

// Color Theme Definitions - Semantic based
export const OVERVIEW_THEMES = {
    targets: {
        gradient: 'var(--gradient-success)',
        accentLight: 'var(--surface-targets)',
        accentBorder: 'rgba(var(--color-success-rgb), 0.2)',
        iconBg: 'var(--ant-color-success)',
        color: 'var(--ant-color-success)',
    },
    distributions: {
        gradient: 'var(--gradient-primary)',
        accentLight: 'var(--surface-distributions)',
        accentBorder: 'rgba(var(--color-primary-rgb), 0.2)',
        iconBg: 'var(--ant-color-primary)',
        color: 'var(--ant-color-primary)',
    },
    actions: {
        gradient: 'var(--gradient-info)',
        accentLight: 'var(--surface-actions)',
        accentBorder: 'rgba(var(--color-info-rgb), 0.2)',
        iconBg: 'var(--ant-color-info)',
        color: 'var(--ant-color-info)',
    },
    rollouts: {
        gradient: 'var(--gradient-warning)',
        accentLight: 'var(--surface-rollouts)',
        accentBorder: 'rgba(var(--color-warning-rgb), 0.2)',
        iconBg: 'var(--ant-color-warning)',
        color: 'var(--ant-color-warning)',
    },
    connectivity: {
        gradient: 'var(--gradient-success)',
        accentLight: 'var(--surface-targets)',
        accentBorder: 'rgba(var(--color-success-rgb), 0.2)',
        iconBg: 'var(--ant-color-success)',
        color: 'var(--ant-color-success)',
    },
    deployment: {
        gradient: 'var(--gradient-primary)',
        accentLight: 'var(--surface-distributions)',
        accentBorder: 'rgba(var(--color-primary-rgb), 0.2)',
        iconBg: 'var(--ant-color-primary)',
        color: 'var(--ant-color-primary)',
    },
    fragmentation: {
        gradient: 'var(--gradient-error)',
        accentLight: 'rgba(var(--color-error-rgb), 0.12)',
        accentBorder: 'rgba(var(--color-error-rgb), 0.2)',
        iconBg: 'var(--ant-color-error)',
        color: 'var(--ant-color-error)',
    },
    activity: {
        gradient: 'var(--gradient-info)',
        accentLight: 'rgba(var(--color-info-rgb), 0.12)',
        accentBorder: 'rgba(var(--color-info-rgb), 0.2)',
        iconBg: 'var(--ant-color-info)',
        color: 'var(--ant-color-info)',
    },
};

// Layout Components
export const OverviewPageContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    padding: 8px;
    animation: ${fadeInUp} 0.25s ease-out;
`;

export const OverviewScrollContent = styled.div`
    flex: 1;
    overflow-y: overlay;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding-right: 2px;
`;

export const OverviewPageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 12px 0;
    flex-shrink: 0;
    border-bottom: 1px solid var(--ant-color-border-secondary);
    margin-bottom: 12px;
`;

export const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const GradientTitle = styled(Typography.Title) <{ $theme?: keyof typeof OVERVIEW_THEMES }>`
    && {
        margin: 0;
        color: var(--ant-color-text);
        font-weight: 600;
        letter-spacing: -0.01em;
    }
`;

export const TopRow = styled.div`
    display: flex;
    gap: 10px;
    min-height: 140px;
    flex-shrink: 0;
`;

export const BottomRow = styled.div`
    display: flex;
    gap: 10px;
    min-height: 200px;
    flex: 1;
`;

export const KPIGridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    flex: 0 0 240px;
    height: 100%;
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: 10px;
    flex: 1;
    min-width: 0;
`;

// Card Components - 심플하고 깔끔한 스타일
export const OverviewStatsCard = styled(Card) <{ $accentColor?: string; $delay?: number; $pulse?: boolean }>`
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-container);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal) var(--transition-gentle);
    position: relative;
    overflow: hidden;
    animation: ${fadeInUp} 0.4s var(--transition-gentle) both;
    animation-delay: ${props => (props.$delay || 0) * 0.05}s;
    cursor: pointer;
    height: 100%;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: ${props => props.$accentColor || 'var(--ant-color-primary)'};
        opacity: 0.15;
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
        border-color: var(--ant-color-primary-border);
        
        &::before {
            opacity: 1;
        }
    }

    .ant-card-body {
        padding: 12px 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
    }
`;

export const OverviewChartCard = styled(Card) <{ $delay?: number; $theme?: keyof typeof OVERVIEW_THEMES }>`
    border: 1px solid var(--ant-color-border);
    border-radius: 12px;
    background: var(--ant-color-bg-container);
    box-shadow: var(--shadow-sm);
    animation: ${fadeInUp} 0.25s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.03}s;
    animation-fill-mode: both;
    height: 100%;
    min-height: 200px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
        border-color: var(--ant-color-primary-border);
    }
    
    .ant-card-head {
        border-bottom: 1px solid var(--ant-color-border-secondary);
        flex-shrink: 0;
        padding: 12px 16px;
        min-height: 48px; 
        background: var(--ant-color-bg-container);
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size);
        font-weight: 600;
        color: var(--ant-color-text);
        padding: 0;
    }

    .ant-card-body {
        flex: 1;
        padding: 10px 14px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
`;

export const OverviewListCard = styled(OverviewChartCard)``;

export const IconBadge = styled(SharedIconBadge)``;

export const BigNumber = styled.div<{ $color?: string }>`
    font-family: var(--font-mono);
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 2px;
    color: ${props => props.$color || 'var(--ant-color-text)'};
    letter-spacing: -0.05em;
    transition: all 0.3s ease;
`;

export const LiveIndicator = styled.div<{ $active?: boolean; $color?: string }>`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    color: ${props => props.$active ? (props.$color || 'var(--ant-color-success)') : 'var(--ant-color-text-quaternary)'};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    
    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${props => props.$active ? (props.$color || 'var(--ant-color-success)') : '#94a3b8'};
        ${props => props.$active && css`animation: ${pulse} 2s infinite;`}
    }
`;

export const ChartLegendItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: var(--ant-color-fill-quaternary);
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--transition-fast) var(--transition-gentle);
    border: 1px solid transparent;
    
    &:hover {
        background: var(--bg-page);
        border-color: var(--border-color);
        transform: translateX(4px);
    }
`;

export const ActivityItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    cursor: pointer;
    height: 100%;
    width: 100%;
    background: var(--ant-color-fill-quaternary);
    border-radius: 8px;
    transition: all 0.15s ease;

    &:hover {
        background: var(--ant-color-fill-tertiary);
    }
`;

export const StatusBadge = styled.div<{ $status?: string }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    
    ${props => {
        const status = props.$status?.toLowerCase();
        if (status === 'online' || status === 'in_sync' || status === 'finished' || status === 'complete') return css`
            background: rgba(var(--color-success-rgb), 0.12);
            color: var(--ant-color-success);
            border: 1px solid rgba(var(--color-success-rgb), 0.2);
        `;
        if (status === 'running' || status === 'pending') return css`
            background: rgba(var(--color-primary-rgb), 0.12);
            color: var(--ant-color-primary);
            border: 1px solid rgba(var(--color-primary-rgb), 0.2);
            animation: ${pulse} 2s infinite;
        `;
        if (status === 'offline' || status === 'incomplete' || status === 'paused') return css`
            background: rgba(var(--color-warning-rgb), 0.12);
            color: var(--ant-color-warning);
            border: 1px solid rgba(var(--color-warning-rgb), 0.2);
        `;
        if (status === 'error' || status === 'failed') return css`
            background: rgba(var(--color-error-rgb), 0.12);
            color: var(--ant-color-error);
            border: 1px solid rgba(var(--color-error-rgb), 0.2);
        `;
        return css`
            background: var(--ant-color-fill-secondary);
            color: var(--text-tertiary);
            border: 1px solid var(--border-secondary);
        `;
    }}
`;

export const ProgressBar = styled.div<{ $progress: number; $color?: string }>`
    width: 100%;
    height: 4px;
    background: var(--ant-color-fill-secondary);
    border-radius: 4px;
    overflow: hidden;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${props => props.$progress}%;
        background: ${props => props.$color || 'var(--ant-color-primary)'};
        border-radius: 4px;
        transition: width 0.3s ease;
    }
`;

export const COLORS = {
    // 상태 색상 - 차분하고 명확한
    inSync: 'var(--ant-color-success)',
    pending: 'var(--ant-color-primary)',
    error: 'var(--ant-color-error)',
    unknown: 'var(--text-tertiary)',
    // 연결 상태
    online: 'var(--ant-color-success)',
    offline: 'var(--ant-color-warning)',
    // 일반
    success: 'var(--ant-color-success)',
    running: 'var(--ant-color-primary)',
    finished: 'var(--ant-color-success)',
    canceled: 'var(--text-tertiary)',
    // 테마
    targets: 'var(--ant-color-success)',
    distributions: 'var(--ant-color-primary)',
    actions: 'var(--ant-color-info)',
    rollouts: 'var(--ant-color-warning)',
    // 차트 팔레트 - 차분하고 조화로운
    chartPalette: [
        'var(--ant-color-primary)',
        'var(--ant-color-success)',
        'var(--ant-color-info)',
        'var(--ant-color-warning)',
        'var(--ant-color-error)',
        'var(--ant-color-cyan)',
        'var(--ant-color-purple)',
        'var(--ant-color-pink)',
    ],
};
