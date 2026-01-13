/* eslint-disable react-refresh/only-export-components */
import styled, { keyframes, css } from 'styled-components';
import { Card, Typography } from 'antd';

// Animations
export const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

export const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// Color Theme Definitions - Combined from Dashboard & Feature Overviews
export const OVERVIEW_THEMES = {
    targets: {
        gradient: 'linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)',
        accentLight: 'var(--ant-color-success-bg)',
        accentBorder: 'var(--ant-color-success-border)',
        iconBg: 'linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)',
        color: 'var(--ant-color-success)',
    },
    distributions: {
        gradient: 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)',
        accentLight: 'var(--ant-color-primary-bg)',
        accentBorder: 'var(--ant-color-primary-border)',
        iconBg: 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)',
        color: 'var(--ant-color-primary)',
    },
    actions: {
        gradient: 'linear-gradient(135deg, var(--ant-color-info) 0%, var(--ant-color-info-active) 100%)',
        accentLight: 'var(--ant-color-info-bg)',
        accentBorder: 'var(--ant-color-info-border)',
        iconBg: 'linear-gradient(135deg, var(--ant-color-info) 0%, var(--ant-color-info-active) 100%)',
        color: 'var(--ant-color-info)',
    },
    rollouts: {
        gradient: 'linear-gradient(135deg, var(--ant-color-warning) 0%, var(--ant-color-warning-active) 100%)',
        accentLight: 'var(--ant-color-warning-bg)',
        accentBorder: 'var(--ant-color-warning-border)',
        iconBg: 'linear-gradient(135deg, var(--ant-color-warning) 0%, var(--ant-color-warning-active) 100%)',
        color: 'var(--ant-color-warning)',
    },
    connectivity: {
        gradient: 'linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)',
        accentLight: 'var(--ant-color-success-bg)',
        accentBorder: 'var(--ant-color-success-border)',
        iconBg: 'linear-gradient(135deg, var(--ant-color-success) 0%, var(--ant-color-success-active) 100%)',
        color: 'var(--ant-color-success)',
    },
    deployment: {
        gradient: 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)',
        accentLight: 'var(--ant-color-primary-bg)',
        accentBorder: 'var(--ant-color-primary-border)',
        iconBg: 'linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%)',
        color: 'var(--ant-color-primary)',
    },
    fragmentation: {
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        accentLight: 'rgba(236, 72, 153, 0.08)',
        accentBorder: 'rgba(236, 72, 153, 0.2)',
        iconBg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        color: '#ec4899',
    },
    activity: {
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        accentLight: 'rgba(6, 182, 212, 0.08)',
        accentBorder: 'rgba(6, 182, 212, 0.2)',
        iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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
    padding: var(--ant-margin-xs, 8px);
    animation: ${fadeInUp} 0.5s ease-out;
`;

export const OverviewScrollContent = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: var(--ant-margin-xs, 8px);
    min-height: 0;
    
    /* Custom scrollbar for premium feel */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-primary-bg-hover, rgba(99, 102, 241, 0.1));
        border-radius: 10px;
    }
`;

export const OverviewPageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 var(--ant-padding-xs, 8px) 0;
    flex-shrink: 0;
`;

export const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--ant-margin-xs, 8px);
`;

export const GradientTitle = styled(Typography.Title) <{ $theme?: keyof typeof OVERVIEW_THEMES }>`
    && {
        margin: 0;
        background: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme ? theme.gradient : 'linear-gradient(135deg, var(--ant-color-text) 0%, var(--ant-color-text-description) 100%)';
    }};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

export const TopRow = styled.div`
    display: flex;
    gap: var(--ant-margin-xs, 8px);
    min-height: 240px;
    flex-shrink: 0;
`;

export const BottomRow = styled.div`
    display: flex;
    gap: var(--ant-margin-xs, 8px);
    min-height: 300px;
    flex: 1;
`;

export const KPIGridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ant-margin-xs, 8px);
    flex: 0 0 260px;
    height: 100%;
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: var(--ant-margin-xs, 8px);
    flex: 1;
    min-width: 0;
`;

// Card Components
export const OverviewStatsCard = styled(Card) <{ $accentColor?: string; $delay?: number; $pulse?: boolean }>`
    border: none;
    border-radius: var(--ant-border-radius-lg, 20px);
    background: var(--ant-color-bg-container);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.1}s;
    animation-fill-mode: both;
    cursor: pointer;
    height: 100%;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: ${props => props.$accentColor || 'var(--gradient-primary)'};
        ${props => props.$pulse && css`animation: ${pulse} 2s ease-in-out infinite;`}
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        border: 1px solid var(--ant-color-border-secondary);
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
    border: none;
    border-radius: var(--ant-border-radius-lg, 20px);
    background: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme
            ? `linear-gradient(145deg, ${theme.accentLight} 0%, var(--ant-color-bg-container) 30%, var(--ant-color-bg-container) 100%)`
            : 'var(--ant-color-bg-container)';
    }};
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-sm);
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.1}s;
    animation-fill-mode: both;
    height: 100%;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.gradient || 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)';
    }};
        border-radius: var(--ant-border-radius-lg, 20px) 0 0 var(--ant-border-radius-lg, 20px);
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .ant-card-head {
        border-bottom: 1px solid ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.accentBorder || 'rgba(0, 0, 0, 0.04)';
    }};
        flex-shrink: 0;
        padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
        min-height: auto;
        background: transparent;
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size);
        font-weight: 600;
        color: var(--ant-color-text, #1e293b);
        padding: var(--ant-padding-xxs, 4px) 0;
    }

    .ant-card-body {
        flex: 1;
        padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    [data-theme='dark'] &,
    .dark-mode & {
        border: 1px solid var(--ant-color-border-secondary);
        
        .ant-card-head {
            border-bottom: 1px solid var(--ant-color-border-secondary);
        }
    }
`;

export const OverviewListCard = styled(OverviewChartCard)`
    /* ListCard inherits all styles from ChartCard */
    `;

export const IconBadge = styled.div<{ $theme?: keyof typeof OVERVIEW_THEMES; $color?: string }>`
    width: var(--ant-control-height, 32px);
    height: var(--ant-control-height, 32px);
    border-radius: var(--ant-border-radius-sm, 10px);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.color || 'var(--ant-color-primary, #3b82f6)';
    }};
    background: ${props => {
        if (props.$color) return props.$color;
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.iconBg || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }};
    color: var(--ant-color-text-light-solid, #fff);
    font-size: 1.1rem;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
    box-shadow: var(--shadow-sm);
    flex-shrink: 0;

    .anticon,
    svg {
        color: inherit;
        display: block;
    }
`;

export const BigNumber = styled.div<{ $color?: string }>`
font-size: 2rem;
font-weight: 700;
line-height: 1.2;
margin-bottom: var(--ant-margin-xxs, 4px);
color: ${props => props.$color || 'var(--ant-color-primary, #3b82f6)'};
`;

export const LiveIndicator = styled.div<{ $active?: boolean; $color?: string }>`
    display: flex;
    align-items: center;
    gap: var(--ant-margin-xxs, 4px);
    font-size: var(--ant-font-size-sm);
    color: ${props => props.$active ? (props.$color || 'var(--ant-color-success)') : 'var(--ant-color-text-quaternary)'};
    font-weight: 500;
    
    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => props.$active ? (props.$color || '#10b981') : '#94a3b8'};
        ${props => props.$active && css`animation: ${pulse} 1.5s ease-in-out infinite;`}
    }
`;

export const ChartLegendItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%);
    border-radius: var(--ant-border-radius, 8px);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--ant-color-border-secondary);
    
    &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.9) 100%);
        transform: translateX(2px);
        box-shadow: var(--shadow-xs);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: var(--ant-color-bg-container-secondary, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--ant-color-border-secondary);
        
        span { color: var(--ant-color-text-description) !important; }
        color: var(--ant-color-text-description);
    }
