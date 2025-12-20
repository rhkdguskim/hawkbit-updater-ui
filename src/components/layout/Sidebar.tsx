import React from 'react';
import { Layout, Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    MdDashboard,
    MdDevices,
    MdInventory,
    MdRocketLaunch,
    MdSettings,
} from 'react-icons/md';
import styled from 'styled-components';

const { Sider } = Layout;

const LogoContainer = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
`;

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems: MenuProps['items'] = [
        {
            key: '/',
            icon: <MdDashboard />,
            label: 'Dashboard',
        },
        {
            key: 'deployment',
            label: 'Deployment',
            type: 'group',
            children: [
                {
                    key: '/targets',
                    icon: <MdDevices />,
                    label: 'Targets',
                },
                {
                    key: '/distributions',
                    icon: <MdInventory />,
                    label: 'Distributions',
                },
                {
                    key: '/actions',
                    icon: <MdRocketLaunch />,
                    label: 'Actions',
                },
                {
                    key: '/rollouts',
                    icon: <MdRocketLaunch />,
                    label: 'Rollouts',
                },
            ],
        },
        {
            key: 'system',
            label: 'System',
            type: 'group',
            children: [
                {
                    key: '/system/config',
                    icon: <MdSettings />,
                    label: 'Configuration',
                },
            ],
        },
    ];

    return (
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
            width={250}
        >
            <LogoContainer>Updater UI</LogoContainer>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                defaultOpenKeys={['deployment', 'system']}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
};

export default Sidebar;
