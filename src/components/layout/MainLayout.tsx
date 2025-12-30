import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import styled from 'styled-components';
import RouteLoader from '../common/RouteLoader';

const { Content } = Layout;

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

const MainLayout: React.FC = () => {
  const {
    token: { colorBgLayout, borderRadiusLG },
  } = theme.useToken();

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
      </ContentLayout>
    </StyledLayout>
  );
};

export default MainLayout;
