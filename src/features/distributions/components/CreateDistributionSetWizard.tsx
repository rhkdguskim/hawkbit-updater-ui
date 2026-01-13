import React, { useState, useCallback } from 'react';
import {
    Modal,
    Steps,
    Form,
    Input,
    Select,
    Button,
    Space,
    Table,
    message,
    Descriptions,
    Tag,
    List,
    Badge,
    Card,
    Empty,
    Checkbox,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    FileOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CreateModuleWizard from './CreateModuleWizard';
import {
    useCreateDistributionSets,
    useAssignSoftwareModules,
    useCreateMetadata2,
} from '@/api/generated/distribution-sets/distribution-sets';
import {
    useGetSoftwareModules,
    useGetArtifacts,
    getGetSoftwareModulesQueryKey
} from '@/api/generated/software-modules/software-modules';
import {
    useGetDistributionSetTypes,
    useGetMandatoryModules,
    useGetOptionalModules
} from '@/api/generated/distribution-set-types/distribution-set-types';
import { useQueryClient } from '@tanstack/react-query';
import type {
    MgmtDistributionSetRequestBodyPost,
    MgmtMetadata,
    MgmtSoftwareModule,
} from '@/api/generated/model';

const { Text } = Typography;

interface CreateDistributionSetWizardProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

interface MetadataEntry {
    key: string;
    value: string;
}

type CreationPhase = 'idle' | 'creating_set' | 'assigning_modules' | 'adding_metadata' | 'done' | 'error';

const ModuleArtifactList: React.FC<{ moduleId: number }> = ({ moduleId }) => {
    const { data: artifacts, isLoading } = useGetArtifacts(moduleId);

    if (isLoading) return <Badge status="processing" size="small" text="..." />;
    if (!artifacts || artifacts.length === 0) return <span>-</span>;

    return (
        <Space size={[0, 4]} wrap>
            {artifacts.map(art => (
                <Tag key={art.id} icon={<FileOutlined />} style={{ margin: '2px 0', fontSize: '10px' }}>
                    {art.providedFilename}
                </Tag>
            ))}
        </Space>
    );
};

const CreateDistributionSetWizard: React.FC<CreateDistributionSetWizardProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const { t } = useTranslation('distributions');
    const [currentStep, setCurrentStep] = useState(0);
    const [basicInfoForm] = Form.useForm();
    const [metadataForm] = Form.useForm();
    const [newModuleForm] = Form.useForm();
    const queryClient = useQueryClient();

    // DS Types
    const { data: dsTypesData, isLoading: isDsTypesLoading } = useGetDistributionSetTypes({ limit: 100 });

    // Software modules
    const { data: modulesData, isLoading: isModulesLoading } = useGetSoftwareModules(
        { limit: 500 },
        {
            query: {
                staleTime: 0,
                refetchOnMount: 'always',
            }
        }
    );

    // Selected modules
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);

    // Newly created module IDs to highlight
    const [newlyCreatedIds, setNewlyCreatedIds] = useState<number[]>([]);
    const [isModuleWizardVisible, setIsModuleWizardVisible] = useState(false);

    // Metadata state
    const [metadataList, setMetadataList] = useState<MetadataEntry[]>([]);

    // Creation state
    const [creationPhase, setCreationPhase] = useState<CreationPhase>('idle');

    // Mutations
    const createDistributionSetMutation = useCreateDistributionSets();
    const assignModulesMutation = useAssignSoftwareModules();
    const createMetadataMutation = useCreateMetadata2();

    const selectedDsTypeKey = Form.useWatch('type', basicInfoForm);
    const selectedDsTypeId = dsTypesData?.content?.find(t => t.key === selectedDsTypeKey)?.id;

    // Fetch compatible module types
    const { data: mandatoryTypes } = useGetMandatoryModules(selectedDsTypeId || 0, {
        query: { enabled: !!selectedDsTypeId }
    });
    const { data: optionalTypes } = useGetOptionalModules(selectedDsTypeId || 0, {
        query: { enabled: !!selectedDsTypeId }
    });

    const allowedSmTypeKeys = React.useMemo(() => {
        const mandatory = mandatoryTypes?.map(t => t.key) || [];
        const optional = optionalTypes?.map(t => t.key) || [];
        return [...mandatory, ...optional];
    }, [mandatoryTypes, optionalTypes]);

    const filteredModules = React.useMemo(() => {
        if (!selectedDsTypeKey) return modulesData?.content || [];
        if (allowedSmTypeKeys.length === 0) return [];
        return (modulesData?.content || []).filter(m => allowedSmTypeKeys.includes(m.type));
    }, [modulesData, selectedDsTypeKey, allowedSmTypeKeys]);

    const resetWizard = useCallback(() => {
        setCurrentStep(0);
        basicInfoForm.resetFields();
        metadataForm.resetFields();
        newModuleForm.resetFields();
        setSelectedModuleIds([]);
        setNewlyCreatedIds([]);
        setIsModuleWizardVisible(false);
        setMetadataList([]);
        setCreationPhase('idle');
    }, [basicInfoForm, metadataForm, newModuleForm]);

    // Clear selection when DS type changes to prevent compatibility errors
    React.useEffect(() => {
        setSelectedModuleIds([]);
    }, [selectedDsTypeKey]);

    const handleCancel = () => {
        resetWizard();
        onCancel();
    };

    const handleNext = async () => {
        if (currentStep === 0) {
            try {
                await basicInfoForm.validateFields();
                setCurrentStep(1);
            } catch {
                // Validation failed
            }
        } else if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle newly created modules from sub-wizard
    const handleModulesCreated = (ids: number[]) => {
        setSelectedModuleIds(prev => [...prev, ...ids]);
        setNewlyCreatedIds(prev => [...prev, ...ids]);
        setIsModuleWizardVisible(false);
        // Refresh modules list
        void queryClient.invalidateQueries({ queryKey: getGetSoftwareModulesQueryKey() });
    };

    // Add metadata entry
    const handleAddMetadata = async () => {
        try {
            const values = await metadataForm.validateFields();
            if (metadataList.some((m) => m.key === values.key)) {
                message.warning(t('wizard.duplicateKey'));
                return;
            }
            setMetadataList([...metadataList, { key: values.key, value: values.value }]);
            metadataForm.resetFields();
        } catch {
            // Validation failed
        }
    };

    // Remove metadata entry
    const handleRemoveMetadata = (key: string) => {
        setMetadataList(metadataList.filter((m) => m.key !== key));
    };

    // Final creation process
    const handleFinish = async () => {
        const basicValues = basicInfoForm.getFieldsValue();
        setCreationPhase('creating_set');

        try {
            // Step 1: Create Distribution Set
            const dsPayload: MgmtDistributionSetRequestBodyPost = {
                name: basicValues.name,
                version: basicValues.version,
                type: basicValues.type,
                description: basicValues.description,
                requiredMigrationStep: basicValues.requiredMigrationStep || false,
            };

            const dsResult = await createDistributionSetMutation.mutateAsync({ data: [dsPayload] });
            const newDsId = dsResult?.[0]?.id;

            if (!newDsId) {
                throw new Error('Failed to get created Distribution Set ID');
            }

            // Step 2: Assign modules if any
            const allModuleIds = [...selectedModuleIds];

            if (allModuleIds.length > 0) {
                setCreationPhase('assigning_modules');
                const assignments = allModuleIds.map((id) => ({ id }));
                await assignModulesMutation.mutateAsync({
                    distributionSetId: newDsId,
                    data: assignments,
                });
            }

            // Step 4: Add metadata if any
            if (metadataList.length > 0) {
                setCreationPhase('adding_metadata');
                const metadataPayload: MgmtMetadata[] = metadataList.map((m) => ({
                    key: m.key,
                    value: m.value,
                }));
                await createMetadataMutation.mutateAsync({
                    distributionSetId: newDsId,
                    data: metadataPayload,
                });
            }

            setCreationPhase('done');
            message.success(t('messages.createSetSuccess'));

            // Invalidate caches
            void queryClient.invalidateQueries({ queryKey: getGetSoftwareModulesQueryKey() });

            resetWizard();
            onSuccess();
        } catch (error) {
            setCreationPhase('error');
            message.error((error as Error).message || t('messages.createSetError'));
        }
    };

    const getCreationPhaseText = () => {
        switch (creationPhase) {
            case 'creating_set':
                return t('wizard.creatingSet');
            case 'assigning_modules':
                return t('wizard.assigningModules');
            case 'adding_metadata':
                return t('wizard.addingMetadata');
            default:
                return '';
        }
    };

    const isProcessing = creationPhase !== 'idle' && creationPhase !== 'done' && creationPhase !== 'error';

    // Step 1: Basic Information
    const renderStep1 = () => (
        <Form form={basicInfoForm} layout="vertical" preserve>
            <Form.Item
                name="name"
                label={t('modal.name')}
                rules={[{ required: true, message: t('modal.placeholders.name') }]}
            >
                <Input placeholder={t('modal.placeholders.name')} />
            </Form.Item>
            <Form.Item
                name="version"
                label={t('modal.version')}
                rules={[{ required: true, message: t('modal.placeholders.version') }]}
            >
                <Input placeholder={t('modal.placeholders.version')} />
            </Form.Item>
            <Form.Item
                name="type"
                label={t('modal.type')}
                rules={[{ required: true, message: t('modal.placeholders.type') }]}
            >
                <Select
                    placeholder={t('modal.placeholders.type')}
                    loading={isDsTypesLoading}
                    options={dsTypesData?.content?.filter((t) => t.key).map((t) => ({ label: t.name, value: t.key }))}
                />
            </Form.Item>
            <Form.Item name="description" label={t('modal.description')}>
                <Input.TextArea rows={3} placeholder={t('modal.placeholders.description')} />
            </Form.Item>
            <Form.Item name="requiredMigrationStep" valuePropName="checked">
                <Checkbox>{t('modal.requiredMigration')}</Checkbox>
            </Form.Item>
        </Form>
    );

    // Step 2: Assign Modules
    const renderStep2 = () => (
        <div>
            {/* Unified Modules Selection */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t('wizard.selectModules')}</Text>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModuleWizardVisible(true)}
                    size="small"
                >
                    {t('wizard.addNewModule')}
                </Button>
            </div>

            <Table
                dataSource={filteredModules}
                rowKey="id"
                size="small"
                loading={isModulesLoading}
                pagination={{ pageSize: 10, size: 'small' }}
                rowSelection={{
                    selectedRowKeys: selectedModuleIds,
                    onChange: (keys) => setSelectedModuleIds(keys as number[]),
                }}
                columns={[
                    {
                        title: t('list.columns.name'),
                        dataIndex: 'name',
                        key: 'name',
                        render: (text: string, record: MgmtSoftwareModule) => (
                            <Space>
                                {record.id !== undefined && newlyCreatedIds.includes(record.id) && <Tag color="green">{t('values.new')}</Tag>}
                                {text}
                            </Space>
                        )
                    },
                    {
                        title: t('list.columns.version'),
                        dataIndex: 'version',
                        key: 'version',
                        render: (v) => <Tag color="blue">{v}</Tag>,
                    },
                    {
                        title: t('list.columns.type'),
                        dataIndex: 'typeName',
                        key: 'typeName',
                        render: (v) => <Tag color="cyan">{v}</Tag>,
                    },
                ]}
                style={{ marginBottom: 16 }}
            />

            <CreateModuleWizard
                visible={isModuleWizardVisible}
                onCancel={() => setIsModuleWizardVisible(false)}
                onModulesCreated={handleModulesCreated}
                initialValues={{
                    name: basicInfoForm.getFieldValue('name'),
                    version: basicInfoForm.getFieldValue('version'),
                }}
                allowedTypes={allowedSmTypeKeys}
            />
        </div>
    );

    // Step 3: Metadata
    const renderStep3 = () => (
        <div>
            <Card size="small" style={{ marginBottom: 16 }}>
                <Form form={metadataForm} layout="inline" style={{ marginBottom: 8 }}>
                    <Form.Item
                        name="key"
                        rules={[{ required: true, message: t('metadataTab.placeholderKey') }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder={t('metadataTab.key')} />
                    </Form.Item>
                    <Form.Item
                        name="value"
                        rules={[{ required: true, message: t('metadataTab.placeholderValue') }]}
                        style={{ flex: 2 }}
                    >
                        <Input placeholder={t('metadataTab.value')} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMetadata}>
                            {t('wizard.add')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {metadataList.length > 0 ? (
                <Table
                    dataSource={metadataList}
                    rowKey="key"
                    pagination={false}
                    size="small"
                    columns={[
                        { title: t('metadataTab.key'), dataIndex: 'key', key: 'key' },
                        { title: t('metadataTab.value'), dataIndex: 'value', key: 'value', ellipsis: true },
                        {
                            title: '',
                            key: 'action',
                            width: 60,
                            render: (_, record: MetadataEntry) => (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveMetadata(record.key)}
                                />
                            ),
                        },
                    ]}
                />
            ) : (
                <Empty description={t('wizard.noMetadata')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );

    // Step 4: Review
    const renderStep4 = () => {
        const values = basicInfoForm.getFieldsValue();
        const selectedType = dsTypesData?.content?.find((t) => t.key === values.type);
        const selectedModules = selectedModuleIds.map((id) => {
            const found = (modulesData?.content || []).find((m) => m.id === id);
            if (found) return found;
            return { id, name: `${t('values.new')} (ID: ${id})`, version: '', typeName: '' } as MgmtSoftwareModule;
        });

        const reviewList = selectedModules.map((m: MgmtSoftwareModule) => ({
            key: m.id,
            name: m.name,
            version: m.version,
            typeName: m.typeName,
            isNew: newlyCreatedIds.includes(m.id!),
        }));

        return (
            <div>
                <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                    <Descriptions.Item label={t('modal.name')}>{values.name}</Descriptions.Item>
                    <Descriptions.Item label={t('modal.version')}>
                        <Tag color="blue">{values.version}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('modal.type')}>
                        <Tag color="cyan">{selectedType?.name || values.type}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('modal.description')}>{values.description || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('modal.requiredMigration')}>
                        {values.requiredMigrationStep ? t('values.yes') : t('values.no')}
                    </Descriptions.Item>
                </Descriptions>

                <Card size="small" title={t('wizard.dsStep2Title')} style={{ marginBottom: 16 }}>
                    {reviewList.length > 0 ? (
                        <List
                            size="small"
                            dataSource={reviewList}
                            renderItem={(item) => (
                                <List.Item>
                                    <div style={{ width: '100%' }}>
                                        <Space style={{ marginBottom: 4 }}>
                                            {item.isNew && <Tag color="green">{t('values.new')}</Tag>}
                                            <span style={{ fontWeight: '500' }}>{item.name || ''}</span>
                                            <Tag color="blue">{item.version || ''}</Tag>
                                            <Tag color="cyan">{item.typeName || ''}</Tag>
                                        </Space>
                                        <div style={{ marginLeft: 0 }}>
                                            <ModuleArtifactList moduleId={item.key!} />
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description={t('wizard.noModulesSelected')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Card>

                <Card size="small" title={t('wizard.dsMetadataReviewTitle', 'Metadata')} style={{ marginBottom: 16 }}>
                    {metadataList.length > 0 ? (
                        <List
                            size="small"
                            dataSource={metadataList}
                            renderItem={(item) => (
                                <List.Item>
                                    <Space>
                                        <Tag color="blue">{item.key}</Tag>
                                        <span>{item.value}</span>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description={t('wizard.noMetadata')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Card>

                {isProcessing && (
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Badge status="processing" text={getCreationPhaseText()} />
                    </div>
                )}
            </div>
        );
    };

    const steps = [
        { title: t('wizard.step1Title') },
        { title: t('wizard.dsStep2Title') },
        { title: t('wizard.dsStep3Title', 'Metadata'), description: t('wizard.optionalStep') },
        { title: t('wizard.step4Title') },
    ];



    return (
        <Modal
            title={t('modal.createSetTitle')}
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={
                <Space>
                    <Button onClick={handleCancel} disabled={isProcessing}>
                        {t('common:actions.cancel')}
                    </Button>
                    {currentStep > 0 && (
                        <Button onClick={handlePrev} disabled={isProcessing}>
                            {t('wizard.prev')}
                        </Button>
                    )}
                    {currentStep < 3 && (
                        <Button type="primary" onClick={handleNext}>
                            {t('wizard.next')}
                        </Button>
                    )}
                    {currentStep === 3 && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleFinish}
                            loading={isProcessing}
                        >
                            {t('wizard.finish')}
                        </Button>
                    )}
                </Space>
            }
        >
            <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} size="small" />
            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>{renderStep1()}</div>
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>{renderStep2()}</div>
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>{renderStep3()}</div>
            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>{renderStep4()}</div>
        </Modal>
    );
};

export default CreateDistributionSetWizard;
