import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import styled from 'styled-components';
import RouteLoader from '../common/RouteLoader';

const { Content, Footer } = Layout;

const StyledLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
  background: transparent;
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
  background: ${(props) => props.$bg};
  border-radius: ${(props) => props.$radius}px;
  box-shadow: var(--shadow-xs);
  transition: all 0.3s ease;
  overflow: hidden;
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
  padding: 8px 24px;
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
    font-family: 'SF Mono', Monaco, monospace;
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
