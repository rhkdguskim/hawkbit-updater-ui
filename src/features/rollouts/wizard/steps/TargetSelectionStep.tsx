import { Alert, Checkbox, Col, Flex, Form, Radio, Row, Select, Space, Spin, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { PagedListMgmtTarget, PagedListMgmtTargetType, PagedListMgmtTag } from '@/api/generated/model';
import type { TargetFilterBuilderState } from '../utils/buildTargetFilter';
import { WizardCard } from '../components/WizardLayout';

const { Text } = Typography;

type TargetSelectionStepProps = {
    builderState: TargetFilterBuilderState;
    setBuilderState: React.Dispatch<React.SetStateAction<TargetFilterBuilderState>>;
    targetTypesData?: PagedListMgmtTargetType;
    targetTagsData?: PagedListMgmtTag;
    targetTypesLoading: boolean;
    targetTagsLoading: boolean;
    targetsData?: PagedListMgmtTarget;
    isLoadingTargets: boolean;
    isModal?: boolean;
};

export const TargetSelectionStep = ({
    builderState,
    setBuilderState,
    targetTypesData,
    targetTagsData,
    targetTypesLoading,
    targetTagsLoading,
    targetsData,
    isLoadingTargets,
    isModal,
}: TargetSelectionStepProps) => {
    const { t } = useTranslation(['rollouts', 'common']);

    const previewColumns = [
        { title: t('wizard.targetFilter.previewColumns.name'), dataIndex: 'name' },
        { title: t('wizard.targetFilter.previewColumns.ipAddress'), dataIndex: 'ipAddress', render: (ip: string) => ip || '-' },
        { title: t('wizard.targetFilter.previewColumns.type'), dataIndex: 'targetTypeName', render: (type: string) => type || '-' },
    ];

    return (
        <WizardCard title={t('wizard.targetFilter.title')} $isModal={isModal}>
            <div style={{ marginBottom: 24 }}>
                <Alert
                    message={t('wizard.targetFilter.builderHint')}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Form layout="vertical">
                    <Form.Item>
                        <Checkbox
                            checked={builderState.allTargets}
                            onChange={(event) => setBuilderState(prev => ({ ...prev, allTargets: event.target.checked }))}
                        >
                            <Text strong>{t('wizard.targetFilter.allTargets')}</Text>
                        </Checkbox>
                    </Form.Item>

                    {!builderState.allTargets && (
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item label={t('wizard.targetFilter.targetTypes')}>
                                    <Select
                                        mode="multiple"
                                        placeholder={t('wizard.targetFilter.selectTypes')}
                                        value={builderState.targetTypes}
                                        loading={targetTypesLoading}
                                        onChange={(value) => setBuilderState(prev => ({ ...prev, targetTypes: value }))}
                                        options={(targetTypesData?.content || []).map(type => ({
                                            label: (
                                                <Space>
                                                    {type.colour && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                backgroundColor: type.colour,
                                                            }}
                                                        />
                                                    )}
                                                    {type.name}
                                                </Space>
                                            ),
                                            value: type.name,
                                        }))}
                                    />
                                    {builderState.targetTypes.length > 1 && (
                                        <Radio.Group
                                            value={builderState.targetTypeMode}
                                            onChange={(event) => setBuilderState(prev => ({ ...prev, targetTypeMode: event.target.value }))}
                                            size="small"
                                            style={{ marginTop: 8 }}
                                        >
                                            <Radio value="anyOf">{t('wizard.targetFilter.anyType')}</Radio>
                                            <Radio value="allOf">{t('wizard.targetFilter.allType')}</Radio>
                                        </Radio.Group>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('wizard.targetFilter.tags')}>
                                    <Select
                                        mode="multiple"
                                        placeholder={t('wizard.targetFilter.selectTags')}
                                        value={builderState.tags}
                                        loading={targetTagsLoading}
                                        onChange={(value) => setBuilderState(prev => ({ ...prev, tags: value }))}
                                        options={(targetTagsData?.content || []).map(tag => ({
                                            label: (
                                                <Space>
                                                    {tag.colour && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                backgroundColor: tag.colour,
                                                            }}
                                                        />
                                                    )}
                                                    {tag.name}
                                                </Space>
                                            ),
                                            value: tag.name,
                                        }))}
                                    />
                                    {builderState.tags.length > 1 && (
                                        <Radio.Group
                                            value={builderState.tagMode}
                                            onChange={(event) => setBuilderState(prev => ({ ...prev, tagMode: event.target.value }))}
                                            size="small"
                                            style={{ marginTop: 8 }}
                                        >
                                            <Radio value="anyOf">{t('wizard.targetFilter.anyTag')}</Radio>
                                            <Radio value="allOf">{t('wizard.targetFilter.allTag')}</Radio>
                                        </Radio.Group>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Form>
            </div>

            <div style={{ borderTop: '1px solid var(--ant-color-border-secondary, #f0f0f0)', paddingTop: 16 }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <Text strong>{t('wizard.targetFilter.preview')}</Text>
                    {isLoadingTargets && <Spin size="small" />}
                </Flex>
                <div style={{ marginBottom: 24 }}>
                    <Text strong>{t('wizard.targetFilter.targetCount', { count: targetsData?.total || 0 })}</Text>
                    <Table
                        dataSource={targetsData?.content || []}
                        columns={previewColumns}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        loading={isLoadingTargets}
                        scroll={{ y: 300 }}
                        style={{ marginTop: 8 }}
                        footer={() => (
                            <div style={{ textAlign: 'right', fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                                {t('pagination.total', { count: targetsData?.total || 0 })}
                            </div>
                        )}
                    />
                </div>
            </div>
        </WizardCard>
    );
};
