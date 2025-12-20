import React, { useState } from 'react';
import { Typography, Card, Tabs } from 'antd';
import { TagOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Import tag and type management components
import { DistributionSetTypeList } from './types';
import { DistributionSetTagList } from './tags';

const { Title } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const DSTypesAndTags: React.FC = () => {
    const { t } = useTranslation(['distributions', 'common']);
    const [activeTab, setActiveTab] = useState('types');

    const tabItems = [
        {
            key: 'types',
            label: (
                <span>
                    <AppstoreOutlined />
                    {t('dsTypes.title')}
                </span>
            ),
            children: <DistributionSetTypeList />,
        },
        {
            key: 'tags',
            label: (
                <span>
                    <TagOutlined />
                    {t('dsTags.title')}
                </span>
            ),
            children: <DistributionSetTagList />,
        },
    ];

    return (
        <PageContainer>
            <Title level={3} style={{ margin: 0 }}>
                {t('dsTypesAndTags.title')}
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

export default DSTypesAndTags;
