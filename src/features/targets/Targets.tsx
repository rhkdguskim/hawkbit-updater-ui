import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    AppstoreOutlined,
    UnorderedListOutlined,
    TagsOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { RouteLoader } from '@/components/common';
import { SidebarLayout } from '@/components/layout';

const TargetList = React.lazy(() => import('./TargetList'));
const TargetDetail = React.lazy(() => import('./TargetDetail'));
const TargetsOverview = React.lazy(() => import('./TargetsOverview'));
const TargetTagList = React.lazy(() => import('./tags/TargetTagList'));
const TargetTypeList = React.lazy(() => import('./types/TargetTypeList'));

const Targets: React.FC = () => {
    const { t } = useTranslation('targets');

    const sidebarItems = useMemo(() => [
        {
            key: '/targets/overview',
            icon: <AppstoreOutlined />,
            label: t('overview.title', 'Overview'),
        },
        {
            key: '/targets/list',
            icon: <UnorderedListOutlined />,
            label: t('menu.list', 'Target List'),
        },
        {
            key: '/targets/tags',
            icon: <TagsOutlined />,
            label: t('menu.tags', 'Target Tags'),
        },
        {
            key: '/targets/types',
            icon: <SettingOutlined />,
            label: t('menu.types', 'Target Types'),
        }
    ], [t]);

    return (
        <SidebarLayout
            title={t('feature.title', 'Target Management')}
            subtitle={t('feature.subtitle', 'Manage devices and updates')}
            items={sidebarItems}
        >
            <React.Suspense fallback={<RouteLoader />}>
                <Routes>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<TargetsOverview standalone={false} />} />
                    <Route path="list" element={<TargetList />} />
                    <Route path="tags" element={<TargetTagList standalone={false} />} />
                    <Route path="types" element={<TargetTypeList standalone={false} />} />

                    <Route path=":id/:tab" element={<TargetDetail />} />
                    <Route path=":id" element={<TargetDetail />} />

                    <Route path="*" element={<Navigate to="overview" replace />} />
                </Routes>
            </React.Suspense>
        </SidebarLayout>
    );
};

export default Targets;
