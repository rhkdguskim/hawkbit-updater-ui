import React from 'react';
import { Layout, theme, Avatar, Typography, Dropdown, Divider, Badge, Menu, type MenuProps, Popover, Button } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, EditOutlined, BellOutlined } from '@ant-design/icons';
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
import { useNotificationStore } from '@/stores/useNotificationStore';
import { NotificationPopover } from '@/components/common/NotificationPopover';

const { Header } = Layout;
const { Text } = Typography;

const StyledHeader = styled(Header)`
    padding: 0 24px;
    height: 64px;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
    min-width: 0;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 8px 12px;
    border-radius: 12px;
    margin-left: -8px;
  
  &:hover {
    background: rgba(var(--color-primary-rgb), 0.08);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .logo-icon {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
    transition: box-shadow 0.25s ease;
  }
  
  &:hover .logo-icon {
    box-shadow: 0 6px 16px rgba(var(--color-primary-rgb), 0.4);
  }
  
  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ant-color-text);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .version-badge {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--ant-color-primary-bg);
    color: var(--ant-color-primary);
    border: 1px solid var(--ant-color-primary-border);
  }

  .custom-logo {
    height: 38px;
    width: auto;
    max-width: 180px;
    object-fit: contain;
  }
`;

const StyledMenu = styled(Menu)`
    flex: 1;
    border-bottom: none !important;
    background: transparent !important;
    margin-left: 8px;
    font-weight: 500;
    font-size: 14px;
    line-height: 64px;
    
    .ant-menu-item, .ant-menu-submenu {
        top: 0 !important;
        margin-bottom: 0 !important;
        padding: 0 20px !important;
        height: 64px !important;
        line-height: 64px !important;
        
        &::after {
            bottom: 0 !important;
            border-bottom-width: 3px !important;
            border-radius: 3px 3px 0 0;
        }
    }
    
    .ant-menu-item:hover, .ant-menu-submenu:hover {
        background: rgba(var(--color-primary-rgb), 0.06) !important;
    }
`;

const SettingsGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: var(--ant-color-fill-quaternary);
    border-radius: 10px;
    border: 1px solid var(--ant-color-border-secondary);
`;

const HeaderDivider = styled(Divider)`
    && {
        height: 28px;
        margin: 0 12px;
        border-color: var(--ant-color-border-secondary);
    }
`;

const UserSection = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px 6px 14px;
    background: var(--ant-color-fill-quaternary);
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 44px;
    
    &:hover {
        background: var(--ant-color-fill-tertiary);
        border-color: var(--ant-color-border);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: 160px;
    min-width: 0;
    gap: 1px;
`;

const UserName = styled(Text)`
    font-weight: 600;
    font-size: 13px;
    line-height: 1.3;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserRole = styled(Text)`
    font-size: 11px;
    opacity: 0.65;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const StyledAvatar = styled(Avatar)`
    background: linear-gradient(135deg, var(--ant-color-primary) 0%, var(--ant-color-primary-active) 100%);
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
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
    const { unreadCount } = useNotificationStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path === '/') return ['/'];
        if (path.startsWith('/targets')) return ['targets-menu'];
        if (path.startsWith('/distributions')) return ['distributions-menu'];
        if (path.startsWith('/rollouts')) return ['rollouts-menu'];
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
                <LogoContainer 
                    onClick={() => navigate('/')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate('/');
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={t('common:accessibility.navigateHome')}
                >
                    {customLogo ? (
                        <img src={customLogo} alt={t('common:appName')} className="custom-logo" />
                    ) : (
                        <div className="logo-icon" aria-hidden="true">
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
                <div style={{ marginRight: 8 }}>
                    <Popover
                        content={<NotificationPopover />}
                        trigger="click"
                        placement="bottomRight"
                        arrow={false}
                        styles={{ container: { padding: 0 } }}
                    >
                        <Badge count={unreadCount()} size="small" offset={[-4, 4]}>
                            <Button
                                type="text"
                                icon={<BellOutlined style={{ fontSize: 18 }} />}
                                style={{ color: 'var(--ant-color-text-secondary)' }}
                            />
                        </Badge>
                    </Popover>
                </div>

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
