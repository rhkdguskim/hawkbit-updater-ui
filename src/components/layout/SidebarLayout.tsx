import React from 'react';
import { Menu, Card, theme, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, FullHeightSectionCard } from '@/components/patterns';
import styled from 'styled-components';

interface SidebarLayoutProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    items: MenuProps['items'];
    children?: React.ReactNode;
}

const LayoutContainer = styled.div<{ $gap: number }>`
    display: flex;
    gap: ${(props) => props.$gap}px;
    flex: 1;
    min-height: 0;
`;

const SidebarCard = styled(Card)`
    width: 250px;
    height: fit-content;
    
    .ant-card-body {
        padding: 0;
    }

    .ant-menu {
        border-right: none;
        border-radius: inherit;
    }
`;

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
    title,
    subtitle,
    description,
    actions,
    items,
    children
}) => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();

    // Find the current selected key based on the path
    const getSelectedKey = () => {
        // Simple matching: find item key that matches start of current path
        // You might need more complex logic if keys are not paths
        // For now assuming keys are paths
        const path = location.pathname;
        return path;
    };

    return (
        <PageLayout fullHeight>
            <PageHeader
                title={title}
                subtitle={subtitle}
                description={description}
                actions={actions}
            />

            <LayoutContainer $gap={token.marginMD}>
                <SidebarCard>
                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedKey()]}
                        // defaultOpenKeys={items?.map(i => i?.key as string)}
                        onClick={({ key }) => navigate(key)}
                        items={items}
                    />
                </SidebarCard>

                <FullHeightSectionCard style={{ flex: 1 }}>
                    {children}
                </FullHeightSectionCard>
            </LayoutContainer>
        </PageLayout>
    );
};
