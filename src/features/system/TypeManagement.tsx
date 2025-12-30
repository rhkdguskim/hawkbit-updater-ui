import React, { useState } from 'react';
import { Card, Tabs, Space, Breadcrumb } from 'antd';
import { AppstoreOutlined, BlockOutlined, HomeOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import DistributionSetTypeList from '@/features/distributions/types/DistributionSetTypeList';
import SoftwareModuleTypeList from '@/features/distributions/types/SoftwareModuleTypeList';
import TargetTypeList from '@/features/targets/types/TargetTypeList';
import { useAuthStore } from '@/stores/useAuthStore';
import { Navigate } from 'react-router-dom';
import { PageHeader, PageLayout } from '@/components/patterns';

const StyledCard = styled(Card)`
    flex: 1;
    
    .ant-card-body {
        padding: 0;
    }
`;

const TabContent = styled.div`
    padding: var(--ant-padding-lg, 24px);
`;

const TypeManagement: React.FC = () => {
    const { t } = useTranslation(['system', 'distributions', 'common', 'targets']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [activeTab, setActiveTab] = useState('target-types');

    // Admin only access
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const tabItems = [
        {
            key: 'target-types',
            label: (
                <Space>
                    <UserOutlined />
                    {t('typeManagement.targetTypes', { defaultValue: 'Target Types' })}
                </Space>
            ),
            children: (
                <TabContent>
                    <TargetTypeList />
                </TabContent>
            ),
        },
        {
            key: 'ds-types',
            label: (
                <Space>
                    <AppstoreOutlined />
                    {t('typeManagement.distributionSetTypes')}
                </Space>
            ),
            children: (
                <TabContent>
                    <DistributionSetTypeList />
                </TabContent>
            ),
        },
        {
            key: 'sw-types',
            label: (
                <Space>
                    <BlockOutlined />
                    {t('typeManagement.softwareModuleTypes')}
                </Space>
            ),
            children: (
                <TabContent>
                    <SoftwareModuleTypeList />
                </TabContent>
            ),
        },
    ];

    return (
        <PageLayout>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to="/">
                        <HomeOutlined /> {t('common:nav.home')}
                    </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <SettingOutlined /> {t('common:nav.system')}
                </Breadcrumb.Item>
                <Breadcrumb.Item>{t('typeManagement.title')}</Breadcrumb.Item>
            </Breadcrumb>

            <PageHeader
                title={t('typeManagement.title')}
                description={t('typeManagement.description')}
            />

            <StyledCard>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    type="card"
                />
            </StyledCard>
        </PageLayout>
    );
};

export default TypeManagement;
