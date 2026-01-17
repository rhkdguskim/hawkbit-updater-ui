import styled, { css, keyframes } from 'styled-components';
import { Flex, Typography } from 'antd';

const { Text } = Typography;

export const WidgetContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid var(--ant-color-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-height: 180px;
    overflow: hidden;
`;

export const HeaderRow = styled(Flex)`
    border-bottom: 1px solid var(--ant-color-border-secondary);
    padding-bottom: 10px;
    flex-shrink: 0;
`;

export const IconBadge = styled.div<{ $status?: 'normal' | 'warning' | 'critical'; $color?: string }>`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: ${({ $status, $color }) => {
        if ($color) return `${$color}15`; // 15 = hex opacity ~8%
        if ($status === 'critical') return 'rgba(239, 68, 68, 0.1)';
        if ($status === 'warning') return 'rgba(245, 158, 11, 0.1)';
        if ($status === 'normal') return 'rgba(16, 185, 129, 0.1)';
        return 'rgba(59, 130, 246, 0.1)';
    }};
    color: ${({ $status, $color }) => {
        if ($color) return $color;
        if ($status === 'critical') return 'var(--ant-color-error)';
        if ($status === 'warning') return 'var(--ant-color-warning)';
        if ($status === 'normal') return 'var(--ant-color-success)';
        return 'var(--ant-color-primary)';
    }};
`;

export const MetricCard = styled.div`
    background: var(--ant-color-fill-quaternary);
    border-radius: 8px;
    padding: 10px 14px;
    flex: 1;
`;

export const MetricLabel = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        color: var(--ant-color-text-secondary);
    }
`;

export const MetricValue = styled.div<{ $status?: 'normal' | 'warning' | 'critical' }>`
    font-size: 20px;
    font-weight: 600;
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
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
`;

export const BottleneckBanner = styled.div<{ $status: 'warning' | 'critical' }>`
    background: ${({ $status }) => $status === 'critical' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)'};
    border-radius: 8px;
    padding: 10px 12px;
    border: 1px solid ${({ $status }) => $status === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;

    ${({ $status }) => $status === 'critical' && css`
        animation: ${pulse} 3s infinite ease-in-out;
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
    min-height: 160px;
    position: relative;
    
    & > .recharts-responsive-container {
        min-height: 100%;
    }
`;

export const LegendContainer = styled(Flex)`
    padding-top: 8px;
    border-top: 1px solid var(--ant-color-border-secondary);
`;

export const LegendItem = styled(Flex)`
    font-size: 12px;
    gap: 6px;
`;

export const LegendDot = styled.div<{ $color: string }>`
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: ${props => props.$color};
`;
