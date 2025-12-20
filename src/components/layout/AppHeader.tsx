import React from 'react';
import { Layout, theme, Avatar, Space, Typography, Dropdown, Divider } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/common';

const { Header } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header) <{ $bg: string }>`
    padding: 0 24px;
    background: ${(props) => props.$bg};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const SettingsGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

interface AppHeaderProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = () => {
    const { t } = useTranslation();
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
        if (path === '/') return t('nav.dashboard');
        if (path.startsWith('/targets')) return t('nav.targets');
        if (path.startsWith('/distributions')) return t('nav.distributions');
        if (path.startsWith('/rollouts')) return t('nav.rollouts');
        if (path.startsWith('/system')) return t('nav.configuration');
        return '';
    };

    const userMenu = {
        items: [
            {
                key: 'logout',
                label: t('settings.logout'),
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
                <SettingsGroup>
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </SettingsGroup>

                <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />

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
