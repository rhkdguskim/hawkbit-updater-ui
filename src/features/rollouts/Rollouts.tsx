import React, { useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AppstoreOutlined,
    RocketOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { SidebarLayout } from '@/components/layout';
import { RouteLoader } from '@/components/common';

import RolloutList from './RolloutList';
import RolloutDetail from './RolloutDetail';
import ActionList from '../actions/ActionList';

// Lazy load overview
const RolloutsOverview = React.lazy(() => import('./RolloutsOverview'));

const Rollouts: React.FC = () => {
    const { t } = useTranslation('rollouts');
    const location = useLocation();

    const sidebarItems = useMemo(() => [
        {
            key: '/rollouts/overview',
            icon: <AppstoreOutlined />,
            label: t('overview.title', 'Overview'),
        },
        {
            key: '/rollouts/list',
            icon: <RocketOutlined />,
            label: t('menu.list', 'Rollout List'),
        },
        {
            key: '/rollouts/actions',
            icon: <HistoryOutlined />,
            label: t('menu.actions', 'Action History'),
        }
    ], [t]);

    // Find active item based on current path
    const activeItem = useMemo(() => {
        return sidebarItems.find(item => location.pathname.startsWith(item.key));
    }, [sidebarItems, location.pathname]);

    const pageTitle = activeItem ? activeItem.label : t('feature.title', 'Rollout Management');
    const pageSubtitle = t('feature.subtitle', 'Manage software updates and deployments');

    return (
        <SidebarLayout
            title={pageTitle}
            subtitle={pageSubtitle}
            items={sidebarItems}
        >
            <React.Suspense fallback={<RouteLoader />}>
                <Routes>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<RolloutsOverview standalone={false} />} />
                    <Route path="list" element={<RolloutList standalone={false} />} />
                    <Route path="actions" element={<ActionList standalone={false} />} />

                    <Route path=":rolloutId" element={<RolloutDetail />} />
                    <Route path="*" element={<Navigate to="overview" replace />} />
                </Routes>
            </React.Suspense>
        </SidebarLayout>
    );
};

export default Rollouts;
