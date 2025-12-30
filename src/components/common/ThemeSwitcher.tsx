import React, { useEffect, useState } from 'react';
import { Dropdown, Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores/useThemeStore';
import type { ThemeMode } from '@/stores/useThemeStore';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface ThemeSwitcherProps {
    className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
    const { t } = useTranslation();
    const { mode, setMode, getResolvedTheme } = useThemeStore();
    // Use state to trigger re-renders on system theme changes when in 'system' mode
    const [, setTick] = useState(0);

    // Listen for system theme changes if mode is 'system'
    useEffect(() => {
        if (mode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => setTick(t => t + 1);
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [mode]);

    const resolvedTheme = getResolvedTheme();

    const items: MenuProps['items'] = [
        {
            key: 'light',
            icon: <SunOutlined />,
            label: t('settings.lightMode'),
        },
        {
            key: 'dark',
            icon: <MoonOutlined />,
            label: t('settings.darkMode'),
        },
        {
            key: 'system',
            icon: <DesktopOutlined />,
            label: t('settings.systemMode'),
        },
    ];

    const getIcon = () => {
        if (mode === 'system') {
            return <DesktopOutlined />;
        }
        return resolvedTheme === 'dark' ? <MoonOutlined /> : <SunOutlined />;
    };

    const getTooltipTitle = () => {
        switch (mode) {
            case 'light':
                return t('settings.lightMode');
            case 'dark':
                return t('settings.darkMode');
            case 'system':
                return `${t('settings.systemMode')} (${resolvedTheme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')})`;
            default:
                return t('settings.theme');
        }
    };

    return (
        <Dropdown
            menu={{
                items,
                selectedKeys: [mode],
                onClick: ({ key }) => setMode(key as ThemeMode),
            }}
            trigger={['click']}
        >
            <Tooltip title={getTooltipTitle()}>
                <Button
                    type="text"
                    icon={getIcon()}
                    className={className}
                />
            </Tooltip>
        </Dropdown>
    );
};

export default ThemeSwitcher;
