import React from 'react';
import { Layout, theme, Avatar, Space, Typography, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

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
    const { user, role, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.startsWith('/targets')) return 'Targets';
        if (path.startsWith('/distributions')) return 'Distributions';
        if (path.startsWith('/rollouts')) return 'Rollouts';
        if (path.startsWith('/system')) return 'System Configuration';
        return '';
    };

    const userMenu = {
        items: [
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                onClick: handleLogout,
            },
        ],
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
                    <Text strong>{user} ({role})</Text>
                    <Dropdown menu={userMenu} placement="bottomRight" arrow>
                        <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                    </Dropdown>
                </Space>
            </HeaderRight>
        </StyledHeader>
    );
};

export default AppHeader;
