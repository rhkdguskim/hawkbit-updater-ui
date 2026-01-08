import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TargetList from './TargetList';
import TargetDetail from './TargetDetail';

const Targets: React.FC = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="list" replace />} />
            <Route path="list" element={<TargetList />} />
            <Route path=":id/:tab" element={<TargetDetail />} />
            <Route path=":id" element={<TargetDetail />} />
            <Route path="*" element={<Navigate to="/targets/list" replace />} />
        </Routes>
    );
};

export default Targets;
