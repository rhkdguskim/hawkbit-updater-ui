import React from 'react';
import { Layout, theme, Avatar, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header) <{ $bg: string }>`
  padding: 0 24px;
  background: ${(props) => props.$bg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

interface AppHeaderProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.startsWith('/targets')) return 'Targets';
        if (path.startsWith('/distributions')) return 'Distributions';
        if (path.startsWith('/rollouts')) return 'Rollouts';
        if (path.startsWith('/system')) return 'System Configuration';
        return '';
    };

    return (
        <StyledHeader $bg={colorBgContainer}>
            <HeaderLeft>
                <Typography.Title level={4} style={{ margin: 0 }}>
                    {getPageTitle()}
                </Typography.Title>
            </HeaderLeft>

            <HeaderRight>
                <Space size="middle">
                    {/* Theme Toggle Placeholder */}
                    <Text strong>Admin</Text>
                    <Avatar icon={<UserOutlined />} />
                </Space>
            </HeaderRight>
        </StyledHeader>
    );
};

export default AppHeader;
