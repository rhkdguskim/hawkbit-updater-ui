import React, { useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AppstoreOutlined,
    CodeOutlined,
    TagsOutlined,
    BlockOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { SidebarLayout } from '@/components/layout';
import { RouteLoader } from '@/components/common';

import DistributionSetList from './DistributionSetList';
import SoftwareModuleList from './SoftwareModuleList';
import SoftwareModuleDetail from './SoftwareModuleDetail';
import DistributionSetDetail from './DistributionSetDetail';
import DistributionBulkAssign from './DistributionBulkAssign';

// Lazy load potentially heavy components
const DistributionsOverview = React.lazy(() => import('./DistributionsOverview'));
const DistributionSetTagList = React.lazy(() => import('./tags/DistributionSetTagList'));
const DistributionSetTypeList = React.lazy(() => import('./types/DistributionSetTypeList'));
const SoftwareModuleTypeList = React.lazy(() => import('./types/SoftwareModuleTypeList'));

const Distributions: React.FC = () => {
    const { t } = useTranslation('distributions');
    const location = useLocation();

    const sidebarItems = useMemo(() => [
        {
            key: '/distributions/overview',
            icon: <AppstoreOutlined />,
            label: t('overview.title', 'Overview'),
        },
        {
            key: '/distributions/sets',
            icon: <FileTextOutlined />,
            label: t('menu.distributionSets', 'Distribution Sets'),
        },
        {
            key: '/distributions/modules',
            icon: <CodeOutlined />,
            label: t('menu.softwareModules', 'Software Modules'),
        },
        {
            key: '/distributions/tags',
            icon: <TagsOutlined />,
            label: t('menu.tags', 'Tags'),
        },
        {
            key: '/distributions/set-types',
            icon: <BlockOutlined />,
            label: t('menu.setTypes', 'Set Types'),
        },
        {
            key: '/distributions/module-types',
            icon: <BlockOutlined />,
            label: t('menu.moduleTypes', 'Module Types'),
        }
    ], [t]);

    // Find active item based on current path
    const activeItem = useMemo(() => {
        return sidebarItems.find(item => location.pathname.startsWith(item.key));
    }, [sidebarItems, location.pathname]);

    const pageTitle = activeItem ? activeItem.label : t('feature.title', 'Distributions');
    const pageSubtitle = t('feature.subtitle', 'Manage software and updates');

    return (
        <SidebarLayout
            title={pageTitle}
            subtitle={pageSubtitle}
            items={sidebarItems}
        >
            <React.Suspense fallback={<RouteLoader />}>
                <Routes>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<DistributionsOverview standalone={false} />} />

                    <Route path="sets" element={<DistributionSetList standalone={false} />} />
                    <Route path="sets/bulk-assign" element={<DistributionBulkAssign />} />
                    <Route path="sets/:id" element={<DistributionSetDetail />} />

                    <Route path="modules" element={<SoftwareModuleList standalone={false} />} />
                    <Route path="modules/:id" element={<SoftwareModuleDetail />} />

                    <Route path="tags" element={<DistributionSetTagList standalone={false} />} />
                    <Route path="set-types" element={<DistributionSetTypeList standalone={false} />} />
                    <Route path="module-types" element={<SoftwareModuleTypeList standalone={false} />} />

                    <Route path="*" element={<Navigate to="overview" replace />} />
                </Routes>
            </React.Suspense>
        </SidebarLayout>
    );
};

export default Distributions;
