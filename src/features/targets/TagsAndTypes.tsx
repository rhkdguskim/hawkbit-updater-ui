import React, { useState } from 'react';
import { Typography, Card, Tabs } from 'antd';
import { TagOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Import tag and type management components
import { TargetTagList } from './tags';
import { TargetTypeList } from './types';

const { Title } = Typography;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const TagsAndTypes: React.FC = () => {
    const { t } = useTranslation(['targets', 'common']);
    const [activeTab, setActiveTab] = useState('tags');

    const tabItems = [
        {
            key: 'tags',
            label: (
                <span>
                    <TagOutlined />
                    {t('tagManagement.title')}
                </span>
            ),
            children: <TargetTagList />,
        },
        {
            key: 'types',
            label: (
                <span>
                    <AppstoreOutlined />
                    {t('typeManagement.title')}
                </span>
            ),
            children: <TargetTypeList />,
        },
    ];

    return (
        <PageContainer>
            <Title level={2} style={{ margin: 0 }}>
                {t('tagsAndTypes.title')}
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

export default TagsAndTypes;
