/* eslint-disable react-refresh/only-export-components */
import styled, { keyframes, css } from 'styled-components';
import { Card, Typography } from 'antd';

// Animations - 미니멀하고 부드럽게
export const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
`;

export const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// Color Theme Definitions - 심플하고 차분한 스타일
export const OVERVIEW_THEMES = {
    targets: {
        gradient: 'var(--ant-color-success)',
        accentLight: 'rgba(16, 185, 129, 0.08)',
        accentBorder: 'rgba(16, 185, 129, 0.15)',
        iconBg: 'var(--ant-color-success)',
        color: 'var(--ant-color-success)',
    },
    distributions: {
        gradient: 'var(--ant-color-primary)',
        accentLight: 'rgba(59, 130, 246, 0.08)',
        accentBorder: 'rgba(59, 130, 246, 0.15)',
        iconBg: 'var(--ant-color-primary)',
        color: 'var(--ant-color-primary)',
    },
    actions: {
        gradient: '#8b5cf6',
        accentLight: 'rgba(139, 92, 246, 0.08)',
        accentBorder: 'rgba(139, 92, 246, 0.15)',
        iconBg: '#8b5cf6',
        color: '#8b5cf6',
    },
    rollouts: {
        gradient: 'var(--ant-color-warning)',
        accentLight: 'rgba(245, 158, 11, 0.08)',
        accentBorder: 'rgba(245, 158, 11, 0.15)',
        iconBg: 'var(--ant-color-warning)',
        color: 'var(--ant-color-warning)',
    },
    connectivity: {
        gradient: 'var(--ant-color-success)',
        accentLight: 'rgba(16, 185, 129, 0.08)',
        accentBorder: 'rgba(16, 185, 129, 0.15)',
        iconBg: 'var(--ant-color-success)',
        color: 'var(--ant-color-success)',
    },
    deployment: {
        gradient: 'var(--ant-color-primary)',
        accentLight: 'rgba(59, 130, 246, 0.08)',
        accentBorder: 'rgba(59, 130, 246, 0.15)',
        iconBg: 'var(--ant-color-primary)',
        color: 'var(--ant-color-primary)',
    },
    fragmentation: {
        gradient: '#ec4899',
        accentLight: 'rgba(236, 72, 153, 0.08)',
        accentBorder: 'rgba(236, 72, 153, 0.15)',
        iconBg: '#ec4899',
        color: '#ec4899',
    },
    activity: {
        gradient: '#06b6d4',
        accentLight: 'rgba(6, 182, 212, 0.08)',
        accentBorder: 'rgba(6, 182, 212, 0.15)',
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
    padding: 16px;
    animation: ${fadeInUp} 0.25s ease-out;
`;

export const OverviewScrollContent = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
    padding-right: 4px;
`;

export const OverviewPageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 16px 0;
    flex-shrink: 0;
    border-bottom: 1px solid var(--ant-color-border-secondary);
    margin-bottom: 16px;
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
    gap: 16px;
    min-height: 200px;
    flex-shrink: 0;
`;

export const BottomRow = styled.div`
    display: flex;
    gap: 16px;
    min-height: 280px;
    flex: 1;
`;

export const KPIGridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    flex: 0 0 280px;
    height: 100%;
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-width: 0;
`;

// Card Components - 심플하고 깔끔한 스타일
export const OverviewStatsCard = styled(Card) <{ $accentColor?: string; $delay?: number; $pulse?: boolean }>`
    border: 1px solid var(--border-color);
    border-radius: 16px;
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
        transform: translateY(-6px);
        box-shadow: var(--shadow-xl);
        border-color: var(--ant-color-primary-border);
        
        &::before {
            opacity: 1;
        }
    }

    .ant-card-body {
        padding: 24px 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
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
        padding: 12px 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
`;

export const OverviewListCard = styled(OverviewChartCard)``;

export const IconBadge = styled.div<{ $theme?: keyof typeof OVERVIEW_THEMES; $color?: string }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => {
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.accentLight || 'rgba(59, 130, 246, 0.08)';
    }};
    color: ${props => {
        if (props.$color) return props.$color;
        const theme = props.$theme ? OVERVIEW_THEMES[props.$theme] : null;
        return theme?.color || 'var(--ant-color-primary)';
    }};
    font-size: 1.25rem;
    flex-shrink: 0;

    .anticon,
    svg {
        color: inherit;
        display: block;
    }
`;

export const BigNumber = styled.div<{ $color?: string }>`
    font-family: var(--font-mono);
    font-size: 2.5rem;
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
    padding: 8px 12px;
    background: var(--ant-color-fill-quaternary);
    border-radius: 8px;
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
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    
    ${props => {
        const status = props.$status?.toLowerCase();
        if (status === 'online' || status === 'in_sync' || status === 'finished' || status === 'complete') return css`
            background: rgba(16, 185, 129, 0.1);
            color: var(--ant-color-success);
        `;
        if (status === 'running' || status === 'pending') return css`
            background: rgba(99, 102, 241, 0.1);
            color: #6366f1;
        `;
        if (status === 'offline' || status === 'incomplete' || status === 'paused') return css`
            background: rgba(245, 158, 11, 0.1);
            color: var(--ant-color-warning);
        `;
        if (status === 'error' || status === 'failed') return css`
            background: rgba(239, 68, 68, 0.1);
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
    pending: '#6366f1',
    error: 'var(--ant-color-error)',
    unknown: '#71717a',
    // 연결 상태
    online: 'var(--ant-color-success)',
    offline: 'var(--ant-color-warning)',
    // 일반
    success: 'var(--ant-color-success)',
    running: '#6366f1',
    finished: 'var(--ant-color-success)',
    canceled: '#71717a',
    // 테마
    targets: 'var(--ant-color-success)',
    distributions: 'var(--ant-color-primary)',
    actions: '#8b5cf6',
    rollouts: 'var(--ant-color-warning)',
    // 차트 팔레트 - 차분하고 조화로운
    chartPalette: [
        'var(--ant-color-primary)', // Blue
        'var(--ant-color-success)', // Emerald
        '#8b5cf6', // Violet
        'var(--ant-color-warning)', // Amber
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#6366f1', // Indigo
        '#14b8a6', // Teal
    ],
};
