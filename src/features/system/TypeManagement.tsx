import React, { useState } from 'react';
import { Card, Tabs, Typography, Space, Breadcrumb } from 'antd';
import { AppstoreOutlined, BlockOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import DistributionSetTypeList from '@/features/distributions/types/DistributionSetTypeList';
import SoftwareModuleTypeList from '@/features/distributions/types/SoftwareModuleTypeList';
import { useAuthStore } from '@/stores/useAuthStore';
import { Navigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    height: 100%;
    overflow-y: auto;
`;

const HeaderSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
`;

const TitleGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const GradientTitle = styled(Title)`
    && {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
    }
`;

const StyledCard = styled(Card)`
    flex: 1;
    
    .ant-card-body {
        padding: 0;
    }
`;

const TabContent = styled.div`
    padding: 24px;
`;

const TypeManagement: React.FC = () => {
    const { t } = useTranslation(['system', 'distributions', 'common']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [activeTab, setActiveTab] = useState('ds-types');

    // Admin only access
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const tabItems = [
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
        <PageContainer>
            <HeaderSection>
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

                <PageHeader>
                    <TitleGroup>
                        <GradientTitle level={3}>
                            {t('typeManagement.title')}
                        </GradientTitle>
                        <Text type="secondary">
                            {t('typeManagement.description')}
                        </Text>
                    </TitleGroup>
                </PageHeader>
            </HeaderSection>

            <StyledCard>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    type="card"
                    style={{ margin: 16 }}
                />
            </StyledCard>
        </PageContainer>
    );
};

export default TypeManagement;
