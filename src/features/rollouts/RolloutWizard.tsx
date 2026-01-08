import React, { useState, useMemo, useEffect } from 'react';
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
    Modal,
    theme,
} from 'antd';

import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useApprovalPolicyStore } from '@/stores/useApprovalPolicyStore';

dayjs.extend(isBetween);
import { useCreate, useStart, getRollouts } from '@/api/generated/rollouts/rollouts';
import { useGetDistributionSets, useGetAssignedSoftwareModules } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';
import { useGetArtifacts } from '@/api/generated/software-modules/software-modules';
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useQueryClient } from '@tanstack/react-query';
import styled, { css } from 'styled-components';
import { buildCondition, combineWithAnd, combineWithOr, escapeValue } from '@/utils/fiql';
import { PageHeader, PageLayout } from '@/components/patterns';
import type { MgmtSoftwareModule, MgmtArtifact, MgmtRolloutRestRequestBodyPost } from '@/api/generated/model';



const { Text } = Typography;
const { TextArea } = Input;

const ReleaseNotesArea = styled(TextArea)`
    && {
        min-height: 220px;
        padding: 12px;
        border-radius: var(--ant-border-radius-lg, 12px);
        background: var(--ant-color-fill-alter);
        line-height: 1.5;
        font-family: 'IBM Plex Mono', 'SF Mono', Menlo, Monaco, monospace;
    }
`;

const ReleaseNotesHint = styled(Text)`
    display: block;
    font-size: var(--ant-font-size-sm);
`;

const ReleaseNotesPreview = styled.div`
    white-space: pre-wrap;
    background: var(--ant-color-fill-alter);
    border: 1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06));
    border-radius: var(--ant-border-radius-lg, 12px);
    padding: 12px;
    min-height: 80px;
`;

const WizardLayout = styled(Flex)`
    flex: 1;
    min-height: 0;
`;

const WizardContent = styled(Flex)`
    flex: 1;
    min-height: 0;
`;

const WizardScrollable = styled.div`
    flex: 1;
    min-height: 0;
    overflow: auto;
`;

const WizardShell = styled.div`
    padding: var(--ant-padding-lg, 24px);
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const WizardRow = styled(Row)`
    flex: 1;
    min-height: 0;
`;

const WizardRightCol = styled(Col)`
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const WizardCard = styled(Card) <{ $isModal?: boolean }>`
    ${props => props.$isModal && css`
        box-shadow: none;
        border: none;
        background: transparent;
    `}
`;

const StepsCard = styled(Card)`
    border-radius: var(--ant-border-radius, 12px);

    .ant-card-body {
        padding: var(--ant-padding, 16px) var(--ant-padding-lg, 24px);
    }
`;

const ActionsBar = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--ant-margin-xs, 8px);
    margin-top: var(--ant-margin-xs, 8px);
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
}

interface TargetFilterBuilderState {
    allTargets: boolean;
    targetTypes: string[];
    targetTypeMode: 'any' | 'all';
    tags: string[];
    tagMode: 'any' | 'all';
}

const buildFiqlFromBuilder = (state: TargetFilterBuilderState) => {
    // All targets - use wildcard
    if (state.allTargets) {
        return 'controllerId==*';
    }

    const clauses: string[] = [];

    // Target Types: targettype.name=="name" (우선순위 1순위)
    if (state.targetTypes.length > 0) {
        const typeConditions = state.targetTypes.map(t => buildCondition({ field: 'targettype.name', operator: '==', value: t }));
        if (state.targetTypeMode === 'any') {
            clauses.push(`(${combineWithOr(typeConditions)})`);
        } else {
            clauses.push(combineWithAnd(typeConditions));
        }
    }

    // Tags: tag=="name" (우선순위 2순위)
    if (state.tags.length > 0) {
        const tagConditions = state.tags.map(t => buildCondition({ field: 'tag.name', operator: '==', value: t }));
        if (state.tagMode === 'any') {
            clauses.push(`(${combineWithOr(tagConditions)})`);
        } else {
            clauses.push(combineWithAnd(tagConditions));
        }
    }

    return combineWithAnd(clauses);
};

