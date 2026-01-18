import styled, { keyframes, css } from 'styled-components';

// --- Animations ---
export const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
`;

export const softPulse = keyframes`
    0%, 100% { opacity: 0.8; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
`;

export const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// --- Common Styled Components ---

/**
 * Common Icon Badge used in widgets and overviews
 */
export const IconBadge = styled.div<{
    $status?: 'normal' | 'warning' | 'critical' | 'success' | 'error' | 'info';
    $color?: string;
    $size?: number;
    $theme?: any; // For OVERVIEW_THEMES compatibility
}>`
    width: ${props => props.$size || 40}px;
    height: ${props => props.$size || 40}px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => (props.$size || 40) * 0.45}px;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    background: ${({ $status, $color, $theme }) => {
        if ($color) return `${$color}15`;
        if ($theme?.accentLight) return $theme.accentLight;
        if ($status === 'critical' || $status === 'error') return 'rgba(var(--color-error-rgb), 0.12)';
        if ($status === 'warning') return 'rgba(var(--color-warning-rgb), 0.12)';
        if ($status === 'normal' || $status === 'success') return 'rgba(var(--color-success-rgb), 0.12)';
        if ($status === 'info') return 'rgba(var(--color-info-rgb), 0.12)';
        return 'rgba(var(--color-primary-rgb), 0.12)';
    }};

    color: ${({ $status, $color, $theme }) => {
        if ($color) return $color;
        if ($theme?.color) return $theme.color;
        if ($status === 'critical' || $status === 'error') return 'var(--ant-color-error)';
        if ($status === 'warning') return 'var(--ant-color-warning)';
        if ($status === 'normal' || $status === 'success') return 'var(--ant-color-success)';
        if ($status === 'info') return 'var(--ant-color-info)';
        return 'var(--ant-color-primary)';
    }};

    .anticon, svg {
        color: inherit;
        display: block;
    }
`;

/**
 * Common surface with glass effect components
 */
export const GlassSurface = css`
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
`;

/**
 * Common subtle card for metrics
 */
export const SubtleCard = styled.div`
    background: var(--ant-color-bg-layout);
    border-radius: 10px;
    padding: 12px 16px;
    border: 1px solid var(--ant-color-border-secondary);
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--ant-color-border);
        background: var(--ant-color-fill-quaternary);
    }
`;
