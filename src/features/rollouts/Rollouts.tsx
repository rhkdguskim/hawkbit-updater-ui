import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RolloutList from './RolloutList';
import RolloutDetail from './RolloutDetail';

const Rollouts: React.FC = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="list" replace />} />
            <Route path="list" element={<RolloutList />} />
            <Route path=":rolloutId" element={<RolloutDetail />} />
            <Route path="*" element={<Navigate to="list" replace />} />
        </Routes>
    );
};

export default Rollouts;
