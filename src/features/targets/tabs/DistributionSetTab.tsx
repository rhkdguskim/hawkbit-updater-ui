import React from 'react';
import { Descriptions, Typography, Skeleton, Empty, Tag, Card, List, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import type { MgmtDistributionSet, MgmtSoftwareModule } from '@/api/generated/model';
import dayjs from 'dayjs';
import styled from 'styled-components';

const { Text, Title } = Typography;

interface DistributionSetTabProps {
    installedDS: MgmtDistributionSet | null | undefined;
    assignedDS: MgmtDistributionSet | null | undefined;
    loading: boolean;
    onAssign?: () => void;
    canAssign?: boolean;
}

import { useTranslation } from 'react-i18next';
// ...

const TabLayout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    gap: 16px;
    overflow: hidden;
`;

const AssignRow = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
`;

const CardsStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-right: 4px;
`;

const StyledCard = styled(Card)`
    flex-shrink: 0;

    .ant-card-body {
        display: flex;
        flex-direction: column;
    }
`;

const ModulesSection = styled.div`
    margin-top: 16px;
    max-height: 180px;
    overflow: auto;
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: 4px;
    padding: 8px;
`;


const DSCard: React.FC<{ ds: MgmtDistributionSet | null | undefined; title: string; type: 'installed' | 'assigned' }> = ({
    ds,
    title,
    type,
}) => {
    const { t } = useTranslation('targets');
    if (!ds) {
        return (
            <StyledCard title={title}>
                <Empty description={type === 'installed' ? t('ds.noInstalled') : t('ds.noAssigned')} />
            </StyledCard>
        );
    }

    return (
        <StyledCard
            title={
                <>
                    {title}
                    {type === 'installed' && <Tag color="green" style={{ marginLeft: 8 }}>{t('ds.current')}</Tag>}
                    {type === 'assigned' && <Tag color="blue" style={{ marginLeft: 8 }}>{t('ds.pending')}</Tag>}
                </>
            }
        >
            <Descriptions column={2} size="small">
                <Descriptions.Item label={t('table.name')}>
                    <Text strong>{ds.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Version">
                    <Tag color="cyan">v{ds.version}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('form.description')} span={2}>
                    {ds.description || <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('table.type')}>
                    {ds.type ? <Tag>{ds.type}</Tag> : <Text type="secondary">-</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={t('ds.requiredMigration')}>
                    <Tag color={ds.requiredMigrationStep ? 'orange' : 'default'}>
                        {ds.requiredMigrationStep ? t('ds.yes') : t('ds.no')}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('overview.created')}>
                    {ds.createdAt ? dayjs(ds.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('ds.modules')}>
                    {ds.modules?.length || 0} module(s)
                </Descriptions.Item>
            </Descriptions>

            {ds.modules && ds.modules.length > 0 && (
                <ModulesSection>
                    <Title level={5} style={{ marginBottom: 8 }}>
                        {t('ds.softwareModules')}
                    </Title>
                    <List<MgmtSoftwareModule>
                        size="small"
                        dataSource={ds.modules}
                        renderItem={(module) => (
                            <List.Item>
                                <Text>{module.name}</Text>
                                <Tag style={{ marginLeft: 8 }}>{module.type}</Tag>
                                <Tag color="blue">v{module.version}</Tag>
                            </List.Item>
                        )}
                    />
                </ModulesSection>
            )}
        </StyledCard>
    );
};

const DistributionSetTab: React.FC<DistributionSetTabProps> = ({
    installedDS,
    assignedDS,
    loading,
    onAssign,
    canAssign,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    if (loading) {
        return <Skeleton active paragraph={{ rows: 8 }} />;
    }

    const hasAnyDS = installedDS || assignedDS;

    return (
        <TabLayout>
            {canAssign && (
                <AssignRow>
                    <Button
                        type="primary"
                        icon={<SyncOutlined />}
                        onClick={onAssign}
                    >
                        {t('assign.title')}
                    </Button>
                </AssignRow>
            )}

            {!hasAnyDS && !canAssign ? (
                <Empty description={t('ds.noConfigured')} />
            ) : (
                <CardsStack>
                    <DSCard ds={installedDS} title={t('ds.installed')} type="installed" />
                    <DSCard ds={assignedDS} title={t('ds.assigned')} type="assigned" />
                </CardsStack>
            )}
        </TabLayout>
    );
};

export default DistributionSetTab;
