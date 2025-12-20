import React, { useState } from 'react';
import { Typography, Card, Tabs } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Import type management component
import { SoftwareModuleTypeList } from './types';

const { Title } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SMTypesAndTags: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const [activeTab, setActiveTab] = useState('types');

    const tabItems = [
        {
            key: 'types',
            label: (
                <span>
                    <AppstoreOutlined />
                    {t('smTypes.title')}
                </span>
            ),
            children: <SoftwareModuleTypeList />,
        },
    ];

    return (
        <PageContainer>
            <Title level={3} style={{ margin: 0 }}>
                {t('smTypesAndTags.title')}
            </Title>
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </Card>
        </PageContainer>
    );
};

export default SMTypesAndTags;
