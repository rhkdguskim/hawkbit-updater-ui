import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Typography } from 'antd';
import styled from 'styled-components';
import DistributionSetList from './DistributionSetList';
import SoftwareModuleList from './SoftwareModuleList';
import SoftwareModuleDetail from './SoftwareModuleDetail';
import DistributionSetDetail from './DistributionSetDetail';
import DSTypesAndTags from './DSTypesAndTags';
import SMTypesAndTags from './SMTypesAndTags';

import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
`;


const Distributions: React.FC = () => {
    const { t } = useTranslation('distributions');

    return (
        <PageContainer>
            <HeaderRow>
                <Title level={2} style={{ margin: 0 }}>
                    {t('pageTitle')}
                </Title>
            </HeaderRow>

            <Routes>
                <Route index element={<Navigate to="sets" replace />} />
                <Route path="sets" element={<DistributionSetList />} />
                <Route path="modules" element={<SoftwareModuleList />} />
                <Route path="ds-types-tags" element={<DSTypesAndTags />} />
                <Route path="sm-types" element={<SMTypesAndTags />} />
                <Route path="sets/:id" element={<DistributionSetDetail />} />
                <Route path="modules/:id" element={<SoftwareModuleDetail />} />
                <Route path="*" element={<Navigate to="sets" replace />} />
            </Routes>
        </PageContainer>
    );
};

export default Distributions;
