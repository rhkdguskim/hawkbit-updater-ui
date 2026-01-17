/* eslint-disable react-refresh/only-export-components */
import styled, { keyframes, css } from 'styled-components';
import { Card, Typography } from 'antd';

// Animations - 미니멀하게
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { opacity: 0; transform: translateX(-6px); }
    to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
`;

// Theme for System Configuration
export const SYSTEM_THEME = {
    gradient: 'var(--ant-color-primary)',
    accentLight: 'var(--ant-color-primary-bg)',
    accentBorder: 'var(--ant-color-primary-border)',
    iconBg: 'var(--ant-color-primary)',
    color: 'var(--ant-color-primary)',
};

// Group color themes - 심플한 단색
export const GROUP_THEMES = {
    polling: {
        gradient: 'var(--ant-color-primary)',
        light: 'rgba(59, 130, 246, 0.06)',
        border: 'rgba(59, 130, 246, 0.12)',
        color: 'var(--ant-color-primary)',
    },
    auth: {
        gradient: 'var(--ant-color-success)',
        light: 'rgba(16, 185, 129, 0.06)',
        border: 'rgba(16, 185, 129, 0.12)',
        color: 'var(--ant-color-success)',
    },
    rollout: {
        gradient: 'var(--ant-color-warning)',
        light: 'rgba(245, 158, 11, 0.06)',
        border: 'rgba(245, 158, 11, 0.12)',
        color: 'var(--ant-color-warning)',
    },
    repo: {
        gradient: '#8b5cf6',
        light: 'rgba(139, 92, 246, 0.06)',
        border: 'rgba(139, 92, 246, 0.12)',
        color: '#8b5cf6',
    },
    download: {
        gradient: '#06b6d4',
        light: 'rgba(6, 182, 212, 0.06)',
        border: 'rgba(6, 182, 212, 0.12)',
        color: '#06b6d4',
    },
    assignment: {
        gradient: '#ec4899',
        light: 'rgba(236, 72, 153, 0.06)',
        border: 'rgba(236, 72, 153, 0.12)',
        color: '#ec4899',
    },
    other: {
        gradient: '#64748b',
        light: 'rgba(100, 116, 139, 0.06)',
        border: 'rgba(100, 116, 139, 0.12)',
        color: '#64748b',
    },
};

export type GroupThemeKey = keyof typeof GROUP_THEMES;

// Page Container
export const ConfigPageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    min-height: 0;
    animation: ${fadeInUp} 0.3s ease-out;
    padding: 24px;
    overflow: hidden;
`;

// Header Section
export const ConfigHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 0;
    flex-shrink: 0;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
    }
`;

export const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const GradientTitle = styled(Typography.Title)`
    && {
        margin: 0;
        color: var(--ant-color-text);
        font-weight: 600;
    }
`;

export const StatusIndicator = styled.div<{ $isEdit?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: var(--ant-font-size-sm);
    font-weight: 500;
    background: ${props => props.$isEdit
        ? 'rgba(245, 158, 11, 0.1)'
        : 'rgba(59, 130, 246, 0.1)'
    };
    color: ${props => props.$isEdit ? '#d97706' : 'var(--ant-color-primary)'};
    
    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${props => props.$isEdit ? 'var(--ant-color-warning)' : 'var(--ant-color-primary)'};
        ${props => props.$isEdit && css`animation: ${pulse} 2s ease-in-out infinite;`}
    }
`;

// Groups Container
export const ConfigGroupsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    flex: 1;
    overflow-y: auto;
    padding-bottom: 16px;
    align-content: flex-start;
    
    @media (max-width: 860px) {
        grid-template-columns: 1fr;
    }
`;

// Group Card
export const ConfigGroupCard = styled(Card) <{ $themeKey?: GroupThemeKey; $delay?: number }>`
    border: 1px solid var(--ant-color-border);
    border-radius: 12px;
    background: var(--ant-color-bg-container);
    box-shadow: var(--shadow-sm);
    animation: ${fadeInUp} 0.3s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.05}s;
    animation-fill-mode: both;
    position: relative;
    overflow: visible;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    max-height: 400px;
    
    /* 왼쪽 색상 바 제거 - 심플하게 */
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }
    
    .ant-card-head {
        border-bottom: 1px solid var(--ant-color-border-secondary);
        flex-shrink: 0;
        padding: 14px 16px;
        min-height: auto;
        background: transparent;
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size);
        font-weight: 600;
        color: var(--ant-color-text);
        padding: 0;
    }
    
    .ant-card-body {
        padding: 12px 16px;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
`;

// Icon Badge for Group Title
export const GroupIconBadge = styled.div<{ $themeKey?: GroupThemeKey }>`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => {
        const theme = props.$themeKey ? GROUP_THEMES[props.$themeKey] : null;
        return theme?.light || 'rgba(59, 130, 246, 0.1)';
    }};
    color: ${props => {
        const theme = props.$themeKey ? GROUP_THEMES[props.$themeKey] : null;
        return theme?.color || 'var(--ant-color-primary)';
    }};
    font-size: 1.1rem;
    flex-shrink: 0;
`;

// Config Item Row
export const ConfigItemRow = styled.div<{ $delay?: number }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    margin: 4px 0;
    background: var(--ant-color-fill-quaternary);
    border-radius: 8px;
    transition: all 0.15s ease;
    animation: ${slideIn} 0.25s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.03}s;
    animation-fill-mode: both;
    
    &:hover {
        background: var(--ant-color-fill-tertiary);
    }
`;

// Config Item Label Section
export const ConfigItemLabel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
`;

export const ConfigKeyText = styled.span`
    font-family: var(--font-mono);
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-secondary);
    background: var(--ant-color-fill-secondary);
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    max-width: fit-content;
`;

export const ConfigDescText = styled.span`
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-tertiary);
    line-height: 1.4;
`;

// Config Item Value Section
export const ConfigItemValue = styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 16px;
    min-width: 160px;
    justify-content: flex-end;
`;

// Status Tag for Boolean Values
export const BooleanTag = styled.span<{ $enabled?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: var(--ant-font-size-sm);
    font-weight: 500;
    background: ${props => props.$enabled
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(100, 116, 139, 0.1)'
    };
    color: ${props => props.$enabled ? 'var(--ant-color-success)' : '#64748b'};
`;

// Value Display for non-boolean
export const ValueDisplay = styled.span`
    font-family: var(--font-mono);
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text);
    background: var(--ant-color-fill-secondary);
    padding: 4px 10px;
    border-radius: 6px;
`;

export const ArrayValueContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
`;

export const ArrayTag = styled.span`
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    
    [data-theme='dark'] & {
        background: rgba(139, 92, 246, 0.15);
        color: #a5b4fc;
    }
`;

// Empty Value
export const EmptyValue = styled.span`
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-quaternary);
    font-style: italic;
`;

// No Items message
export const NoItemsMessage = styled.div`
    text-align: center;
    padding: 20px;
    color: var(--ant-color-text-quaternary);
    font-size: var(--ant-font-size-sm);
`;
