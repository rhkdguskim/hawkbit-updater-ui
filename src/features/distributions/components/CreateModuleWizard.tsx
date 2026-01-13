import React, { useState, useRef, useCallback } from 'react';
import {
    Modal,
    Steps,
    Form,
    Input,
    Select,
    Button,
    Space,
    Table,
    Upload,
    message,
    Descriptions,
    Tag,
    List,
    Badge,
    Tooltip,
    Card,
    Empty,
    Checkbox,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    InboxOutlined,
    FileOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
    useCreateSoftwareModules,
    useUploadArtifact,
    useCreateMetadata1,
    getGetSoftwareModulesQueryKey
} from '@/api/generated/software-modules/software-modules';
import { useGetTypes } from '@/api/generated/software-module-types/software-module-types';
import type { MgmtSoftwareModuleRequestBodyPost, MgmtSoftwareModuleMetadata } from '@/api/generated/model';
import type { RcFile } from 'antd/es/upload';
import { useQueryClient } from '@tanstack/react-query';

interface CreateModuleWizardProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
    onModulesCreated?: (ids: number[]) => void;
    initialValues?: {
        name?: string;
        version?: string;
    };
    allowedTypes?: string[];
}

interface MetadataEntry {
    key: string;
    value: string;
    targetVisible: boolean;
}

interface FileEntry {
    id: string;
    file: File;
    name: string;
}

type CreationPhase = 'idle' | 'creating_module' | 'adding_metadata' | 'uploading_artifacts' | 'done' | 'error';

