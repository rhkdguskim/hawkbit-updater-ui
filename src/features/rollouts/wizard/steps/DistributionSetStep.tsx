import { Col, Input, Row, Select, Space, Spin, Table, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGetAssignedSoftwareModules } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetArtifacts } from '@/api/generated/software-modules/software-modules';
import type {
    MgmtArtifact,
    MgmtSoftwareModule,
    PagedListMgmtDistributionSet,
    PagedListMgmtDistributionSetType,
} from '@/api/generated/model';
import type { WizardFormData } from '../hooks/useRolloutWizardState';
import { WizardCard } from '../components/WizardLayout';

const { Text } = Typography;

type DistributionSetStepProps = {
    formData: WizardFormData;
    onSelectDistributionSet: (distributionSetId: number, name: string) => void;
    dsSearchField: 'name' | 'version' | 'description';
    setDsSearchField: (value: 'name' | 'version' | 'description') => void;
    setDsSearchValue: (value: string) => void;
    dsTypeFilter?: string;
    setDsTypeFilter: (value?: string) => void;
    dsTypesData?: PagedListMgmtDistributionSetType;
    dsTypesLoading: boolean;
    dsData?: PagedListMgmtDistributionSet;
    dsLoading: boolean;
    isModal?: boolean;
};

const ModuleArtifacts: React.FC<{ softwareModuleId: number }> = ({ softwareModuleId }) => {
    const { t } = useTranslation(['common']);
    const { data: artifactsData, isLoading } = useGetArtifacts(softwareModuleId);

    if (isLoading) return <Spin size="small" style={{ marginLeft: 8 }} />;
    const artifacts = artifactsData || [];
    if (artifacts.length === 0) return null;

    return (
        <ul style={{ margin: '4px 0 8px 16px', fontSize: '12px', color: '#666' }}>
            {artifacts.map((art: MgmtArtifact) => (
                <li key={art.hashes?.sha1}>
                    {art.providedFilename} ({Math.round((art.size || 0) / 1024)} {t('common:units.kb')})
                </li>
            ))}
        </ul>
    );
};

const ArtifactPreview: React.FC<{ distributionSetId: number }> = ({ distributionSetId }) => {
    const { t } = useTranslation(['rollouts', 'distributions', 'common']);
    const { data: modulesData, isLoading } = useGetAssignedSoftwareModules(distributionSetId);

    if (isLoading) return <Spin size="small" />;
    const modules = modulesData?.content || [];
    if (modules.length === 0) return <Text type="secondary">{t('common:messages.noData')}</Text>;

    return (
        <div style={{ padding: '8px 24px' }}>
            <Typography.Title level={5}>{t('rollouts:wizard.distributionSet.softwareModules')}</Typography.Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                {modules.map((mod: MgmtSoftwareModule) => (
                    <div key={mod.id}>
                        <Text strong>{mod.name} ({mod.version})</Text>
                        <ModuleArtifacts softwareModuleId={mod.id} />
                    </div>
                ))}
            </Space>
        </div>
    );
};

export const DistributionSetStep = ({
    formData,
    onSelectDistributionSet,
    dsSearchField,
    setDsSearchField,
    setDsSearchValue,
    dsTypeFilter,
    setDsTypeFilter,
    dsTypesData,
    dsTypesLoading,
    dsData,
    dsLoading,
    isModal,
}: DistributionSetStepProps) => {
    const { t } = useTranslation(['rollouts', 'common']);

    return (
        <WizardCard title={t('wizard.distributionSet.title')} $isModal={isModal}>
            <div style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col flex="auto">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                value={dsSearchField}
                                onChange={setDsSearchField}
                                options={[
                                    { label: t('wizard.distributionSet.searchName'), value: 'name' },
                                    { label: t('wizard.distributionSet.searchVersion'), value: 'version' },
                                    { label: t('wizard.distributionSet.searchDescription'), value: 'description' },
                                ]}
                                style={{ width: 120 }}
                            />
                            <Input.Search
                                placeholder={t('wizard.distributionSet.searchPlaceholder')}
                                allowClear
                                onSearch={(value) => setDsSearchValue(value)}
                                style={{ width: '100%' }}
                                enterButton
                            />
                        </Space.Compact>
                    </Col>
                    <Col>
                        <Select
                            placeholder={t('wizard.distributionSet.filterByType')}
                            value={dsTypeFilter}
                            onChange={setDsTypeFilter}
                            allowClear
                            loading={dsTypesLoading}
                            style={{ minWidth: 150 }}
                            options={(dsTypesData?.content || []).map(type => ({
                                label: type.name,
                                value: type.name,
                            }))}
                        />
                    </Col>
                </Row>
            </div>
            <Table
                loading={dsLoading}
                dataSource={dsData?.content || []}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 5 }}
                expandable={{
                    expandedRowRender: (record) => <ArtifactPreview distributionSetId={record.id} />,
                    rowExpandable: (record) => !!record.id,
                }}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: formData.distributionSetId ? [formData.distributionSetId] : [],
                    onChange: (_, selectedRows) => {
                        const row = selectedRows[0];
                        onSelectDistributionSet(row.id, `${row.name} (${row.version})`);
                    },
                }}
                columns={[
                    { title: t('wizard.distributionSet.columns.name'), dataIndex: 'name' },
                    { title: t('wizard.distributionSet.columns.version'), dataIndex: 'version', width: 100 },
                    {
                        title: t('wizard.distributionSet.columns.type'),
                        dataIndex: 'type',
                        width: 120,
                        render: (type: string) => <Tag>{type}</Tag>,
                    },
                ]}
            />
        </WizardCard>
    );
};
