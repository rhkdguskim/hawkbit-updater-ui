/**
 * App Router Configuration
 * 
 * Centralized routing configuration for the application.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ROUTES } from './routes';
import RouteLoader from '@/components/common/RouteLoader';

// Lazy load feature components for code splitting
const Dashboard = React.lazy(() => import('@/features/dashboard/Dashboard'));
const Targets = React.lazy(() => import('@/features/targets/Targets'));
const Distributions = React.lazy(() => import('@/features/distributions/Distributions'));
const Actions = React.lazy(() => import('@/features/actions/Actions'));
const Rollouts = React.lazy(() => import('@/features/rollouts/Rollouts'));

const Configuration = React.lazy(() => import('@/features/system/Configuration'));
const TypeManagement = React.lazy(() => import('@/features/system/TypeManagement'));
const LoginPage = React.lazy(() => import('@/features/auth/LoginPage'));
const AuthGuard = React.lazy(() => import('@/features/auth/AuthGuard'));

// Global loading fallback component using RouteLoader
const GlobalLoadingFallback: React.FC = () => (
    <RouteLoader fullScreen />
);

const AppRouter: React.FC = () => {
    return (
        <React.Suspense fallback={<GlobalLoadingFallback />}>
            <Routes>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<AuthGuard />}>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="targets/*" element={<Targets />} />
                        <Route path="distributions/*" element={<Distributions />} />
                        <Route path="actions/*" element={<Actions />} />
                        <Route path="rollouts/*" element={<Rollouts />} />

                        <Route path="system/config" element={<Configuration />} />
                        <Route path="system/types" element={<TypeManagement />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </React.Suspense>
    );
};

export default AppRouter;
export { ROUTES };
