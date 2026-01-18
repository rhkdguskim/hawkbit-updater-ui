import React from 'react';
import { Layout, theme, Avatar, Typography, Dropdown, Divider, Badge, Menu, type MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, EditOutlined } from '@ant-design/icons';
import {
    MdDashboard,
    MdDevices,
    MdInventory,
    MdRocketLaunch,
    MdPlayArrow,
    MdAssignment,
    MdLayers,
    MdWidgets,
    MdExtension,
} from 'react-icons/md';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/common';
import { AppSearchBar } from './AppSearchBar';
import { useThemeStore } from '@/stores/useThemeStore';
import { UISettingsModal } from '@/components/modals';

const { Header } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header)`
    padding: 0 16px;
    height: 52px;
    background: var(--glass-bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--glass-shadow);
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
    min-width: 0;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
  
  .logo-icon {
    width: 28px;
    height: 28px;
    background: var(--gradient-primary);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
  }
  
  .logo-text {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-title);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  .version-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(var(--color-primary-rgb), 0.1);
    color: var(--ant-color-primary);
    border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  }

  .custom-logo {
    height: 36px;
    width: auto;
    max-width: 160px;
    object-fit: contain;
  }
`;

const StyledMenu = styled(Menu)`
    flex: 1;
    border-bottom: none !important;
    background: transparent !important;
    margin-left: 12px;
    font-weight: 500;
    font-size: 13px;
    
    .ant-menu-item, .ant-menu-submenu {
        top: 0 !important;
        margin-bottom: 0 !important;
        
        &::after {
            bottom: -1px !important;
            border-bottom-width: 3px !important;
            border-radius: 3px 3px 0 0;
        }
    }
`;

const SettingsGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px;
    background: var(--ant-color-primary-bg, rgba(99, 102, 241, 0.04));
    border-radius: 8px;
`;

const HeaderDivider = styled(Divider)`
    && {
        height: 24px;
        margin: 0 8px;
    }
`;

const UserSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 8px 2px 10px;
    background: var(--ant-color-primary-bg, rgba(99, 102, 241, 0.04));
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 32px;
    
    &:hover {
        background: var(--ant-color-primary-bg-hover, rgba(99, 102, 241, 0.1));
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: 160px;
    min-width: 0;
`;

const UserName = styled(Text)`
    font-weight: 600;
    font-size: 13px;
    line-height: 1.2;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserRole = styled(Text)`
    font-size: 11px;
    opacity: 0.7;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const StyledAvatar = styled(Avatar)`
    background: var(--ant-color-primary);
    box-shadow: 0 2px 8px var(--ant-color-primary-hover);
    font-size: 14px;
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
    const { customLogo } = useThemeStore();
    const [uiSettingsOpen, setUiSettingsOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path === '/') return ['/'];
        if (path.startsWith('/targets')) return ['targets-menu'];
        if (path.startsWith('/distributions')) return ['distributions-menu'];
        if (path.startsWith('/actions')) return ['/rollouts-menu'];
        if (path.startsWith('/rollouts')) return ['/rollouts-menu'];
        return [];
    };

    const menuItems: MenuProps['items'] = [
        {
            key: '/',
            icon: <MdDashboard />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/'),
        },
        {
            key: 'targets-menu',
            label: t('nav.targets'),
            icon: <MdDevices />,
            onClick: () => navigate('/targets/list'),
        },
        {
            key: 'distributions-menu',
            label: t('nav.distributions'),
            icon: <MdInventory />,
            onClick: () => navigate('/distributions/sets'),
        },
        {
            key: 'rollouts-menu',
            icon: <MdAssignment />,
            label: t('nav.rolloutManagement'),
            onClick: () => navigate('/rollouts/list'),
        },
    ];

    const userMenuItems: MenuProps['items'] = [
        ...(role === 'Admin' ? [{
            key: 'settings',
            label: t('nav.configuration'),
            icon: <SettingOutlined />,
            onClick: () => navigate('/system/config'),
        }, {
            key: 'types',
            label: t('nav.typeManagement'),
            icon: <MdExtension />,
            onClick: () => navigate('/system/types'),
        }, { type: 'divider' as const }] : []),
        {
            key: 'ui-settings',
            label: t('settings.customizeUI'),
            icon: <EditOutlined />,
            onClick: () => setUiSettingsOpen(true),
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            label: t('settings.logout'),
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <StyledHeader>
            <HeaderLeft>
                <LogoContainer onClick={() => navigate('/')}>
                    {customLogo ? (
                        <img src={customLogo} alt="Logo" className="custom-logo" />
                    ) : (
                        <div className="logo-icon">
                            <MdRocketLaunch />
                        </div>
                    )}
                    <span className="logo-text">{import.meta.env.VITE_LOGIN_TITLE || 'Updater UI'}</span>
                </LogoContainer>

                <StyledMenu
                    mode="horizontal"
                    selectedKeys={getSelectedKeys()}
                    items={menuItems}
                    disabledOverflow
                />
            </HeaderLeft>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <AppSearchBar />
            </div>

            <HeaderRight>

                <SettingsGroup>
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </SettingsGroup>

                <HeaderDivider orientation="vertical" />

                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={['click']}>
                    <UserSection>
                        <UserInfo>
                            <UserName>{user}</UserName>
                            <UserRole type="secondary">{role}</UserRole>
                        </UserInfo>
                        <Badge dot status="success" offset={[-2, 24]}>
                            <StyledAvatar icon={<UserOutlined />} size={30} />
                        </Badge>
                    </UserSection>
                </Dropdown>
            </HeaderRight>
            <UISettingsModal open={uiSettingsOpen} onClose={() => setUiSettingsOpen(false)} />
        </StyledHeader>
    );
};

export default AppHeader;
