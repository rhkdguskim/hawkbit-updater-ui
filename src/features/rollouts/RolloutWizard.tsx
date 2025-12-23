import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Steps,
    Form,
    Input,
    InputNumber,
    Button,
    Space,
    Typography,
    Table,
    Tag,
    Descriptions,
    message,
    Spin,
    Alert,
    Checkbox,
    Select,
    Radio,
    Row,
    Col,
    Flex,
} from 'antd';
import { ArrowLeftOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useCreate, useStart, getRollout } from '@/api/generated/rollouts/rollouts';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import type { MgmtDistributionSet } from '@/api/generated/model';
import { useQueryClient } from '@tanstack/react-query';
import type { RadioChangeEvent } from 'antd/es/radio';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
`;

const TitleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const StepsCard = styled(Card)`
    border-radius: 14px;
`;

const ActionsBar = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
`;

interface WizardFormData {
    name: string;
    description?: string;
    distributionSetId?: number;
    distributionSetName?: string;
    targetFilterQuery?: string;
    amountGroups: number;
    successThreshold: number;
    errorThreshold: number;
    startImmediately: boolean;
}

interface TargetFilterBuilderState {
    allTargets: boolean;
    tags: string[];
    tagMode: 'any' | 'all';
    targetTypes: string[];
    targetTypeMode: 'any' | 'all';
    updateStatuses: string[];
    pollingStatuses: Array<'online' | 'offline'>;
    controllerQuery: string;
    searchKeyword: string;
}