`;

export const ActivityItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
    cursor: pointer;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%);
    border-radius: var(--ant-border-radius, 8px);
    border: 1px solid var(--ant-color-border-secondary);
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
        transform: translateX(2px);
        box-shadow: var(--shadow-xs);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: var(--ant-color-bg-container-secondary, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--ant-color-border-secondary);
        color: var(--ant-color-text-description);
    }
`;

export const StatusBadge = styled.div<{ $status?: string }>`
    display: inline-flex;
    align-items: center;
    gap: var(--ant-margin-xs, 8px);
    padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
    border-radius: var(--ant-border-radius-lg, 20px);
    font-size: var(--ant-font-size-sm);
    font-weight: 500;
    
    ${props => {
        const status = props.$status?.toLowerCase();
        if (status === 'online' || status === 'in_sync' || status === 'finished' || status === 'complete') return css`
            background: rgba(var(--ant-color-success-rgb), 0.1);
            color: var(--ant-color-success);
        `;
        if (status === 'running' || status === 'pending') return css`
            background: rgba(var(--ant-color-info-rgb), 0.1);
            color: var(--ant-color-info);
        `;
        if (status === 'offline' || status === 'incomplete' || status === 'paused') return css`
            background: rgba(var(--ant-color-warning-rgb), 0.1);
            color: var(--ant-color-warning);
        `;
        if (status === 'error' || status === 'failed') return css`
            background: rgba(var(--ant-color-error-rgb), 0.1);
            color: var(--ant-color-error);
        `;
        return css`
            background: var(--ant-color-fill-secondary);
            color: var(--ant-color-text-secondary);
        `;
    }}
`;

export const ProgressBar = styled.div<{ $progress: number; $color?: string }>`
    width: 100%;
    height: 6px;
    background: var(--ant-color-fill-secondary);
    border-radius: var(--ant-border-radius-xs, 4px);
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
        border-radius: var(--ant-border-radius-xs, 4px);
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
};