const CreateModuleWizard: React.FC<CreateModuleWizardProps> = ({
    visible,
    onCancel,
    onSuccess,
    onModulesCreated,
    initialValues,
    allowedTypes,
}) => {
    const { t } = useTranslation('distributions');
    const [currentStep, setCurrentStep] = useState(0);
    const [basicInfoForm] = Form.useForm();
    const [metadataForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Reset or Set Initial Values when visible changes
    React.useEffect(() => {
        if (visible && initialValues) {
            basicInfoForm.setFieldsValue({
                name: initialValues.name,
                version: initialValues.version,
            });
        }
    }, [visible, initialValues, basicInfoForm]);

    // Basic info state
    const { data: typesData, isLoading: isTypesLoading } = useGetTypes({ limit: 100 });

    // Metadata state
    const [metadataList, setMetadataList] = useState<MetadataEntry[]>([]);

    // Artifact state
    const [fileList, setFileList] = useState<FileEntry[]>([]);

    // Creation state
    const [creationPhase, setCreationPhase] = useState<CreationPhase>('idle');
    const artifactUploadIndexRef = useRef(0);

    // Mutations
    const createModuleMutation = useCreateSoftwareModules();
    const createMetadataMutation = useCreateMetadata1();
    const uploadArtifactMutation = useUploadArtifact();

    const resetWizard = useCallback(() => {
        setCurrentStep(0);
        basicInfoForm.resetFields();
        metadataForm.resetFields();
        setMetadataList([]);
        setFileList([]);
        setCreationPhase('idle');
        artifactUploadIndexRef.current = 0;
    }, [basicInfoForm, metadataForm]);

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

    // Add metadata entry
    const handleAddMetadata = async () => {
        try {
            const values = await metadataForm.validateFields();
            // Check for duplicate key
            if (metadataList.some((m) => m.key === values.key)) {
                message.warning(t('wizard.duplicateKey'));
                return;
            }
            setMetadataList([...metadataList, {
                key: values.key,
                value: values.value,
                targetVisible: values.targetVisible || false
            }]);
            metadataForm.resetFields();
        } catch {
            // Validation failed
        }
    };

    // Remove metadata entry
    const handleRemoveMetadata = (key: string) => {
        setMetadataList(metadataList.filter((m) => m.key !== key));
    };

    // Handle file selection
    const handleBeforeUpload = (file: RcFile) => {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setFileList((prev) => [...prev, { id, file, name: file.name }]);
        return false; // Prevent auto upload
    };

    // Remove file from list
    const handleRemoveFile = (id: string) => {
        setFileList(fileList.filter((f) => f.id !== id));
    };

    // Final creation process
    const handleFinish = async () => {
        // First validate the basic info form
        let basicValues;
        try {
            basicValues = await basicInfoForm.validateFields();
        } catch {
            // Form validation failed - user didn't fill required fields
            setCurrentStep(0);
            return;
        }

        const payload: MgmtSoftwareModuleRequestBodyPost = {
            name: basicValues.name,
            version: basicValues.version,
            type: basicValues.type,
            description: basicValues.description,
            vendor: basicValues.vendor,
            encrypted: false,
        };

        setCreationPhase('creating_module');

        try {
            // Step 1: Create module
            const moduleResult = await createModuleMutation.mutateAsync({ data: [payload] });
            const newModuleId = moduleResult?.[0]?.id;

            if (!newModuleId) {
                throw new Error('Failed to get created module ID');
            }

            // Step 2: Add metadata if any
            if (metadataList.length > 0) {
                setCreationPhase('adding_metadata');
                const metadataPayload: MgmtSoftwareModuleMetadata[] = metadataList.map((m) => ({
                    key: m.key,
                    value: m.value,
                    targetVisible: m.targetVisible,
                }));
                await createMetadataMutation.mutateAsync({
                    softwareModuleId: newModuleId,
                    data: metadataPayload,
                });
            }

            // Step 3: Upload artifacts if any
            if (fileList.length > 0) {
                setCreationPhase('uploading_artifacts');
                for (let i = 0; i < fileList.length; i++) {
                    artifactUploadIndexRef.current = i + 1;
                    await uploadArtifactMutation.mutateAsync({
                        softwareModuleId: newModuleId,
                        data: { file: fileList[i].file },
                        params: { filename: fileList[i].name },
                    });
                }
            }

            setCreationPhase('done');
            message.success(t('messages.createModuleSuccess'));

            // Invalidate module list cache
            void queryClient.invalidateQueries({
                queryKey: getGetSoftwareModulesQueryKey()
            });

            resetWizard();
            if (onModulesCreated && moduleResult) {
                const ids = moduleResult.map(m => m.id).filter((id): id is number => !!id);
                onModulesCreated(ids);
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            setCreationPhase('error');
            message.error((error as Error).message || t('messages.createModuleError'));
        }
    };

    const getCreationPhaseText = () => {
        switch (creationPhase) {
            case 'creating_module':
                return t('wizard.creatingModule');
            case 'adding_metadata':
                return t('wizard.addingMetadata');
            case 'uploading_artifacts':
                return `${t('wizard.uploadingArtifacts')} (${artifactUploadIndexRef.current}/${fileList.length})`;
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
                    loading={isTypesLoading}
                    options={typesData?.content?.filter((t) => {
                        if (!t.key) return false;
                        if (allowedTypes && allowedTypes.length > 0) {
                            return allowedTypes.includes(t.key);
                        }
                        return true;
                    }).map((t) => ({ label: t.name, value: t.key }))}
                />
            </Form.Item>
            <Form.Item name="vendor" label={t('modal.vendor')}>
                <Input placeholder={t('modal.placeholders.vendor')} />
            </Form.Item>
            <Form.Item name="description" label={t('modal.description')}>
                <Input.TextArea rows={3} placeholder={t('modal.placeholders.description')} />
            </Form.Item>
        </Form>
    );

    // Step 2: Metadata
    const renderStep2 = () => (
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
                    <Form.Item name="targetVisible" valuePropName="checked">
                        <Checkbox>{t('metadataTab.targetVisible')}</Checkbox>
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
                            title: t('metadataTab.targetVisible'),
                            dataIndex: 'targetVisible',
                            key: 'targetVisible',
                            width: 100,
                            render: (v: boolean) => (
                                <Tag color={v ? 'green' : 'default'}>{v ? t('values.yes') : t('values.no')}</Tag>
                            ),
                        },
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

    // Step 3: Artifacts
    const renderStep3 = () => (
        <div>
            <Upload.Dragger
                beforeUpload={handleBeforeUpload}
                multiple
                showUploadList={false}
                style={{ marginBottom: 16 }}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">{t('detail.dragDropTitle')}</p>
                <p className="ant-upload-hint">{t('wizard.artifactHint')}</p>
            </Upload.Dragger>

            {fileList.length > 0 ? (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    <List
                        size="small"
                        bordered
                        dataSource={fileList}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        key="delete"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveFile(item.id)}
                                    />,
                                ]}
                            >
                                <Space>
                                    <FileOutlined />
                                    <span>{item.name}</span>
                                    <Tag>{(item.file.size / 1024).toFixed(1)} KB</Tag>
                                </Space>
                            </List.Item>
                        )}
                    />
                </div>
            ) : (
                <Empty description={t('wizard.noArtifacts')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );

    // Step 4: Review
    const renderStep4 = () => {
        const values = basicInfoForm.getFieldsValue();
        const selectedType = typesData?.content?.find((t) => t.key === values.type);

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
                    <Descriptions.Item label={t('modal.vendor')}>{values.vendor || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('modal.description')}>{values.description || '-'}</Descriptions.Item>
                </Descriptions>

                <Card size="small" title={t('wizard.step2Title')} style={{ marginBottom: 16 }}>
                    {metadataList.length > 0 ? (
                        <List
                            size="small"
                            dataSource={metadataList}
                            renderItem={(item) => (
                                <List.Item>
                                    <Space>
                                        <Tag color="blue">{item.key}</Tag>
                                        <span>{item.value}</span>
                                        {item.targetVisible && (
                                            <Tooltip title={t('metadataTab.targetVisible')}>
                                                <InfoCircleOutlined style={{ color: '#52c41a' }} />
                                            </Tooltip>
                                        )}
                                    </Space>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description={t('wizard.noMetadata')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Card>

                <Card size="small" title={t('wizard.step3Title')}>
                    {fileList.length > 0 ? (
                        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                            <List
                                size="small"
                                dataSource={fileList}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Space>
                                            <FileOutlined />
                                            <span>{item.name}</span>
                                            <Tag>{(item.file.size / 1024).toFixed(1)} KB</Tag>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </div>
                    ) : (
                        <Empty description={t('wizard.noArtifacts')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
        { title: t('wizard.step2Title'), description: t('wizard.optionalStep') },
        { title: t('wizard.step3Title'), description: t('wizard.optionalStep') },
        { title: t('wizard.step4Title') },
    ];



    return (
        <Modal
            title={t('modal.createModuleTitle')}
            open={visible}
            onCancel={handleCancel}
            width={720}
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

export default CreateModuleWizard;
