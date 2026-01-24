import styled, { css } from 'styled-components';
import { Flex, Typography } from 'antd';
import { softPulse as pulse, IconBadge as SharedIconBadge } from '../../../../components/shared/CommonStyles';

const { Text } = Typography;

export const WidgetContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid var(--ant-color-border-secondary);
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 200px;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
    position: relative;

    /* Subtle gradient overlay for depth */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, transparent 100%);
        pointer-events: none;
        border-radius: 16px 16px 0 0;
        opacity: 0.5;
    }

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: var(--ant-color-primary-border-hover);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
        border-color: rgba(255, 255, 255, 0.06);
        
        &::before {
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
        }

        &:hover {
            box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.5);
            border-color: var(--ant-color-primary-border);
        }
    }
`;

export const HeaderRow = styled(Flex)`
    border-bottom: 1px solid var(--ant-color-border-secondary);
    padding-bottom: 14px;
    margin-bottom: 4px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
`;

export const IconBadge = styled(SharedIconBadge) <{ $status?: 'normal' | 'warning' | 'critical' }>`
    ${WidgetContainer}:hover & {
        transform: scale(1.1);
    }
`;

export const MetricCard = styled.div`
    background: linear-gradient(135deg, var(--ant-color-fill-quaternary) 0%, var(--ant-color-bg-layout) 100%);
    border-radius: 12px;
    padding: 14px 18px;
    flex: 1;
    border: 1px solid var(--ant-color-border-secondary);
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;

    &:hover {
        background: var(--ant-color-fill-tertiary);
        border-color: var(--ant-color-border);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
        border-color: rgba(255, 255, 255, 0.06);
    }
`;

export const MetricLabel = styled(Text)`
    && {
        font-size: 12px;
        color: var(--ant-color-text-secondary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
`;

export const MetricValue = styled.div<{ $status?: 'normal' | 'warning' | 'critical' }>`
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 26px;
    font-weight: 700;
    margin-top: 6px;
    letter-spacing: -0.02em;
    color: ${({ $status }) =>
        $status === 'critical' ? 'var(--ant-color-error)' :
            $status === 'warning' ? 'var(--ant-color-warning)' :
                'var(--ant-color-text)'
    };
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.1;
`;

export const ThresholdText = styled(Text)`
    && {
        font-size: 11px;
        color: var(--ant-color-text-quaternary);
        font-style: italic;
    }
`;



export const BottleneckBanner = styled.div<{ $status: 'warning' | 'critical' }>`
    background: ${({ $status }) => $status === 'critical' ? 'rgba(var(--color-error-rgb), 0.1)' : 'rgba(var(--color-warning-rgb), 0.1)'};
    border-radius: 10px;
    padding: 12px 16px;
    border: 1px solid ${({ $status }) => $status === 'critical' ? 'rgba(var(--color-error-rgb), 0.3)' : 'rgba(var(--color-warning-rgb), 0.3)'};
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    backdrop-filter: blur(4px);

    ${({ $status }) => $status === 'critical' && css`
        animation: ${pulse} 4s infinite ease-in-out;
    `}
`;

export const BottleneckHeader = styled(Flex) <{ color?: string }>`
    font-weight: 700;
    font-size: 14px;
    color: ${({ color }) => color || 'inherit'};
`;

export const BottleneckDesc = styled(Text)`
    && {
        font-size: 11px;
        color: var(--ant-color-text-secondary);
        display: block;
        line-height: 1.4;
    }
`;

export const ChartWrapper = styled.div`
    flex: 1;
    min-height: 180px;
    position: relative;
    margin-top: 8px;
    
    & > .recharts-responsive-container {
        min-height: 100%;
    }
`;

export const LegendContainer = styled(Flex)`
    padding-top: 12px;
    border-top: 1px solid var(--ant-color-border-secondary);
    justify-content: space-around;
`;

export const LegendItem = styled(Flex)`
    font-size: 13px;
    font-weight: 500;
    gap: 8px;
    color: var(--ant-color-text-secondary);
`;

export const LegendDot = styled.div<{ $color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 4px;
    background: ${props => props.$color};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const ActivityCard = styled.div<{ $status?: 'success' | 'error' | 'warning' | 'info' | 'default' | 'canceled' }>`
    display: flex;
    flex-direction: column;
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--ant-color-fill-quaternary);
    border: 1px solid var(--border-secondary);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
        background: var(--ant-color-fill-tertiary);
        border-color: var(--ant-color-primary-border);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px -5px rgba(0, 0, 0, 0.1);
    }

    &:focus-visible {
        outline: 2px solid var(--ant-color-primary);
        outline-offset: 2px;
    }

    ${({ $status }) => {
        if ($status === 'error') return css`
            background: linear-gradient(135deg, rgba(var(--color-error-rgb), 0.06) 0%, rgba(var(--color-error-rgb), 0.02) 100%);
            border-left: 4px solid var(--ant-color-error);
            &:hover { background: linear-gradient(135deg, rgba(var(--color-error-rgb), 0.1) 0%, rgba(var(--color-error-rgb), 0.04) 100%); }
        `;
        if ($status === 'warning' || $status === 'canceled') return css`
            background: linear-gradient(135deg, rgba(var(--color-warning-rgb), 0.06) 0%, rgba(var(--color-warning-rgb), 0.02) 100%);
            border-left: 4px solid var(--ant-color-warning);
            &:hover { background: linear-gradient(135deg, rgba(var(--color-warning-rgb), 0.1) 0%, rgba(var(--color-warning-rgb), 0.04) 100%); }
        `;
        if ($status === 'success') return css`
            background: linear-gradient(135deg, rgba(var(--color-success-rgb), 0.06) 0%, rgba(var(--color-success-rgb), 0.02) 100%);
            border-left: 4px solid var(--ant-color-success);
            &:hover { background: linear-gradient(135deg, rgba(var(--color-success-rgb), 0.1) 0%, rgba(var(--color-success-rgb), 0.04) 100%); }
        `;
        if ($status === 'info') return css`
            background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.06) 0%, rgba(var(--color-primary-rgb), 0.02) 100%);
            border-left: 4px solid var(--ant-color-primary);
            &:hover { background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-primary-rgb), 0.04) 100%); }
        `;
        return css`
            border-left: 4px solid transparent;
        `;
    }}

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(255, 255, 255, 0.02);
        border-color: rgba(255, 255, 255, 0.06);
        
        &:hover {
            background: rgba(255, 255, 255, 0.04);
            box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.3);
        }
    }
`;