const buildFiqlFromBuilder = (state: TargetFilterBuilderState) => {
    // All targets - use wildcard
    if (state.allTargets) {
        return 'controllerId==*';
    }

    const clauses: string[] = [];

    // Tags: tag=="name"
    if (state.tags.length > 0) {
        const escapeQuote = (s: string) => s.replace(/"/g, '\\"');
        const formattedTags = state.tags.map(t => `tag=="${escapeQuote(t)}"`);

        if (state.tags.length === 1) {
            clauses.push(formattedTags[0]);
        } else {
            const operator = state.tagMode === 'any' ? ',' : ';';
            clauses.push(`(${formattedTags.join(operator)})`);
        }
    }

    // Target Types: targettype.name=="name"
    if (state.targetTypes.length > 0) {
        const escapeQuote = (s: string) => s.replace(/"/g, '\\"');
        const formattedTypes = state.targetTypes.map(t => `targettype.name=="${escapeQuote(t)}"`);

        if (state.targetTypes.length === 1) {
            clauses.push(formattedTypes[0]);
        } else {
            const operator = state.targetTypeMode === 'any' ? ',' : ';';
            clauses.push(`(${formattedTypes.join(operator)})`);
        }
    }

    // Update Status: updateStatus=="in_sync"
    if (state.updateStatuses.length > 0) {
        if (state.updateStatuses.length === 1) {
            clauses.push(`updateStatus=="${state.updateStatuses[0]}"`);
        } else {
            const joined = state.updateStatuses.map(s => `updateStatus=="${s}"`).join(',');
            clauses.push(`(${joined})`);
        }
    }

    // Polling Status (Online/Offline): pollStatus.overdue==true/false
    if (state.pollingStatuses.length === 1) {
        const isOnline = state.pollingStatuses[0] === 'online';
        clauses.push(`pollStatus.overdue==${!isOnline}`);
    }

    if (state.controllerQuery.trim()) {
        clauses.push(`controllerId==*${state.controllerQuery.trim()}*`);
    }
    if (state.searchKeyword.trim()) {
        clauses.push(`name==*${state.searchKeyword.trim()}*`);
    }

    return clauses.join(';');
};

interface RolloutWizardProps {
    isModal?: boolean;
    onClose?: () => void;
    onSuccess?: (rolloutId: number) => void;
}

const RolloutWizard: React.FC<RolloutWizardProps> = ({ isModal, onClose, onSuccess }) => {
    const { t } = useTranslation('rollouts');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<WizardFormData>({
        name: '',
        description: '',
        distributionSetId: undefined,
        distributionSetName: '',
        targetFilterQuery: '',
        amountGroups: 5,
        successThreshold: 80,
        errorThreshold: 20,
        startImmediately: false,
    });

    const [filterMode, setFilterMode] = useState<'builder' | 'advanced'>('builder');
    const [builderState, setBuilderState] = useState<TargetFilterBuilderState>({
        allTargets: false,
        tags: [],
        tagMode: 'any',
        targetTypes: [],
        targetTypeMode: 'any',
        updateStatuses: [],
        pollingStatuses: [],
        controllerQuery: '',
        searchKeyword: '',
    });

    React.useEffect(() => {
        if (filterMode === 'builder') {
            const timer = setTimeout(() => {
                const fiql = buildFiqlFromBuilder(builderState);
                setFormData((prev) => ({ ...prev, targetFilterQuery: fiql }));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [builderState, filterMode]);

    // Form instances for each step
    const [basicInfoForm] = Form.useForm();
    const [groupSettingsForm] = Form.useForm();

    // Fetch distribution sets
    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets({
        limit: 100,
        q: 'type==os;type==software',
    });

    // Fetch target metadata for builder
    const { data: targetTagsData, isLoading: targetTagsLoading } = useGetTargetTags({ limit: 200 });
    const { data: targetTypesData, isLoading: targetTypesLoading } = useGetTargetTypes({ limit: 200 });

    // Fetch targets for preview
    const { data: targetPreviewData, refetch: refetchTargets, isLoading: previewLoading } = useGetTargets(
        {
            q: formData.targetFilterQuery === 'controllerId==*' ? undefined : formData.targetFilterQuery,
            limit: 5,
        },
        {
            query: {
                enabled: false,
            },
        }
    );

    // Create mutation
    const createMutation = useCreate({
        mutation: {
            onSuccess: async (data) => {
                message.success(t('wizard.messages.createSuccess'));
                queryClient.invalidateQueries();

                if (data.id) {
                    const rolloutId = data.id;

                    if (formData.startImmediately) {
                        let attempts = 0;
                        const maxAttempts = 15;

                        const pollAndStart = async () => {
                            try {
                                const rollout = await getRollout(rolloutId);
                                const status = rollout.status?.toLowerCase();

                                if (status === 'ready') {
                                    startMutation.mutate({ rolloutId });
                                } else if (status === 'creating' && attempts < maxAttempts) {
                                    attempts++;
                                    setTimeout(pollAndStart, 1000);
                                } else if (status === 'running') {
                                    message.success(t('detail.messages.startSuccess'));
                                    if (isModal && onSuccess) {
                                        onSuccess(rolloutId);
                                    } else {
                                        navigate(`/rollouts/${rolloutId}`);
                                    }
                                } else {
                                    message.warning(t('wizard.messages.cannotStartImmediately', 'Rollout created but cannot start immediately. Please start manually.'));
                                    if (isModal && onSuccess) {
                                        onSuccess(rolloutId);
                                    } else {
                                        navigate(`/rollouts/${rolloutId}`);
                                    }
                                }
                            } catch {
                                if (isModal && onSuccess) {
                                    onSuccess(rolloutId);
                                } else {
                                    navigate(`/rollouts/${rolloutId}`);
                                }
                            }
                        };

                        setTimeout(pollAndStart, 500);
                    } else {
                        if (isModal && onSuccess) {
                            onSuccess(rolloutId);
                        } else {
                            navigate(`/rollouts/${rolloutId}`);
                        }
                    }
                }
            },
            onError: (err: unknown) => {
                console.error('Rollout creation error:', err);
                const error = err as { response?: { data?: { message?: string; exceptionClass?: string }; status?: number }; message?: string };
                const errorMessage = error.response?.data?.message
                    || error.response?.data?.exceptionClass
                    || error.message
                    || t('wizard.messages.createError');
                message.error(errorMessage);
            },
        },
    });

    const startMutation = useStart({
        mutation: {
            onSuccess: () => {
                message.success(t('detail.messages.startSuccess'));
            },
            onError: () => {
                message.error(t('detail.messages.startError'));
            },
        },
    });

    const steps = [
        { title: t('wizard.steps.basicInfo') },
        { title: t('wizard.steps.distributionSet') },
        { title: t('wizard.steps.targetFilter') },
        { title: t('wizard.steps.groupSettings') },
        { title: t('wizard.steps.review') },
    ];

    const handleNext = async () => {
        if (currentStep === 0) {
            try {
                const values = await basicInfoForm.validateFields();
                setFormData((prev) => ({ ...prev, ...values }));
                setCurrentStep(currentStep + 1);
            } catch {
            }
        } else if (currentStep === 1) {
            if (!formData.distributionSetId) {
                message.warning(t('wizard.distributionSet.selectRequired'));
                return;
            }
            setCurrentStep(currentStep + 1);
        } else if (currentStep === 2) {
            if (!builderState.allTargets && !formData.targetFilterQuery?.trim()) {
                message.warning(t('wizard.targetFilter.required'));
                return;
            }
            if (builderState.allTargets && !formData.targetFilterQuery?.trim()) {
                setFormData((prev) => ({ ...prev, targetFilterQuery: 'controllerId==*' }));
            }
            setCurrentStep(currentStep + 1);
        } else if (currentStep === 3) {
            try {
                const values = await groupSettingsForm.validateFields();
                setFormData((prev) => ({ ...prev, ...values }));
                setCurrentStep(currentStep + 1);
            } catch {
            }
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCreate = () => {
        if (!builderState.allTargets && !formData.targetFilterQuery?.trim()) {
            message.warning(t('wizard.targetFilter.required'));
            setCurrentStep(2);
            return;
        }

        const finalQuery = builderState.allTargets && !formData.targetFilterQuery?.trim()
            ? 'controllerId==*'
            : formData.targetFilterQuery?.trim();

        createMutation.mutate({
            data: {
                name: formData.name,
                description: formData.description || undefined,
                distributionSetId: formData.distributionSetId,
                targetFilterQuery: finalQuery,
                amountGroups: formData.amountGroups,
                successCondition: {
                    condition: 'THRESHOLD',
                    expression: String(formData.successThreshold),
                },
                errorCondition: {
                    condition: 'THRESHOLD',
                    expression: String(formData.errorThreshold),
                },
            },
        });
    };

    const handleSelectDS = (ds: MgmtDistributionSet) => {
        setFormData((prev) => ({
            ...prev,
            distributionSetId: ds.id,
            distributionSetName: `${ds.name} (v${ds.version})`,
        }));
    };

    const renderBasicInfoStep = () => (
        <Card title={t('wizard.basicInfo.title')} style={isModal ? { boxShadow: 'none', border: 'none', background: 'transparent' } : undefined}>
            <Form
                form={basicInfoForm}
                layout="vertical"
                initialValues={{ name: formData.name, description: formData.description }}
            >
                <Form.Item
                    name="name"
                    label={t('wizard.basicInfo.name')}
                    rules={[{ required: true, message: t('wizard.basicInfo.nameRequired') }]}
                >
                    <Input placeholder={t('wizard.basicInfo.namePlaceholder')} />
                </Form.Item>
                <Form.Item name="description" label={t('wizard.basicInfo.description')}>
                    <TextArea rows={4} placeholder={t('wizard.basicInfo.descriptionPlaceholder')} />
                </Form.Item>
            </Form>
        </Card>
    );

    const renderDistributionSetStep = () => (
        <Card title={t('wizard.distributionSet.title')} style={isModal ? { boxShadow: 'none', border: 'none', background: 'transparent' } : undefined}>
            {formData.distributionSetId && (
                <Alert
                    type="success"
                    message={`${t('wizard.distributionSet.selected')}: ${formData.distributionSetName}`}
                    style={{ marginBottom: 16 }}
                />
            )}
            {dsLoading ? (
                <Spin />
            ) : (
                <Table
                    dataSource={dsData?.content || []}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 5 }}
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: formData.distributionSetId ? [formData.distributionSetId] : [],
                        onChange: (_, selectedRows) => {
                            if (selectedRows[0]) {
                                handleSelectDS(selectedRows[0]);
                            }
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
            )}
        </Card>
    );

    const renderTargetFilterStep = () => {
        const previewTargets = targetPreviewData?.content || [];
        const isEffectiveFilter = formData.targetFilterQuery && formData.targetFilterQuery !== 'controllerId==*';

        return (
            <Card title={t('wizard.targetFilter.title')} style={isModal ? { boxShadow: 'none', border: 'none', background: 'transparent' } : undefined}>
                <Space style={{ marginBottom: 16 }} wrap>
                    <Button
                        type={filterMode === 'builder' ? 'primary' : 'default'}
                        onClick={() => setFilterMode('builder')}
                    >
                        {t('wizard.targetFilter.builderMode')}
                    </Button>
                    <Button
                        type={filterMode === 'advanced' ? 'primary' : 'default'}
                        onClick={() => setFilterMode('advanced')}
                    >
                        {t('wizard.targetFilter.advancedMode')}
                    </Button>
                </Space>

                {filterMode === 'builder' ? (
                    <div style={{ marginBottom: 24 }}>
                        <Form layout="vertical">
                            <Form.Item>
                                <Checkbox
                                    checked={builderState.allTargets}
                                    onChange={(e) => setBuilderState(prev => ({ ...prev, allTargets: e.target.checked }))}
                                >
                                    <Text strong>{t('wizard.targetFilter.allTargets')}</Text>
                                </Checkbox>
                            </Form.Item>

                            {!builderState.allTargets && (
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Form.Item label={t('wizard.targetFilter.tags')}>
                                            <Select
                                                mode="multiple"
                                                placeholder={t('wizard.targetFilter.selectTags')}
                                                value={builderState.tags}
                                                loading={targetTagsLoading}
                                                onChange={(val) => setBuilderState(prev => ({ ...prev, tags: val }))}
                                                options={(targetTagsData?.content || []).map(tag => ({
                                                    label: (
                                                        <Space>
                                                            {tag.colour && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: tag.colour }} />}
                                                            {tag.name}
                                                        </Space>
                                                    ),
                                                    value: tag.name
                                                }))}
                                            />
                                            {builderState.tags.length > 1 && (
                                                <Radio.Group
                                                    value={builderState.tagMode}
                                                    onChange={(e) => setBuilderState(prev => ({ ...prev, tagMode: e.target.value }))}
                                                    size="small"
                                                    style={{ marginTop: 8 }}
                                                >
                                                    <Radio value="any">{t('wizard.targetFilter.anyTag')}</Radio>
                                                    <Radio value="all">{t('wizard.targetFilter.allTag')}</Radio>
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('wizard.targetFilter.targetTypes')}>
                                            <Select
                                                mode="multiple"
                                                placeholder={t('wizard.targetFilter.selectTypes')}
                                                value={builderState.targetTypes}
                                                loading={targetTypesLoading}
                                                onChange={(val) => setBuilderState(prev => ({ ...prev, targetTypes: val }))}
                                                options={(targetTypesData?.content || []).map(type => ({ label: type.name, value: type.name }))}
                                            />
                                            {builderState.targetTypes.length > 1 && (
                                                <Radio.Group
                                                    value={builderState.targetTypeMode}
                                                    onChange={(e) => setBuilderState(prev => ({ ...prev, targetTypeMode: e.target.value }))}
                                                    size="small"
                                                    style={{ marginTop: 8 }}
                                                >
                                                    <Radio value="any">{t('wizard.targetFilter.anyType')}</Radio>
                                                    <Radio value="all">{t('wizard.targetFilter.allType')}</Radio>
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('wizard.targetFilter.pollingStatus')}>
                                            <Checkbox.Group
                                                value={builderState.pollingStatuses}
                                                onChange={(val) => setBuilderState(prev => ({ ...prev, pollingStatuses: val as any[] }))}
                                            >
                                                <Space>
                                                    <Checkbox value="online">{t('wizard.targetFilter.statusOnline')}</Checkbox>
                                                    <Checkbox value="offline">{t('wizard.targetFilter.statusOffline')}</Checkbox>
                                                </Space>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('wizard.targetFilter.updateStatus')}>
                                            <Select
                                                mode="multiple"
                                                placeholder={t('wizard.targetFilter.updateStatusPlaceholder')}
                                                value={builderState.updateStatuses}
                                                onChange={(val) => setBuilderState(prev => ({ ...prev, updateStatuses: val }))}
                                                options={[
                                                    { label: t('wizard.targetFilter.updateStatusInSync'), value: 'in_sync' },
                                                    { label: t('wizard.targetFilter.updateStatusPending'), value: 'pending' },
                                                    { label: t('wizard.targetFilter.updateStatusError'), value: 'error' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('wizard.targetFilter.controllerId')}>
                                            <Input
                                                placeholder={t('wizard.targetFilter.controllerPlaceholder')}
                                                value={builderState.controllerQuery}
                                                onChange={(e) => setBuilderState(prev => ({ ...prev, controllerQuery: e.target.value }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('wizard.targetFilter.nameKeyword')}>
                                            <Input
                                                placeholder={t('wizard.targetFilter.namePlaceholder')}
                                                value={builderState.searchKeyword}
                                                onChange={(e) => setBuilderState(prev => ({ ...prev, searchKeyword: e.target.value }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}
                        </Form>
                    </div>
                ) : (
                    <Form layout="vertical">
                        <Form.Item label={t('wizard.targetFilter.filterQuery')}>
                            <TextArea
                                rows={4}
                                value={formData.targetFilterQuery}
                                onChange={(e) => setFormData(prev => ({ ...prev, targetFilterQuery: e.target.value }))}
                                placeholder={t('wizard.targetFilter.filterPlaceholder')}
                            />
                        </Form.Item>
                    </Form>
                )}

                <div style={{ borderTop: '1px solid var(--ant-color-border-secondary, #f0f0f0)', paddingTop: 16 }}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                        <Text strong>{t('wizard.targetFilter.preview')}</Text>
                        <Button size="small" icon={<ReloadOutlined />} onClick={() => refetchTargets()} loading={previewLoading}>
                            {t('common:refresh')}
                        </Button>
                    </Flex>
                    {previewTargets.length > 0 && (
                        <Table
                            size="small"
                            rowKey="controllerId"
                            pagination={false}
                            dataSource={previewTargets}
                            columns={[
                                { title: t('wizard.targetFilter.previewColumns.controllerId'), dataIndex: 'controllerId' },
                                { title: t('wizard.targetFilter.previewColumns.name'), dataIndex: 'name' },
                                { title: t('wizard.targetFilter.previewColumns.type'), dataIndex: 'targetTypeName' },
                            ]}
                        />
                    )}
                </div>
            </Card>
        );
    };

    const renderGroupSettingsStep = () => (
        <Card title={t('wizard.groupSettings.title')} style={isModal ? { boxShadow: 'none', border: 'none', background: 'transparent' } : undefined}>
            <Form
                form={groupSettingsForm}
                layout="vertical"
                initialValues={{
                    amountGroups: formData.amountGroups,
                    successThreshold: formData.successThreshold,
                    errorThreshold: formData.errorThreshold,
                    startImmediately: formData.startImmediately,
                }}
            >
                <Form.Item name="amountGroups" label={t('wizard.groupSettings.amountGroups')} rules={[{ required: true }]}>
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="successThreshold" label={t('wizard.groupSettings.successThreshold')} rules={[{ required: true }]}>
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="errorThreshold" label={t('wizard.groupSettings.errorThreshold')} rules={[{ required: true }]}>
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="startImmediately" valuePropName="checked">
                    <Checkbox>{t('wizard.groupSettings.startImmediately')}</Checkbox>
                </Form.Item>
            </Form>
        </Card>
    );

    const renderReviewStep = () => (
        <Card title={t('wizard.review.title')} style={isModal ? { boxShadow: 'none', border: 'none', background: 'transparent' } : undefined}>
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={t('wizard.review.name')}>{formData.name}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.description')}>{formData.description || '-'}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.distributionSet')}>{formData.distributionSetName}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.targetFilter')}>{formData.targetFilterQuery || t('wizard.review.allTargets')}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.groups')}>{formData.amountGroups}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.successThreshold')}>{formData.successThreshold}%</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.errorThreshold')}>{formData.errorThreshold}%</Descriptions.Item>
            </Descriptions>
        </Card>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return renderBasicInfoStep();
            case 1: return renderDistributionSetStep();
            case 2: return renderTargetFilterStep();
            case 3: return renderGroupSettingsStep();
            case 4: return renderReviewStep();
            default: return null;
        }
    };

    const mainContent = (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={7} lg={6}>
                <StepsCard style={isModal ? { boxShadow: 'none', border: 'none', background: 'transparent' } : undefined}>
                    <Steps current={currentStep} items={steps} direction="vertical" size="small" />
                </StepsCard>
            </Col>
            <Col xs={24} md={17} lg={18}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {renderStepContent()}
                    <ActionsBar>
                        <Space>
                            {currentStep > 0 && <Button onClick={handlePrev}>{t('wizard.buttons.previous')}</Button>}
                            {currentStep < steps.length - 1 ? (
                                <Button type="primary" onClick={handleNext}>{t('wizard.buttons.next')}</Button>
                            ) : (
                                <Button type="primary" onClick={handleCreate} loading={createMutation.isPending || startMutation.isPending}>
                                    {t('wizard.buttons.create')}
                                </Button>
                            )}
                            {isModal ? (
                                <Button onClick={onClose}>{t('common:cancel')}</Button>
                            ) : (
                                <Button onClick={() => navigate('/rollouts')}>{t('common:cancel')}</Button>
                            )}
                        </Space>
                    </ActionsBar>
                </Space>
            </Col>
        </Row>
    );

    if (isModal) {
        return <div style={{ padding: '24px' }}>{mainContent}</div>;
    }

    return (
        <PageContainer>
            <HeaderRow>
                <TitleGroup>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/rollouts')}>
                        {t('detail.back')}
                    </Button>
                    <Title level={2} style={{ margin: 0 }}>{t('wizard.title')}</Title>
                </TitleGroup>
            </HeaderRow>
            {mainContent}
        </PageContainer>
    );
};

export default RolloutWizard;
