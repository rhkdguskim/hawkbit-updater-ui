import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteLoader } from '@/components/common';

const TargetList = React.lazy(() => import('./TargetList'));
const TargetDetail = React.lazy(() => import('./TargetDetail'));

const Targets: React.FC = () => {
    return (
        <React.Suspense fallback={<RouteLoader />}>
            <Routes>
                <Route index element={<Navigate to="list" replace />} />
                <Route path="list" element={<TargetList />} />
                <Route path=":id/:tab" element={<TargetDetail />} />
                <Route path=":id" element={<TargetDetail />} />
                <Route path="*" element={<Navigate to="/targets/list" replace />} />
            </Routes>
        </React.Suspense>
    );
};

export default Targets;
