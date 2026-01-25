import styled, { keyframes } from 'styled-components';
import { Modal, Input, Button, Badge, Typography } from 'antd';

const { Text } = Typography;

export const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 var(--ant-color-primary-bg); }
    50% { box-shadow: 0 0 20px 5px var(--ant-color-primary-bg); }
`;

export const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const StyledModal = styled(Modal)`
    .ant-modal-content {
        padding: 0;
        overflow: hidden;
        border-radius: 16px;
        background: var(--ant-color-bg-container);
        backdrop-filter: blur(20px);
        border: 1px solid var(--ant-color-border-secondary);
    }
    .ant-modal-body {
        padding: 0;
    }
    .ant-tabs-nav {
        margin-bottom: 0;
        padding: 0 20px;
        border-bottom: 1px solid var(--ant-color-border-secondary);
        background: var(--ant-color-bg-layout);
    }
    .ant-tabs-tab {
        padding: 12px 16px;
        transition: all 0.2s ease;
    }
    .ant-tabs-tab:hover {
        color: var(--ant-color-primary);
    }
    .ant-tabs-ink-bar {
        background: linear-gradient(90deg, var(--ant-color-primary), var(--ant-color-primary-hover));
        height: 3px;
        border-radius: 3px 3px 0 0;
    }
`;

export const SearchHeader = styled.div`
    padding: 20px 24px;
    background: linear-gradient(135deg, var(--ant-color-bg-container) 0%, var(--ant-color-bg-layout) 100%);
    border-bottom: 1px solid var(--ant-color-border-secondary);
`;

export const SearchInput = styled(Input)`
    font-size: var(--ant-font-size-xl);
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    
    .ant-input {
        font-size: var(--ant-font-size-xl);
        background: transparent;
    }
    
    .ant-input::placeholder {
        color: var(--ant-color-text-description);
    }
`;

export const ScrollableContent = styled.div`
    height: 55vh;
    overflow-y: auto;
    padding: 16px 20px 20px;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-border-secondary);
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: var(--ant-color-text-quaternary);
    }
`;

export const CategorySection = styled.div`
    margin-bottom: 24px;
    animation: ${fadeIn} 0.3s ease forwards;
`;

export const CategoryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;
`;

export const CategoryTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--ant-font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ant-color-text-secondary);
`;

export const CategoryIcon = styled.div<{ $color?: string }>`
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: ${props => props.$color || 'var(--ant-color-primary-bg)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ant-font-size-sm);
    color: ${props => props.$color ? 'white' : 'var(--ant-color-primary)'};
`;

export const ResultCard = styled.div<{ $isClickable?: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    margin-bottom: 8px;
    cursor: ${props => props.$isClickable ? 'pointer' : 'default'};
    transition: all 0.2s ease;
    
    ${props => props.$isClickable && `
        &:hover {
            border-color: var(--ant-color-primary-border);
            background: var(--ant-color-primary-bg);
            transform: translateX(4px);
        }
    `}
    
    &:last-child {
        margin-bottom: 0;
    }
`;

export const IconWrapper = styled.div<{ $bgColor?: string; $iconColor?: string }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$bgColor || 'linear-gradient(135deg, var(--ant-color-primary-bg) 0%, var(--ant-color-primary-bg-hover) 100%)'};
    color: ${props => props.$iconColor || 'var(--ant-color-primary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ant-font-size-xl);
    margin-right: 14px;
    flex-shrink: 0;
`;

export const ResultInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const ResultTitle = styled(Text)`
    font-weight: 600;
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ResultSubtitle = styled(Text)`
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-description);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ResultMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-left: 12px;
`;

export const ColorDot = styled.div<{ $color?: string }>`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background: ${props => props.$color || 'var(--ant-color-text-quaternary)'};
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
`;

export const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--ant-color-bg-layout) 0%, var(--ant-color-bg-container) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: var(--ant-color-text-quaternary);
    margin-bottom: 20px;
`;

export const FooterBar = styled.div`
    padding: 10px 20px;
    background: var(--ant-color-bg-layout);
    border-top: 1px solid var(--ant-color-border-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--ant-font-size-sm);
    color: var(--ant-color-text-description);
`;

export const ShortcutBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    font-size: 10px;
    font-weight: 500;
    margin-left: 4px;
`;

export const LoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
`;

export const ViewAllButton = styled(Button)`
    font-size: var(--ant-font-size-sm);
    height: 28px;
    padding: 0 12px;
    border-radius: 6px;
    
    &:hover {
        transform: translateX(2px);
    }
`;

export const TabBadge = styled(Badge)`
    .ant-badge-count {
        font-size: 10px;
        min-width: 18px;
        height: 18px;
        line-height: 18px;
        padding: 0 6px;
        border-radius: 9px;
    }
`;

export const CATEGORY_COLORS = {
    targets: { bg: 'linear-gradient(135deg, var(--ant-color-primary) 0%, #1d4ed8 100%)', icon: 'var(--ant-color-primary)' },
    rollouts: { bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', icon: '#f97316' },
    distSets: { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', icon: '#22c55e' },
    modules: { bg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', icon: '#a855f7' },
    targetTags: { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '#ec4899' },
    dsTags: { bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', icon: '#14b8a6' },
    targetTypes: { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', icon: '#6366f1' },
    dsTypes: { bg: 'linear-gradient(135deg, var(--ant-color-warning) 0%, #d97706 100%)', icon: 'var(--ant-color-warning)' },
    smTypes: { bg: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', icon: '#84cc16' },
};
