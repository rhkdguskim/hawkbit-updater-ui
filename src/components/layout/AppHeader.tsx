import React from 'react';
import { Layout, theme, Avatar, Typography, Dropdown, Divider, Badge } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/common';

const { Header } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header) <{ $bg: string }>`
    padding: 0 32px;
    height: 64px;
    background: ${(props) => props.$bg};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
    
    .dark-mode & {
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const PageTitle = styled(Typography.Title)`
    margin: 0 !important;
    font-weight: 600 !important;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    [data-theme='dark'] & {
        background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SettingsGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: rgba(99, 102, 241, 0.06);
    border-radius: 10px;
`;

const UserSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px 6px 16px;
    background: rgba(99, 102, 241, 0.06);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(99, 102, 241, 0.1);
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const UserName = styled(Text)`
    font-weight: 600;
    font-size: 13px;
    line-height: 1.2;
`;

const UserRole = styled(Text)`
    font-size: 11px;
    opacity: 0.7;
`;

const StyledAvatar = styled(Avatar)`
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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
        if (path.startsWith('/actions')) return t('nav.actions');
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
                danger: true,
            },
        ],
    };

    return (
        <StyledHeader $bg={colorBgContainer}>
            <HeaderLeft>
                <PageTitle level={4}>
                    {getPageTitle()}
                </PageTitle>
            </HeaderLeft>

            <HeaderRight>
                <SettingsGroup>
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </SettingsGroup>

                <Divider type="vertical" style={{ height: 32, margin: '0 4px' }} />

                <Dropdown menu={userMenu} placement="bottomRight" arrow trigger={['click']}>
                    <UserSection>
                        <UserInfo>
                            <UserName>{user}</UserName>
                            <UserRole type="secondary">{role}</UserRole>
                        </UserInfo>
                        <Badge dot status="success" offset={[-4, 28]}>
                            <StyledAvatar icon={<UserOutlined />} size={36} />
                        </Badge>
                    </UserSection>
                </Dropdown>
            </HeaderRight>
        </StyledHeader>
    );
};

export default AppHeader;
