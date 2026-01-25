import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Progress, Tooltip } from 'antd';

const shimmer = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`;

const pulse = keyframes`
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
`;

const Container = styled.div<{ $isLive: boolean }>`
    position: relative;
    
    .ant-progress-bg {
        ${props => props.$isLive && css`
            animation: ${shimmer} 2s linear infinite;
            background-image: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.3) 50%,
                rgba(255, 255, 255, 0) 100%
            ) !important;
            background-size: 1000px 100%;
        `}
    }
`;

const LiveIndicator = styled.div`
    position: absolute;
    top: -8px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: var(--ant-color-success);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    ${css`
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const LiveDot = styled.div`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--ant-color-success);
`;

interface RealtimeProgressBarProps {
    percent: number;
    status?: 'success' | 'exception' | 'normal' | 'active';
    showInfo?: boolean;
    size?: 'small' | 'default';
    isLive?: boolean;
    format?: (percent?: number) => React.ReactNode;
}

export const RealtimeProgressBar: React.FC<RealtimeProgressBarProps> = ({
    percent,
    status = 'active',
    showInfo = true,
    size = 'default',
    isLive = false,
    format,
}) => {
    const [displayPercent, setDisplayPercent] = useState(percent);

    useEffect(() => {
        if (isLive && percent !== displayPercent) {
            const increment = percent > displayPercent ? 1 : -1;
            const steps = Math.abs(percent - displayPercent);
            const duration = Math.min(steps * 20, 500);
            const stepDuration = duration / steps;

            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                setDisplayPercent(prev => {
                    const next = prev + increment;
                    if (currentStep >= steps) {
                        clearInterval(timer);
                        return percent;
                    }
                    return next;
                });
            }, stepDuration);

            return () => clearInterval(timer);
        } else {
            setDisplayPercent(percent);
        }
    }, [percent, isLive]);

    return (
        <Container $isLive={isLive}>
            {isLive && (
                <Tooltip title="Updating in real-time">
                    <LiveIndicator>
                        <LiveDot />
                        <span>LIVE</span>
                    </LiveIndicator>
                </Tooltip>
            )}
            <Progress
                percent={displayPercent}
                status={status}
                showInfo={showInfo}
                size={size}
                format={format}
                strokeLinecap="round"
            />
        </Container>
    );
};
