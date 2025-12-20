import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TargetList from './TargetList';
import TargetDetail from './TargetDetail';
import TagsAndTypes from './TagsAndTypes';


const Targets: React.FC = () => {
    return (
        <Routes>
            <Route index element={<TargetList />} />
            <Route path="tags-types" element={<TagsAndTypes />} />
            <Route path=":id" element={<TargetDetail />} />
            <Route path="*" element={<Navigate to="/targets" replace />} />
        </Routes>
    );
};

export default Targets;
