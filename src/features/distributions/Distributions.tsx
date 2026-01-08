import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DistributionSetList from './DistributionSetList';
import SoftwareModuleList from './SoftwareModuleList';
import SoftwareModuleDetail from './SoftwareModuleDetail';
import DistributionSetDetail from './DistributionSetDetail';
import DistributionBulkAssign from './DistributionBulkAssign';

const Distributions: React.FC = () => {
    return (
        <Routes>
            <Route index element={<Navigate to="sets" replace />} />
            <Route path="sets" element={<DistributionSetList />} />
            <Route path="modules" element={<SoftwareModuleList />} />
            <Route path="sets/bulk-assign" element={<DistributionBulkAssign />} />
            <Route path="sets/:id" element={<DistributionSetDetail />} />
            <Route path="modules/:id" element={<SoftwareModuleDetail />} />
            <Route path="*" element={<Navigate to="sets" replace />} />
        </Routes>
    );
};

export default Distributions;
