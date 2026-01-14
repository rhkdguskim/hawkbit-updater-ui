/* eslint-disable react-refresh/only-export-components */
import styled, { keyframes, css } from 'styled-components';
import { Card, Typography } from 'antd';

// Animations
export const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
    0% { opacity: 1; box-shadow: 0 0 0 0 rgba(var(--ant-color-primary-rgb), 0.4); }
    70% { opacity: 1; box-shadow: 0 0 0 6px rgba(var(--ant-color-primary-rgb), 0); }
    100% { opacity: 1; box-shadow: 0 0 0 0 rgba(var(--ant-color-primary-rgb), 0); }
`;

export const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// Color Theme Definitions - Industrial Clean
export const OVERVIEW_THEMES = {
    targets: {
        gradient: 'linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)',
        accentLight: 'rgba(var(--ant-color-success-rgb), 0.05)',
        accentBorder: 'rgba(var(--ant-color-success-rgb), 0.2)',
        iconBg: 'var(--ant-color-success)',
        color: 'var(--ant-color-success)',
    },
    distributions: {
        gradient: 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)',
        accentLight: 'rgba(var(--ant-color-primary-rgb), 0.05)',
        accentBorder: 'rgba(var(--ant-color-primary-rgb), 0.2)',
        iconBg: 'var(--ant-color-primary)',
        color: 'var(--ant-color-primary)',
    },
    actions: {
        gradient: 'linear-gradient(135deg, var(--ant-color-info) 0%, var(--ant-color-info-active) 100%)',
        accentLight: 'rgba(var(--ant-color-info-rgb), 0.05)',
        accentBorder: 'rgba(var(--ant-color-info-rgb), 0.2)',
        iconBg: 'var(--ant-color-info)',
        color: 'var(--ant-color-info)',
    },
    rollouts: {
        gradient: 'linear-gradient(135deg, var(--ant-color-warning) 0%, var(--ant-color-warning-active) 100%)',
        accentLight: 'rgba(var(--ant-color-warning-rgb), 0.05)',
        accentBorder: 'rgba(var(--ant-color-warning-rgb), 0.2)',
        iconBg: 'var(--ant-color-warning)',
        color: 'var(--ant-color-warning)',
    },
    connectivity: {
        gradient: 'linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)',
        accentLight: 'rgba(var(--ant-color-success-rgb), 0.05)',
        accentBorder: 'rgba(var(--ant-color-success-rgb), 0.2)',
        iconBg: 'var(--ant-color-success)',
        color: 'var(--ant-color-success)',
    },
    deployment: {
        gradient: 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)',
        accentLight: 'rgba(var(--ant-color-primary-rgb), 0.05)',
        accentBorder: 'rgba(var(--ant-color-primary-rgb), 0.2)',
        iconBg: 'var(--ant-color-primary)',
        color: 'var(--ant-color-primary)',
    },
    fragmentation: {
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        accentLight: 'rgba(236, 72, 153, 0.05)',
        accentBorder: 'rgba(236, 72, 153, 0.2)',
        iconBg: '#ec4899',
        color: '#ec4899',
    },
    activity: {
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        accentLight: 'rgba(6, 182, 212, 0.05)',
        accentBorder: 'rgba(6, 182, 212, 0.2)',
        iconBg: '#06b6d4',
        color: '#06b6d4',
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
    padding: var(--ant-margin-sm, 12px);
    animation: ${fadeInUp} 0.3s ease-out;
`;

export const OverviewScrollContent = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: var(--ant-margin-sm, 12px);
    min-height: 0;
    padding-right: 4px; /* Space for scrollbar */
`;

export const OverviewPageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 var(--ant-padding-sm, 12px) 0;
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
        /* Use solid color for industrial legibility, or very subtle gradient */
        color: var(--ant-color-text);
        font-weight: 700;
        letter-spacing: -0.02em;
    }
`;

export const TopRow = styled.div`
    display: flex;
    gap: var(--ant-margin-sm, 12px);
    min-height: 200px; /* Reduced height for density */
    flex-shrink: 0;
`;

export const BottomRow = styled.div`
    display: flex;
    gap: var(--ant-margin-sm, 12px);
    min-height: 280px;
    flex: 1;
`;

export const KPIGridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ant-margin-sm, 12px);
    flex: 0 0 260px;
    height: 100%;
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: var(--ant-margin-sm, 12px);
    flex: 1;
    min-width: 0;
`;

// Card Components - Defined Borders
export const OverviewStatsCard = styled(Card) <{ $accentColor?: string; $delay?: number; $pulse?: boolean }>`
    border: 1px solid var(--ant-color-border);
    border-radius: var(--ant-border-radius-lg, 12px);
    background: var(--ant-color-bg-container);
    /* backdrop-filter removal for clarity/perf */
    box-shadow: var(--shadow-sm);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    animation: ${fadeInUp} 0.3s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.05}s;
    animation-fill-mode: both;
    cursor: pointer;
    height: 100%;

    /* Top accent line */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: ${props => props.$accentColor || 'var(--ant-color-primary)'};
        opacity: 0.8;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--ant-color-primary-border);
    }

    .ant-card-body {
        padding: var(--ant-padding-sm, 12px);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
`;

export const OverviewChartCard = styled(Card) <{ $delay?: number; $theme?: keyof typeof OVERVIEW_THEMES }>`
    border: 1px solid var(--ant-color-border);
    border-radius: var(--ant-border-radius-lg, 12px);
    background: var(--ant-color-bg-container);
    box-shadow: var(--shadow-sm);
    animation: ${fadeInUp} 0.3s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.05}s;
    animation-fill-mode: both;
    height: 100%;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1px; /* Top highlight only */
        background: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.color || 'transparent';
    }};
        opacity: 0.5;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--ant-color-primary-border);
    }
    
    .ant-card-head {
        border-bottom: 1px solid var(--ant-color-border-secondary);
        flex-shrink: 0;
        padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
        min-height: 48px; 
        background: var(--ant-color-bg-container);
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size);
        font-weight: 600;
        color: var(--ant-color-text);
        padding: 4px 0;
    }

    .ant-card-body {
        flex: 1;
        padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
`;

export const OverviewListCard = styled(OverviewChartCard)`
    /* Inherits */
    `;

export const IconBadge = styled.div<{ $theme?: keyof typeof OVERVIEW_THEMES; $color?: string }>`
    width: 36px;
    height: 36px;
    border-radius: var(--ant-border-radius, 6px); /* Use theme radius or 6px */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.accentLight || 'rgba(59, 130, 246, 0.1)';
    }};
    color: ${props => {
        if (props.$color) return props.$color;
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.color || 'var(--ant-color-primary)';
    }};
    border: 1px solid ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.accentBorder || 'transparent';
    }};
    font-size: 1.1rem;
    flex-shrink: 0;

    .anticon,
    svg {
        color: inherit;
        display: block;
    }
