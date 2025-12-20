import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TargetList from './TargetList';
import TargetDetail from './TargetDetail';
import { TargetTypeList } from './types';
import { TargetTagList } from './tags';
import { BulkAssignment } from './bulk';

const Targets: React.FC = () => {
    return (
        <Routes>
            <Route index element={<TargetList />} />
            <Route path="types" element={<TargetTypeList />} />
            <Route path="tags" element={<TargetTagList />} />
            <Route path="bulk-assign" element={<BulkAssignment />} />
            <Route path=":id" element={<TargetDetail />} />
            <Route path="*" element={<Navigate to="/targets" replace />} />
        </Routes>
    );
};

export default Targets;

