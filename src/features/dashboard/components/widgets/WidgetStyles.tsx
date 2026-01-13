import styled, { css, keyframes } from 'styled-components';
import { Flex, Typography } from 'antd';

const { Text } = Typography;

export const WidgetContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: var(--ant-border-radius-lg);
    padding: 12px 16px;
    border: 1px solid var(--ant-color-border-secondary);
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    overflow: hidden;
`;

export const HeaderRow = styled(Flex)`
    border-bottom: 1px solid var(--ant-color-border-secondary);
    padding-bottom: 8px;
    flex-shrink: 0;
`;

export const IconBadge = styled.div<{ $status?: 'normal' | 'warning' | 'critical'; $color?: string }>`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: ${({ $status, $color }) => {
        if ($color) return $color.replace(')', '-bg)'); // heuristic if using var
        if ($status === 'critical') return 'var(--ant-color-error-bg)';
        if ($status === 'warning') return 'var(--ant-color-warning-bg)';
        if ($status === 'normal') return 'var(--ant-color-success-bg)';
        return 'var(--ant-color-info-bg)';
    }};
    color: ${({ $status, $color }) => {
        if ($color) return $color;
        if ($status === 'critical') return 'var(--ant-color-error)';
        if ($status === 'warning') return 'var(--ant-color-warning)';
        if ($status === 'normal') return 'var(--ant-color-success)';
        return 'var(--ant-color-info)';
    }};
`;

export const MetricCard = styled.div`
    background: var(--ant-color-fill-quaternary);
    border-radius: var(--ant-border-radius);
    padding: 8px 12px;
    flex: 1;
`;

export const MetricLabel = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        color: var(--ant-color-text-secondary);
    }
`;

export const MetricValue = styled.div<{ $status?: 'normal' | 'warning' | 'critical' }>`
    font-size: 18px;
    font-weight: 700;
    color: ${({ $status }) =>
        $status === 'critical' ? 'var(--ant-color-error)' :
            $status === 'warning' ? 'var(--ant-color-warning)' :
                'var(--ant-color-text)'
    };
    display: flex;
    align-items: center;
    gap: 4px;
`;

export const ThresholdText = styled(Text)`
    && {
        font-size: 11px;
        color: var(--ant-color-text-quaternary);
    }
`;

const pulse = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
`;

export const BottleneckBanner = styled.div<{ $status: 'warning' | 'critical' }>`
    background: ${({ $status }) => $status === 'critical' ? 'var(--ant-color-error-bg)' : 'var(--ant-color-warning-bg)'};
    border-radius: var(--ant-border-radius);
    padding: 8px 10px;
    border: 1px solid ${({ $status }) => $status === 'critical' ? 'var(--ant-color-error-border)' : 'var(--ant-color-warning-border)'};
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;

    ${({ $status }) => $status === 'critical' && css`
        animation: ${pulse} 2s infinite ease-in-out;
    `}
`;

export const BottleneckHeader = styled(Flex) <{ color?: string }>`
    font-weight: 600;
    font-size: 13px;
    color: ${({ color }) => color || 'inherit'};
`;

export const BottleneckDesc = styled(Text)`
    && {
        font-size: 11px;
        color: var(--ant-color-text-secondary);
        display: block;
    }
`;

export const ChartWrapper = styled.div`
    flex: 1;
    min-height: 0;
`;

export const LegendContainer = styled(Flex)`
    padding-top: 4px;
    border-top: 1px solid var(--ant-color-border-secondary);
`;

export const LegendItem = styled(Flex)`
    font-size: 12px;
    gap: 6px;
`;

export const LegendDot = styled.div<{ $color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 2px;
    background: ${props => props.$color};
`;
