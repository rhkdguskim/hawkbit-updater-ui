import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import styled, { keyframes } from 'styled-components';
import RouteLoader from '../common/RouteLoader';

const { Content, Footer } = Layout;

const ambientShift = keyframes`
    0% {
        background-position: 0% 0%, 100% 0%, 0% 100%, 0% 0%;
    }
    50% {
        background-position: 10% 8%, 90% 6%, 6% 92%, 0% 0%;
    }
    100% {
        background-position: 0% 0%, 100% 0%, 0% 100%, 0% 0%;
    }
`;

const StyledLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: var(--ant-color-bg-layout);
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(700px circle at 10% -10%, rgba(34, 197, 94, 0.12), transparent 55%),
        radial-gradient(900px circle at 85% 0%, rgba(14, 165, 233, 0.12), transparent 55%),
        radial-gradient(900px circle at 90% 90%, rgba(249, 115, 22, 0.08), transparent 60%),
        linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 60%, rgba(255, 247, 237, 1) 100%);
    background-repeat: no-repeat;
    opacity: 0.95;
    pointer-events: none;
    z-index: 0;
    animation: ${ambientShift} 18s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
  }

  [data-theme='dark'] &::before,
  .dark-mode &::before {
    background-image:
        radial-gradient(700px circle at 10% -10%, rgba(34, 197, 94, 0.12), transparent 55%),
        radial-gradient(900px circle at 85% 0%, rgba(14, 165, 233, 0.1), transparent 55%),
        radial-gradient(900px circle at 90% 90%, rgba(249, 115, 22, 0.06), transparent 60%),
        linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(17, 24, 39, 1) 60%, rgba(30, 41, 59, 1) 100%);
  }

  [data-theme='dark'] &::after,
  .dark-mode &::after {
    background-image: radial-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px);
  }
`;

const ContentLayout = styled(Layout)`
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
`;

const StyledContent = styled(Content) <{ $bg: string; $radius: number }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: ${(props) => props.$radius}px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.4s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StyledFooter = styled(Footer)`
  padding: 4px 16px;
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--ant-color-text-quaternary);
  flex-shrink: 0;

  a {
    color: var(--ant-color-text-tertiary);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--ant-color-primary);
    }
  }

  .version {
    font-family: var(--font-mono);
  }
`;

const MainLayout: React.FC = () => {
  const {
    token: { colorBgLayout, borderRadiusLG },
  } = theme.useToken();

  const currentYear = new Date().getFullYear();

  return (
    <StyledLayout>
      <ContentLayout>
        <AppHeader />
        <StyledContent
          $bg={colorBgLayout}
          $radius={borderRadiusLG}
        >
          <React.Suspense fallback={<RouteLoader />}>
            <Outlet />
          </React.Suspense>
        </StyledContent>
        <StyledFooter>
          <span>© {currentYear} Updater UI. All rights reserved.</span>
          <span className="version">v{__APP_VERSION__}</span>
        </StyledFooter>
      </ContentLayout>
    </StyledLayout>
  );
};

export default MainLayout;
