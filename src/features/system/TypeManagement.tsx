import React, { useState } from 'react';
import { Breadcrumb, Menu, theme, Card } from 'antd';
import { AppstoreOutlined, BlockOutlined, UserOutlined, TagOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TargetTypeList from '@/features/targets/types/TargetTypeList';
import DistributionSetTypeList from '@/features/distributions/types/DistributionSetTypeList';
import SoftwareModuleTypeList from '@/features/distributions/types/SoftwareModuleTypeList';
import TargetTagList from '@/features/targets/tags/TargetTagList';
import DistributionSetTagList from '@/features/distributions/tags/DistributionSetTagList';
import { useAuthStore } from '@/stores/useAuthStore';
import { PageHeader, PageLayout, FullHeightSectionCard } from '@/components/patterns';

const TypeManagement: React.FC = () => {
    const { t } = useTranslation(['system', 'distributions', 'common', 'targets']);
    const { role } = useAuthStore();
    const isAdmin = role === 'Admin';
    const [activeTab, setActiveTab] = useState('target-types');

    // Admin only access
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const { token } = theme.useToken();

    const menuItems: import('antd').MenuProps['items'] = [
        {
            key: 'types-grp',
            label: t('common:nav.types'),
            type: 'group',
            children: [
                {
                    key: 'target-types',
                    icon: <UserOutlined />,
                    label: t('system:typeManagement.targetTypes'),
                },
                {
                    key: 'ds-types',
                    icon: <AppstoreOutlined />,
                    label: t('system:typeManagement.distributionSetTypes'),
                },
                {
                    key: 'sw-types',
                    icon: <BlockOutlined />,
                    label: t('system:typeManagement.softwareModuleTypes'),
                },
            ],
        },
        {
            key: 'tags-grp',
            label: t('common:nav.tags'),
            type: 'group',
            children: [
                {
                    key: 'target-tags',
                    icon: <TagOutlined />,
                    label: t('targets:tagManagement.title'),
                },
                {
                    key: 'ds-tags',
                    icon: <TagOutlined />,
                    label: t('distributions:tagManagement.title'),
                },
            ],
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'target-types': return <TargetTypeList standalone={false} />;
            case 'ds-types': return <DistributionSetTypeList standalone={false} />;
            case 'sw-types': return <SoftwareModuleTypeList standalone={false} />;
            case 'target-tags': return <TargetTagList standalone={false} />;
            case 'ds-tags': return <DistributionSetTagList standalone={false} />;
            default: return <TargetTypeList standalone={false} />;
        }
    };

    return (
        <PageLayout fullHeight>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to="/">
                        {t('common:nav.home')}
                    </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {t('common:nav.system')}
                </Breadcrumb.Item>
                <Breadcrumb.Item>{t('typeManagement.title')}</Breadcrumb.Item>
            </Breadcrumb>

            <PageHeader
                title={t('typeManagement.title')}
                description={t('typeManagement.description')}
            />

            <div style={{ display: 'flex', gap: token.marginMD, flex: 1, minHeight: 0 }}>
                <Card
                    styles={{ body: { padding: 0 } }}
                    style={{ width: 250, height: 'fit-content' }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[activeTab]}
                        onClick={({ key }) => setActiveTab(key)}
                        items={menuItems}
                        style={{ borderRight: 'none' }}
                    />
                </Card>

                <FullHeightSectionCard style={{ flex: 1 }}>
                    {renderContent()}
                </FullHeightSectionCard>
            </div>
        </PageLayout>
    );
};

export default TypeManagement;
