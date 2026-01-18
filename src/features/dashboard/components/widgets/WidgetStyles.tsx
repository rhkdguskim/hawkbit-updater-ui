import styled, { css } from 'styled-components';
import { Flex, Typography } from 'antd';
import { softPulse as pulse, IconBadge as SharedIconBadge } from '../../../../components/shared/CommonStyles';

const { Text } = Typography;

export const WidgetContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: var(--ant-border-radius-lg, 16px);
    padding: 20px;
    border: 1px solid var(--ant-color-border-secondary);
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 200px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--ant-box-shadow-tertiary);

    &:hover {
        transform: translateY(-4px);
        box-shadow: var(--ant-box-shadow-secondary);
        border-color: var(--ant-color-border);
    }
`;

export const HeaderRow = styled(Flex)`
    border-bottom: 1px solid var(--ant-color-border-secondary);
    padding-bottom: 12px;
    flex-shrink: 0;
`;

export const IconBadge = styled(SharedIconBadge) <{ $status?: 'normal' | 'warning' | 'critical' }>`
    ${WidgetContainer}:hover & {
        transform: scale(1.1);
    }
`;

export const MetricCard = styled.div`
    background: var(--ant-color-bg-layout);
    border-radius: 10px;
    padding: 12px 16px;
    flex: 1;
    border: 1px solid var(--ant-color-border-secondary);
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
    font-size: 24px;
    font-weight: 700;
    margin-top: 4px;
    color: ${({ $status }) =>
        $status === 'critical' ? 'var(--ant-color-error)' :
            $status === 'warning' ? 'var(--ant-color-warning)' :
                'var(--ant-color-text)'
    };
    display: flex;
    align-items: center;
    gap: 6px;
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
    padding: 12px;
    border-radius: 12px;
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
        box-shadow: var(--shadow-md);
    }

    ${({ $status }) => {
        if ($status === 'error') return css`
            background: rgba(var(--color-error-rgb), 0.05);
            border-left: 4px solid var(--ant-color-error);
            &:hover { background: rgba(var(--color-error-rgb), 0.08); }
        `;
        if ($status === 'warning' || $status === 'canceled') return css`
            background: rgba(var(--color-warning-rgb), 0.05);
            border-left: 4px solid var(--ant-color-warning);
            &:hover { background: rgba(var(--color-warning-rgb), 0.08); }
        `;
        if ($status === 'success') return css`
            background: rgba(var(--color-success-rgb), 0.05);
            border-left: 4px solid var(--ant-color-success);
            &:hover { background: rgba(var(--color-success-rgb), 0.08); }
        `;
        if ($status === 'info') return css`
            background: rgba(var(--color-primary-rgb), 0.05);
            border-left: 4px solid var(--ant-color-primary);
            &:hover { background: rgba(var(--color-primary-rgb), 0.08); }
        `;
        return css`
            border-left: 4px solid transparent;
        `;
    }}
`;
