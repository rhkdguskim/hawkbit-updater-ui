import React from 'react';
import { Breadcrumb, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DetailPageHeader } from '@/components/common';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

export interface StandardDetailLayoutProps {
    /** Breadcrumb items for navigation */
    breadcrumbs: BreadcrumbItem[];
    /** Page title */
    title?: string;
    /** Page description */
    description?: string;
    /** Entity status to display */
    status?: string;
    /** Back button label */
    backLabel: string;
    /** Back navigation callback */
    onBack: () => void;
    /** Loading state */
    loading?: boolean;
    /** Action buttons for header */
    actions?: React.ReactNode;
    /** Extra content after status in header */
    headerExtra?: React.ReactNode;
    /** Tab items for tabbed content */
    tabs?: TabsProps['items'];
    /** Active tab key */
    activeTabKey?: string;
    /** Tab change handler */
    onTabChange?: (key: string) => void;
    /** Child content (used when tabs are not provided) */
    children?: React.ReactNode;
}

const BreadcrumbWrapper = styled.div`
    margin-bottom: 0;
`;

const TabsWrapper = styled.div`
    .ant-tabs-nav {
        margin-bottom: var(--ant-margin-md);
    }
`;

/**
 * Standardized layout component for all detail pages.
 * Provides consistent structure with breadcrumb, header, and optional tabs.
 */
export const StandardDetailLayout: React.FC<StandardDetailLayoutProps> = ({
    breadcrumbs,
    title,
    description,
    status,
    backLabel,
    onBack,
    loading = false,
    actions,
    headerExtra,
    tabs,
    activeTabKey,
    onTabChange,
    children,
}) => {
    const breadcrumbItems = breadcrumbs.map((item, index) => ({
        key: index,
        title: item.path ? (
            <Link to={item.path}>{item.label}</Link>
        ) : (
            item.label
        ),
    }));

    return (
        <PageLayout>
            <BreadcrumbWrapper>
                <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 0 }} />
            </BreadcrumbWrapper>

            <DetailPageHeader
                title={title}
                description={description}
                status={status}
                backLabel={backLabel}
                onBack={onBack}
                loading={loading}
                actions={actions}
                extra={headerExtra}
            />

            {tabs ? (
                <TabsWrapper>
                    <Tabs
                        items={tabs}
                        activeKey={activeTabKey}
                        onChange={onTabChange}
                        size="middle"
                    />
                </TabsWrapper>
            ) : (
                children
            )}
        </PageLayout>
    );
};

export default StandardDetailLayout;