`;

export const BigNumber = styled.div<{ $color?: string }>`
    font-family: var(--font-mono); /* Monospace numbers */
    font-size: 2.25rem;
    font-weight: 600;
    line-height: 1.1;
    margin-bottom: 4px;
    color: ${props => props.$color || 'var(--ant-color-primary)'};
    letter-spacing: -0.04em;
`;

export const LiveIndicator = styled.div<{ $active?: boolean; $color?: string }>`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--ant-font-size-sm);
    color: ${props => props.$active ? (props.$color || 'var(--ant-color-success)') : 'var(--ant-color-text-quaternary)'};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.05em;
    
    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => props.$active ? (props.$color || '#10b981') : '#94a3b8'};
        box-shadow: ${props => props.$active ? `0 0 8px ${props.$color || '#10b981'}` : 'none'};
        ${props => props.$active && css`animation: ${pulse} 2s infinite;`}
    }
`;

export const ChartLegendItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: var(--ant-color-bg-container);
    border-radius: var(--ant-border-radius, 6px);
    cursor: pointer;
    transition: all 0.1s ease;
    border: 1px solid var(--ant-color-border);
    
    &:hover {
        background: var(--ant-color-bg-text-hover);
        border-color: var(--ant-color-border-hover);
    }
`;

export const ActivityItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    height: 100%;
    width: 100%;
    background: var(--ant-color-bg-container);
    border-radius: var(--ant-border-radius, 6px);
    border: 1px solid var(--ant-color-border); /* Visible border */
    transition: all 0.1s ease;

    &:hover {
        background: var(--ant-color-bg-text-hover); /* Subtle gray */
        border-color: var(--ant-color-primary); /* Highlight border */
    }
`;

export const StatusBadge = styled.div<{ $status?: string }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 4px; /* Capsule */
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    
    ${props => {
        const status = props.$status?.toLowerCase();
        if (status === 'online' || status === 'in_sync' || status === 'finished' || status === 'complete') return css`
            background: rgba(var(--ant-color-success-rgb), 0.1);
            color: var(--ant-color-success);
            border: 1px solid rgba(var(--ant-color-success-rgb), 0.2);
        `;
        if (status === 'running' || status === 'pending') return css`
            background: rgba(var(--ant-color-info-rgb), 0.1);
            color: var(--ant-color-info);
            border: 1px solid rgba(var(--ant-color-info-rgb), 0.2);
        `;
        if (status === 'offline' || status === 'incomplete' || status === 'paused') return css`
            background: rgba(var(--ant-color-warning-rgb), 0.1);
            color: var(--ant-color-warning);
            border: 1px solid rgba(var(--ant-color-warning-rgb), 0.2);
        `;
        if (status === 'error' || status === 'failed') return css`
            background: rgba(var(--ant-color-error-rgb), 0.1);
            color: var(--ant-color-error);
            border: 1px solid rgba(var(--ant-color-error-rgb), 0.2);
        `;
        return css`
            background: var(--ant-color-fill-secondary);
            color: var(--ant-color-text-secondary);
            border: 1px solid var(--ant-color-border);
        `;
    }}
`;

export const ProgressBar = styled.div<{ $progress: number; $color?: string }>`
    width: 100%;
    height: 6px;
    background: var(--ant-color-fill-secondary);
    border-radius: 2px; /* Sharper */
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
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;

export const COLORS = {
    // Update Status Colors
    inSync: 'var(--ant-color-success, #10b981)',
    pending: 'var(--ant-color-info, #3b82f6)',
    error: 'var(--ant-color-error, #ef4444)',
    unknown: 'var(--ant-color-text-quaternary, #94a3b8)',
    // Connectivity Colors
    online: 'var(--ant-color-success, #10b981)',
    offline: 'var(--ant-color-warning, #f59e0b)',
    // General
    success: 'var(--ant-color-success, #10b981)',
    running: 'var(--ant-color-info, #3b82f6)',
    finished: 'var(--ant-color-success, #10b981)',
    canceled: 'var(--ant-color-text-quaternary, #94a3b8)',
    // Theme
    targets: 'var(--ant-color-success, #10b981)',
    distributions: 'var(--ant-color-primary, #6366f1)',
    actions: 'var(--ant-color-info, #3b82f6)',
    rollouts: 'var(--ant-color-warning, #f59e0b)',
    chartPalette: [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#3b82f6', // Blue
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#06b6d4', // Cyan
    ],
};
