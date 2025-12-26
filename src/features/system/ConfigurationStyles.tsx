import styled, { keyframes, css } from 'styled-components';
import { Card, Typography } from 'antd';

// Animations
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
`;

// Theme for System Configuration
export const SYSTEM_THEME = {
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    accentLight: 'rgba(99, 102, 241, 0.08)',
    accentBorder: 'rgba(99, 102, 241, 0.2)',
    iconBg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#6366f1',
};

// Group color themes
export const GROUP_THEMES = {
    polling: {
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        light: 'rgba(59, 130, 246, 0.08)',
        border: 'rgba(59, 130, 246, 0.2)',
        color: '#3b82f6',
    },
    auth: {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        light: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
    },
    rollout: {
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        light: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.2)',
        color: '#f59e0b',
    },
    repo: {
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        light: 'rgba(139, 92, 246, 0.08)',
        border: 'rgba(139, 92, 246, 0.2)',
        color: '#8b5cf6',
    },
    download: {
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        light: 'rgba(6, 182, 212, 0.08)',
        border: 'rgba(6, 182, 212, 0.2)',
        color: '#06b6d4',
    },
    assignment: {
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        light: 'rgba(236, 72, 153, 0.08)',
        border: 'rgba(236, 72, 153, 0.2)',
        color: '#ec4899',
    },
    other: {
        gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
        light: 'rgba(100, 116, 139, 0.08)',
        border: 'rgba(100, 116, 139, 0.2)',
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
    min-height: calc(100vh - 120px);
    animation: ${fadeInUp} 0.5s ease-out;
    padding: 0 4px;
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
    gap: 8px;
`;

export const GradientTitle = styled(Typography.Title)`
    && {
        margin: 0;
        background: ${SYSTEM_THEME.gradient};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .dark-mode & {
        background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
        -webkit-background-clip: text;
        background-clip: text;
    }
`;

export const StatusIndicator = styled.div<{ $isEdit?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: var(--ant-font-size-sm);
    font-weight: 600;
    background: ${props => props.$isEdit
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
    };
    color: ${props => props.$isEdit ? '#d97706' : '#2563eb'};
    border: 1px solid ${props => props.$isEdit ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
    
    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => props.$isEdit ? '#f59e0b' : '#3b82f6'};
        ${props => props.$isEdit && css`animation: ${pulse} 1.5s ease-in-out infinite;`}
    }
`;

// Groups Container
export const ConfigGroupsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;
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
    border: none;
    border-radius: 16px;
    background: ${props => {
        const theme = props.$themeKey ? GROUP_THEMES[props.$themeKey] : null;
        return theme
            ? `linear-gradient(145deg, ${theme.light} 0%, rgba(255, 255, 255, 0.98) 30%, rgba(255, 255, 255, 0.95) 100%)`
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)';
    }};
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    animation: ${fadeInUp} 0.5s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.08}s;
    animation-fill-mode: both;
    position: relative;
    overflow: visible;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    max-height: 400px;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => {
        const theme = props.$themeKey ? GROUP_THEMES[props.$themeKey] : null;
        return theme?.gradient || SYSTEM_THEME.gradient;
    }};
        border-radius: 16px 0 0 16px;
    }
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .ant-card-head {
        border-bottom: 1px solid ${props => {
        const theme = props.$themeKey ? GROUP_THEMES[props.$themeKey] : null;
        return theme?.border || 'rgba(0, 0, 0, 0.04)';
    }};
        flex-shrink: 0;
        padding: 14px 20px;
        min-height: auto;
        background: transparent;
    }
    
    .ant-card-head-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        padding: 0;
    }
    
    .ant-card-body {
        padding: 12px 16px;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }
    
    .dark-mode & {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%);
        
        .ant-card-head {
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .ant-card-head-title {
            color: #e2e8f0;
        }
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
        return theme?.gradient || SYSTEM_THEME.gradient;
    }};
    color: white;
    font-size: 1.25rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
`;

// Config Item Row
export const ConfigItemRow = styled.div<{ $delay?: number }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    margin: 6px 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.5) 100%);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.03);
    transition: all 0.2s ease;
    animation: ${slideIn} 0.3s ease-out;
    animation-delay: ${props => (props.$delay || 0) * 0.05}s;
    animation-fill-mode: both;
    
    &:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%);
        transform: translateX(2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    
    .dark-mode & {
        background: linear-gradient(135deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.4) 100%);
        border: 1px solid rgba(255, 255, 255, 0.05);
        
        &:hover {
            background: linear-gradient(135deg, rgba(51, 65, 85, 0.7) 0%, rgba(30, 41, 59, 0.6) 100%);
        }
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
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: var(--ant-font-size-sm);
    color: #64748b;
    background: rgba(100, 116, 139, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    max-width: fit-content;
    
    .dark-mode & {
        color: #94a3b8;
        background: rgba(148, 163, 184, 0.2);
    }
`;

export const ConfigDescText = styled.span`
    font-size: var(--ant-font-size-sm);
    color: #475569;
    line-height: 1.4;
    
    .dark-mode & {
        color: #cbd5e1;
    }
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
    padding: 6px 14px;
    border-radius: 20px;
    font-size: var(--ant-font-size-sm);
    font-weight: 500;
    background: ${props => props.$enabled
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(100, 116, 139, 0.15) 0%, rgba(71, 85, 105, 0.1) 100%)'
    };
    color: ${props => props.$enabled ? '#059669' : '#64748b'};
    border: 1px solid ${props => props.$enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.2)'};
    
    .dark-mode & {
        background: ${props => props.$enabled
        ? 'rgba(16, 185, 129, 0.2)'
        : 'rgba(100, 116, 139, 0.2)'
    };
    }
`;

// Value Display for non-boolean
export const ValueDisplay = styled.span`
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: var(--ant-font-size-sm);
    color: #1e293b;
    background: rgba(99, 102, 241, 0.08);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(99, 102, 241, 0.15);
    
    .dark-mode & {
        color: #e2e8f0;
        background: rgba(139, 92, 246, 0.15);
        border-color: rgba(139, 92, 246, 0.25);
    }
`;

export const ArrayValueContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
`;

export const ArrayTag = styled.span`
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    border: 1px solid rgba(99, 102, 241, 0.2);
    
    .dark-mode & {
        background: rgba(139, 92, 246, 0.2);
        color: #a5b4fc;
    }
`;

// Empty Value
export const EmptyValue = styled.span`
    font-size: var(--ant-font-size-sm);
    color: #94a3b8;
    font-style: italic;
`;

// No Items message
export const NoItemsMessage = styled.div`
    text-align: center;
    padding: 20px;
    color: #94a3b8;
    font-size: var(--ant-font-size-sm);
`;