interface RolloutWizardProps {
    isModal?: boolean;
    onClose?: () => void;
    onSuccess?: (rolloutId: number) => void;
}

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

const ModuleArtifacts: React.FC<{ softwareModuleId: number }> = ({ softwareModuleId }) => {
    const { t } = useTranslation(['common']);
    const { data: artifactsData, isLoading } = useGetArtifacts(softwareModuleId);

    if (isLoading) return <Spin size="small" style={{ marginLeft: 8 }} />;
    const artifacts = artifactsData || [];
    if (artifacts.length === 0) return null;

    return (
        <ul style={{ margin: '4px 0 8px 16px', fontSize: '12px', color: '#666' }}>
            {artifacts.map((art: MgmtArtifact) => (
                <li key={art.hashes?.sha1}>{art.providedFilename} ({Math.round((art.size || 0) / 1024)} {t('common:units.kb')})</li>
            ))}
        </ul>
    );
};

export const RolloutWizard: React.FC<RolloutWizardProps> = ({ isModal, onClose, onSuccess }) => {
    const { t } = useTranslation(['rollouts', 'common']);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { token } = theme.useToken();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<WizardFormData>({
        name: '',
        amountGroups: 1,
        successThreshold: 80,
        errorThreshold: 20,
    });

    const [isCheckingName, setIsCheckingName] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);

    const [dsSearchValue, setDsSearchValue] = useState('');
    const [dsSearchField, setDsSearchField] = useState('name');
    const [dsTypeFilter, setDsTypeFilter] = useState<string | undefined>(undefined);
    const [filterMode] = useState<'builder'>('builder');
    const [builderState, setBuilderState] = useState<TargetFilterBuilderState>({
        allTargets: false,
        targetTypes: [],
        targetTypeMode: 'any',
        tags: [],
        tagMode: 'any',
    });

    useEffect(() => {
        if (filterMode === 'builder') {
            const timer = setTimeout(() => {
                const fiql = buildFiqlFromBuilder(builderState);
                setFormData((prev) => ({ ...prev, targetFilterQuery: fiql }));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [builderState, filterMode]);

    // Auto-refresh targets preview when filter changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.targetFilterQuery || builderState.allTargets) {
                refetchTargets();
            }
        }, 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.targetFilterQuery, builderState.allTargets]);

    // Form instances for each step
    const [basicInfoForm] = Form.useForm();
    const [groupSettingsForm] = Form.useForm();

    const amountGroupsValue = Form.useWatch('amountGroups', groupSettingsForm);

    // Fetch distribution set types for filtering
    const { data: dsTypesData, isLoading: dsTypesLoading } = useGetDistributionSetTypes({ limit: 100 });

    // Fetch distribution sets
    const dsQuery = useMemo(() => {
        const clauses: string[] = [];
        if (dsSearchValue) {
            clauses.push(`${dsSearchField}==*${dsSearchValue}*`);
        }
        if (dsTypeFilter) {
            clauses.push(`type==${dsTypeFilter}`);
        }
        return clauses.join(';');
    }, [dsSearchValue, dsSearchField, dsTypeFilter]);

    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets({
        limit: 50,
        q: dsQuery || undefined,
    });

    // Fetch target metadata for builder
    const { data: targetTagsData, isLoading: targetTagsLoading } = useGetTargetTags({ limit: 200 });
    const { data: targetTypesData, isLoading: targetTypesLoading } = useGetTargetTypes({ limit: 200 });

    // Fetch targets for preview - 전체 목록을 볼 수 있도록 limit 증가
    const { data: targetsData, isLoading: isLoadingTargets, refetch: refetchTargets } = useGetTargets(
        {
            q: formData.targetFilterQuery === 'controllerId==*' ? undefined : formData.targetFilterQuery,
            limit: 100, // 전체 미리보기를 위해 limit 증가
        },
        {
            query: {
                enabled: false, // Only fetch on demand
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



                    // Navigate immediately regardless of startImmediately
                    if (isModal && onSuccess) {
                        onSuccess(rolloutId);
                    } else {
                        navigate(`/rollouts/${rolloutId}`);
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
                setIsCheckingName(true);
                setNameError(null);

                // Use current form value directly for validation
                const existingRollouts = await getRollouts({ q: `name==${escapeValue(values.name)}` });
                if (existingRollouts && existingRollouts.total && existingRollouts.total > 0) {
                    setNameError(t('wizard.basicInfo.nameDuplicate'));
                    setIsCheckingName(false);
                    return;
                }

                setIsCheckingName(false);
                setFormData((prev) => ({ ...prev, ...values }));
                setCurrentStep(currentStep + 1);
            } catch (err) {
                console.error('Validation error', err);
                setIsCheckingName(false);
            }
        } else if (currentStep === 1) {
            if (!formData.distributionSetId) {
                message.warning(t('wizard.distributionSet.selectionRequired'));
                return;
            }
            setCurrentStep(currentStep + 1);
        } else if (currentStep === 2) {
            // Ensure targetFilterQuery is up to date if using builder
            if (filterMode === 'builder') {
                const fiql = buildFiqlFromBuilder(builderState);
                setFormData(prev => ({ ...prev, targetFilterQuery: fiql }));
            }
            setCurrentStep(currentStep + 1);
        } else if (currentStep === 3) {
            try {
                const values = await groupSettingsForm.validateFields();
                setFormData((prev) => ({ ...prev, ...values }));
                setCurrentStep(currentStep + 1);
            } catch (err) {
                console.error('Validation error', err);
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

        // Approval Policy Check
        const { rules } = useApprovalPolicyStore.getState();
        const activeRules = rules.filter(r => r.enabled);
        const matchingRules: string[] = [];

        for (const rule of activeRules) {
            if (rule.type === 'target_count') {
                const threshold = rule.condition.threshold;
                if ((targetsData?.total || 0) > threshold) {
                    matchingRules.push(t('approvalPolicy.rules.count.title', { count: threshold }));
                }
            } else if (rule.type === 'tag') {
                const tag = rule.condition.tag;
                if (builderState.tags.includes(tag)) {
                    matchingRules.push(t('approvalPolicy.rules.tag.title', { tag }));
                }
            } else if (rule.type === 'target_type') {
                const targetType = rule.condition.targetType;
                if (builderState.targetTypes.includes(targetType)) {
                    matchingRules.push(t('approvalPolicy.rules.type.title', { type: targetType }));
                }
            } else if (rule.type === 'time_range') {
                const now = dayjs();
                const startStr = rule.condition.start;
                const endStr = rule.condition.end;
                const [startH, startM] = startStr.split(':').map(Number);
                const [endH, endM] = endStr.split(':').map(Number);
                const start = dayjs().hour(startH).minute(startM);
                const end = dayjs().hour(endH).minute(endM);

                let isInside = false;
                if (start.isAfter(end)) {
                    isInside = now.isAfter(start) || now.isBefore(end);
                } else {
                    isInside = now.isBetween(start, end);
                }

                if (isInside) {
                    matchingRules.push(t('approvalPolicy.rules.time.title', { start: startStr, end: endStr }));
                }
            }
        }

        const executeCreate = () => {
            const finalQuery = builderState.allTargets && !formData.targetFilterQuery?.trim()
                ? 'controllerId==*'
                : formData.targetFilterQuery?.trim();

            const payload: MgmtRolloutRestRequestBodyPost = {
                name: formData.name,
                description: formData.description || '',
                distributionSetId: formData.distributionSetId,
                amountGroups: formData.amountGroups,
                successCondition: {
                    condition: 'THRESHOLD',
                    expression: formData.successThreshold.toString(),
                },
                errorCondition: {
                    condition: 'THRESHOLD',
                    expression: formData.errorThreshold.toString(),
                },
            };

            if (finalQuery && finalQuery.trim() !== '') {
                payload.targetFilterQuery = finalQuery;
            }

            createMutation.mutate({ data: payload });
        };

        if (matchingRules.length > 0) {
            Modal.confirm({
                title: t('approvalPolicy.confirmTitle'),
                content: (
                    <Flex vertical gap={12}>
                        <Text>{t('approvalPolicy.matchingRulesDesc')}</Text>
                        <ul>
                            {matchingRules.map((r, i) => <li key={i}><Text strong>{r}</Text></li>)}
                        </ul>
                        <Text type="secondary">{t('approvalPolicy.proceedConfirm')}</Text>
                    </Flex>
                ),
                okText: t('common:confirm'),
                cancelText: t('common:cancel'),
                onOk: executeCreate,
            });
        } else {
            executeCreate();
        }
    };

    const renderBasicInfoStep = () => (
        <WizardCard title={t('wizard.basicInfo.title')} $isModal={isModal}>
            <Form
                form={basicInfoForm}
                layout="vertical"
                initialValues={{ name: formData.name, description: formData.description }}
            >
                <Form.Item
                    name="name"
                    label={t('wizard.basicInfo.name')}
                    rules={[{ required: true, message: t('wizard.basicInfo.nameRequired') }]}
                    validateStatus={nameError ? 'error' : undefined}
                    help={nameError}
                >
                    <Input
                        placeholder={t('wizard.basicInfo.namePlaceholder')}
                        onChange={() => setNameError(null)}
                    />
                </Form.Item>
                <Form.Item
                    name="description"
                    label={t('wizard.basicInfo.description')}
                    extra={<ReleaseNotesHint type="secondary">{t('wizard.basicInfo.releaseNotesHint')}</ReleaseNotesHint>}
                >
                    <ReleaseNotesArea
                        placeholder={t('wizard.basicInfo.descriptionPlaceholder')}
                        autoSize={{ minRows: 10, maxRows: 20 }}
                    />
                </Form.Item>
            </Form>
            {isCheckingName && <Spin size="small" tip={t('wizard.basicInfo.checkingName')} />}
        </WizardCard>
    );


    const renderDistributionSetStep = () => (
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
                                onSearch={(val) => setDsSearchValue(val)}
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
                                value: type.name
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
                        setFormData((prev) => ({
                            ...prev,
                            distributionSetId: row.id,
                            distributionSetName: `${row.name} (${row.version})`,
                        }));
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

    const renderTargetFilterStep = () => {

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
                                onChange={(e) => setBuilderState(prev => ({ ...prev, allTargets: e.target.checked }))}
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
                                            onChange={(val) => setBuilderState(prev => ({ ...prev, targetTypes: val }))}
                                            options={(targetTypesData?.content || []).map(type => ({
                                                label: (
                                                    <Space>
                                                        {type.colour && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: type.colour }} />}
                                                        {type.name}
                                                    </Space>
                                                ),
                                                value: type.name
                                            }))}
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

    const renderGroupSettingsStep = (amountGroupsFromWatch: number) => {
        const amountGroups = amountGroupsFromWatch || formData.amountGroups;
        const totalTargets = targetsData?.total || 0;

        const groupSize = Math.floor(totalTargets / amountGroups);
        const remainder = totalTargets % amountGroups;

        return (
            <WizardCard
                title={t('wizard.groupSettings.title')}
                $isModal={isModal}
            >
                <Form
                    form={groupSettingsForm}
                    layout="vertical"
                    initialValues={{
                        amountGroups: formData.amountGroups,
                        successThreshold: formData.successThreshold,
                        errorThreshold: formData.errorThreshold,
                    }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="amountGroups" label={t('wizard.groupSettings.amountGroups')} rules={[{ required: true }]}>
                                <InputNumber min={1} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginTop: 30 }}>
                                <Text type="secondary">
                                    {t('wizard.groupSettings.preview', {
                                        count: amountGroups,
                                        size: groupSize,
                                    })}
                                </Text>
                            </div>
                        </Col>
                    </Row>

                    <Alert
                        message={t('wizard.groupSettings.distributionHint', {
                            count: amountGroups,
                            exact: amountGroups - remainder,
                            size: groupSize,
                            extraCount: remainder,
                            extraSize: groupSize + (remainder > 0 ? 1 : 0),
                        })}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item name="successThreshold" label={t('wizard.groupSettings.successThreshold')} rules={[{ required: true }]}>
                        <InputNumber<number> min={0} max={100} formatter={value => `${value}%`} parser={value => value?.replace('%', '') as unknown as number} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="errorThreshold" label={t('wizard.groupSettings.errorThreshold')} rules={[{ required: true }]}>
                        <InputNumber<number> min={0} max={100} formatter={value => `${value}%`} parser={value => value?.replace('%', '') as unknown as number} style={{ width: '100%' }} />
                    </Form.Item>

                </Form>
            </WizardCard>
        );
    };

    const renderReviewStep = () => (
        <WizardCard title={t('wizard.review.title')} $isModal={isModal}>
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={t('wizard.review.name')}>{formData.name}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.description')}>
                    <ReleaseNotesPreview>{formData.description || '-'}</ReleaseNotesPreview>
                </Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.distributionSet')}>{formData.distributionSetName}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.targetFilter')}>
                    {formData.targetFilterQuery ? (
                        <code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px' }}>
                            {formData.targetFilterQuery}
                        </code>
                    ) : (
                        <Tag color="green">{t('wizard.review.allTargets')}</Tag>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.groups')}>{formData.amountGroups}</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.successThreshold')}>{formData.successThreshold}%</Descriptions.Item>
                <Descriptions.Item label={t('wizard.review.errorThreshold')}>{formData.errorThreshold}%</Descriptions.Item>
            </Descriptions>

            {/* Target Preview List */}
            <div style={{ marginTop: 16 }}>
                <Text strong style={{ marginBottom: 8, display: 'block' }}>
                    {t('wizard.targetFilter.preview')} ({targetsData?.total || 0})
                </Text>
                <Table
                    dataSource={targetsData?.content || []}
                    columns={[
                        { title: t('wizard.targetFilter.previewColumns.name'), dataIndex: 'name', key: 'name' },
                        { title: t('wizard.targetFilter.previewColumns.ipAddress'), dataIndex: 'ipAddress', key: 'ipAddress', render: (ip: string) => ip || '-' },
                        { title: t('wizard.targetFilter.previewColumns.type'), dataIndex: 'targetTypeName', key: 'type', render: (type: string) => type || '-' },
                    ]}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 300 }}
                    loading={isLoadingTargets}
                />
            </div>
        </WizardCard>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return renderBasicInfoStep();
            case 1: return renderDistributionSetStep();
            case 2: return renderTargetFilterStep();
            case 3: return renderGroupSettingsStep(amountGroupsValue);
            case 4: return renderReviewStep();
            default: return null;
        }
    };

    const mainContent = (
        <WizardLayout vertical gap={token.marginLG}>
            <StepsCard className="steps-card">
                <Steps
                    current={currentStep}
                    items={steps}
                    direction={isModal ? 'horizontal' : 'vertical'}
                    size="small"
                    responsive={false}
                />
            </StepsCard>

            <WizardContent vertical gap={token.marginLG}>
                <WizardScrollable>
                    {renderStepContent()}
                </WizardScrollable>
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
                            <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                        ) : (
                            <Button onClick={() => navigate('/rollouts')}>{t('common:actions.cancel')}</Button>
                        )}
                    </Space>
                </ActionsBar>
            </WizardContent>
        </WizardLayout>
    );

    if (isModal) {
        return (
            <WizardShell>
                {mainContent}
            </WizardShell>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title={t('wizard.title')}
                backLabel={t('detail.back')}
                onBack={() => navigate('/rollouts')}
            />
            <WizardRow gutter={[token.marginLG, token.marginLG]}>
                <Col xs={24} md={6}>
                    <StepsCard>
                        <Steps
                            current={currentStep}
                            items={steps}
                            direction="vertical"
                            size="small"
                        />
                    </StepsCard>
                </Col>
                <WizardRightCol xs={24} md={18}>
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
                            <Button onClick={() => navigate('/rollouts')}>{t('common:actions.cancel')}</Button>
                        </Space>
                    </ActionsBar>
                </WizardRightCol>
            </WizardRow>


        </PageLayout>
    );
};

export default RolloutWizard;
