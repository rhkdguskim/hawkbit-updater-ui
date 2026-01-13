import React from 'react';
import { Breadcrumb, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { PageLayout, SectionCard, FullHeightSectionCard as BaseFullHeightSectionCard } from '@/components/patterns';
import { DetailPageHeader } from '@/components/common';

const FullHeightSectionCard = styled(BaseFullHeightSectionCard)`
    /* Restore standard padding */
`;

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
    /** Whether to use full height for the page */
    fullHeight?: boolean;
    /** Whether to wrap content in a SectionCard (defaults to true) */
    useCardWrapper?: boolean;
}

const BreadcrumbWrapper = styled.div`
    margin-bottom: 0;
`;

const ContentWrapper = styled.div<{ $fullHeight?: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    
    ${props => props.$fullHeight && css`
        height: 100%;
        
        .ant-tabs, .ant-tabs-content {
            height: 100%;
        }

        .ant-tabs-tabpane-active {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .ant-tabs-content-holder {
            flex: 1;
            min-height: 0;
            overflow: auto;
        }
    `}
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
    fullHeight = false,
    useCardWrapper = true,
}) => {
    const breadcrumbItems = breadcrumbs.map((item, index) => ({
        key: index,
        title: item.path ? (
            <Link to={item.path}>{item.label}</Link>
        ) : (
            item.label
        ),
    }));

    const renderTabs = () => (
        <Tabs
            items={tabs}
            activeKey={activeTabKey}
            onChange={onTabChange}
            size="middle"
            style={fullHeight ? { height: '100%' } : undefined}
        />
    );

    const renderContent = () => {
        if (tabs) {
            if (useCardWrapper) {
                return (
                    <FullHeightSectionCard loading={loading}>
                        {renderTabs()}
                        {children}
                    </FullHeightSectionCard>
                );
            }
            return (
                <>
                    {renderTabs()}
                    {children}
                </>
            );
        }

        if (useCardWrapper) {
            return (
                <SectionCard loading={loading}>
                    {children}
                </SectionCard>
            );
        }

        return children;
    };

    return (
        <PageLayout fullHeight={fullHeight}>
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

            <ContentWrapper $fullHeight={fullHeight}>
                {renderContent()}
            </ContentWrapper>
        </PageLayout>
    );
};

export default StandardDetailLayout;
