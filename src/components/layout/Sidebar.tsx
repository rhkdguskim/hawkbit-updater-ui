import React from 'react';
import { Layout, Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MdDashboard,
  MdDevices,
  MdInventory,
  MdRocketLaunch,
  MdSettings,
  MdPlayArrow,
} from 'react-icons/md';
import styled from 'styled-components';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }
`;

const LogoContainer = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(129, 140, 248, 0.4);
  }
  
  .logo-text {
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border: none !important;
  padding: 12px 8px;
  
  .ant-menu-item {
    margin: 4px 0 !important;
    border-radius: 10px !important;
    height: 44px !important;
    line-height: 44px !important;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }
    
    .ant-menu-item-icon {
      font-size: 20px !important;
    }
  }
  
  .ant-menu-item-selected {
    background: linear-gradient(135deg, rgba(129, 140, 248, 0.3) 0%, rgba(167, 139, 250, 0.2) 100%) !important;
    box-shadow: 0 4px 12px rgba(129, 140, 248, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 24px;
      background: linear-gradient(180deg, #818cf8 0%, #a78bfa 100%);
      border-radius: 0 4px 4px 0;
    }
  }
  
  .ant-menu-item-group-title {
    color: rgba(255, 255, 255, 0.45) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    padding: 16px 16px 8px !important;
  }
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <MdDashboard />,
      label: t('nav.dashboard'),
    },
    {
      key: 'deployment',
      label: t('nav.deployment'),
      type: 'group',
      children: [
        {
          key: 'targets-submenu',
          icon: <MdDevices />,
          label: t('nav.targets'),
          children: [
            {
              key: 'target-list-submenu',
              label: t('nav.targetList'),
              children: [
                {
                  key: '/targets',
                  label: t('nav.viewList'),
                },
                {
                  key: '/targets/bulk-assign',
                  label: t('nav.bulkAssign'),
                },
              ],
            },
            {
              key: '/targets/tags',
              label: t('nav.targetTags'),
            },
            {
              key: '/targets/types',
              label: t('nav.targetTypes'),
            },
          ],
        },
        {
          key: 'distributions-submenu',
          icon: <MdInventory />,
          label: t('nav.distributions'),
          children: [
            {
              key: 'distribution-sets-submenu',
              label: t('nav.distributionSets'),
              children: [
                {
                  key: '/distributions/sets',
                  label: t('nav.list'),
                },
                {
                  key: '/distributions/ds-types',
                  label: t('nav.types'),
                },
                {
                  key: '/distributions/ds-tags',
                  label: t('nav.tags'),
                },
                {
                  key: '/distributions/sets/bulk-assign',
                  label: t('nav.bulkAssign'),
                },
              ],
            },
            {
              key: 'software-modules-submenu',
              label: t('nav.softwareModules'),
              children: [
                {
                  key: '/distributions/modules',
                  label: t('nav.list'),
                },
                {
                  key: '/distributions/sm-types',
                  label: t('nav.types'),
                },
              ],
            },
          ],
        },
        {
          key: '/actions',
          icon: <MdPlayArrow />,
          label: t('nav.actions'),
        },
        {
          key: '/rollouts',
          icon: <MdRocketLaunch />,
          label: t('nav.rollouts'),
        },
      ],
    },
    {
      key: 'system',
      label: t('nav.system'),
      type: 'group',
      children: [
        {
          key: '/system/config',
          icon: <MdSettings />,
          label: t('nav.configuration'),
        },
      ],
    },
  ];

  // Get selected keys based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/targets' || path === '/targets/') return ['/targets'];
    if (path.startsWith('/targets/tags')) return ['/targets/tags'];
    if (path.startsWith('/targets/types')) return ['/targets/types'];
    if (path.startsWith('/targets/bulk-assign')) return ['/targets/bulk-assign'];
    if (path.startsWith('/targets/')) return ['/targets']; // Detail pages

    if (path.startsWith('/distributions/ds-tags')) return ['/distributions/ds-tags'];
    if (path.startsWith('/distributions/ds-types')) return ['/distributions/ds-types'];
    if (path.startsWith('/distributions/sm-types')) return ['/distributions/sm-types'];
    if (path.startsWith('/distributions/sets/bulk-assign')) return ['/distributions/sets/bulk-assign'];
    if (path.startsWith('/distributions/modules')) return ['/distributions/modules'];
    if (path.startsWith('/distributions')) return ['/distributions/sets'];

    return [path];
  };

  // Get open keys for sub-menus
  const getOpenKeys = () => {
    const path = location.pathname;
    // Always keep main sections open
    const openKeys = ['deployment', 'system'];

    if (path.startsWith('/targets')) {
      openKeys.push('targets-submenu');
      if (path === '/targets' || path === '/targets/' || path.startsWith('/targets/bulk-assign') || (path.startsWith('/targets/') && !path.startsWith('/targets/tags') && !path.startsWith('/targets/types'))) {
        openKeys.push('target-list-submenu');
      }
    }

    if (path.startsWith('/distributions')) {
      openKeys.push('distributions-submenu');
      if (path.startsWith('/distributions/sets') || path.startsWith('/distributions/ds-types') || path.startsWith('/distributions/ds-tags')) {
        openKeys.push('distribution-sets-submenu');
      }
      if (path.startsWith('/distributions/modules') || path.startsWith('/distributions/sm-types')) {
        openKeys.push('software-modules-submenu');
      }
    }

    return openKeys;
  };

  return (
    <StyledSider
      breakpoint="lg"
      collapsedWidth="0"
      width={260}
    >
      <LogoContainer>
        <div className="logo-icon">
          <MdRocketLaunch />
        </div>
        <span className="logo-text">Updater UI</span>
      </LogoContainer>
      <StyledMenu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </StyledSider>
  );
};

export default Sidebar;
