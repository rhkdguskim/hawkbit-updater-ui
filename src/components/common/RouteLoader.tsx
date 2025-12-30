import React, { useEffect } from 'react';
import NProgress from 'nprogress';
import { Spin } from 'antd';
import styled from 'styled-components';

// Configure NProgress
NProgress.configure({
    showSpinner: false,
    speed: 400,
    minimum: 0.1
});

const LoaderContainer = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${props => props.$fullScreen ? '100vh' : '100%'};
  min-height: ${props => props.$fullScreen ? '100vh' : '300px'};
  background: ${props => props.$fullScreen ? 'var(--ant-color-bg-layout)' : 'transparent'};
  flex-direction: column;
  gap: 16px;
`;

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: var(--ant-color-primary);
  }
`;

const LoadingText = styled.div`
  color: var(--ant-color-text-secondary);
  font-size: var(--ant-font-size-sm);
  font-weight: 500;
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

interface RouteLoaderProps {
    fullScreen?: boolean;
    tip?: string;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({ fullScreen = false, tip = "Loading..." }) => {
    useEffect(() => {
        NProgress.start();

        return () => {
            NProgress.done();
        };
    }, []);

    return (
        <LoaderContainer $fullScreen={fullScreen}>
            <StyledSpin size="large" />
            {tip && <LoadingText>{tip}</LoadingText>}
        </LoaderContainer>
    );
};

export default RouteLoader;
