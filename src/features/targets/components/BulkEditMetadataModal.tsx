import React, { useState, useMemo } from 'react';
import {
    Form,
    Select,
    Radio,
    Space,
    Progress,
    Alert,
    Steps,
    Result,
    Typography,
    Divider,
    Button,
    List,
    Tag,
    Flex,
    message,
} from 'antd';
import {
    TagsOutlined,
    SwapOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import {
    useAssignTarget,
    useUnassignTarget,
} from '@/api/generated/target-tags/target-tags';
import { axiosInstance } from '@/api/axios-instance';
import styled from 'styled-components';
import { StandardModal } from '@/components/patterns';

const { Text, Title } = Typography;

const ModeCard = styled.div<{ $selected: boolean }>`
    padding: var(--ant-padding, 16px);
    border: 2px solid ${props => props.$selected ? 'var(--ant-color-primary)' : 'var(--ant-color-border)'};
    border-radius: var(--ant-border-radius, 12px);
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$selected ? 'var(--ant-color-primary-bg)' : 'var(--ant-color-bg-container)'};
    
    &:hover {
        border-color: var(--ant-color-primary);
        box-shadow: 0 2px 8px rgba(var(--ant-color-primary-rgb), 0.1);
    }
`;

const TargetPreviewItem = styled.div`
    padding: var(--ant-padding-xs, 8px) var(--ant-padding-sm, 12px);
    background: var(--ant-color-fill-tertiary);
    border-radius: var(--ant-border-radius, 8px);
    margin-bottom: var(--ant-margin-xxs, 4px);
    font-size: var(--ant-font-size-sm);
`;

type BulkEditMode = 'merge' | 'replace';

interface BulkEditMetadataModalProps {
    open: boolean;
    targetIds: string[];
    onCancel: () => void;
    onSuccess: () => void;
}

interface ProcessingResult {
    targetId: string;
    success: boolean;
    error?: string;
}

const BulkEditMetadataModal: React.FC<BulkEditMetadataModalProps> = ({
    open,
    targetIds,
    onCancel,
    onSuccess,
}) => {
    const { t } = useTranslation(['targets', 'common']);
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [mode, setMode] = useState<BulkEditMode>('merge');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<ProcessingResult[]>([]);

    // Fetch available tags
    const { data: tagsData, isLoading: tagsLoading } = useGetTargetTags({
        limit: 500,
    });

    const assignTargetMutation = useAssignTarget();
    const unassignTargetMutation = useUnassignTarget();

    const tags = useMemo(() => tagsData?.content || [], [tagsData]);

    const handleReset = () => {
        setCurrentStep(0);
        setMode('merge');
        setSelectedTags([]);
        setProgress(0);
        setResults([]);
        form.resetFields();
    };

    const handleCancel = () => {
        handleReset();
        onCancel();
    };

    const handleProcess = async () => {
        setIsProcessing(true);
        setCurrentStep(2);
        setResults([]);
        setProgress(0);

        const processingResults: ProcessingResult[] = [];
        let completedTargets = 0;

        for (const targetId of targetIds) {
            try {
                if (mode === 'replace') {
                    // First, get current tags and remove them
                    const currentTags = await axiosInstance<{ content: { id: number }[] }>({
                        url: `/rest/v1/targets/${targetId}/tags`,
                        method: 'GET',
                    });

                    if (currentTags?.content) {
                        for (const tag of currentTags.content) {
                            if (tag.id) {
                                await unassignTargetMutation.mutateAsync({
                                    targetTagId: tag.id,
                                    controllerId: targetId,
                                });
                            }
                        }
                    }
                }

                // Assign new tags
                for (const tagId of selectedTags) {
                    try {
                        await assignTargetMutation.mutateAsync({
                            targetTagId: tagId,
                            controllerId: targetId,
                        });
                    } catch {
                        // Tag might already be assigned, ignore error for single target
                    }
                }

                processingResults.push({ targetId, success: true });
            } catch (error) {
                processingResults.push({
                    targetId,
                    success: false,
                    error: (error as Error).message,
                });
            } finally {
                completedTargets++;
                setProgress(Math.round((completedTargets / targetIds.length) * 100));
            }
        }

        setResults(processingResults);
        setIsProcessing(false);
        setProgress(100);

        const successCount = processingResults.filter(r => r.success).length;
        const failedCount = processingResults.filter(r => !r.success).length;

        if (failedCount === 0) {
            message.success(t('bulkEdit.successMessage', { count: successCount }));
        } else {
            message.warning(t('bulkEdit.partialSuccess', { success: successCount, failed: failedCount }));
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                            <Text strong>{t('bulkEdit.selectedTargets')}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                                ({targetIds.length} {t('bulkEdit.targets')})
                            </Text>
                            <div style={{ maxHeight: 150, overflow: 'auto', marginTop: 12, border: '1px solid #f0f0f0', padding: 8, borderRadius: 8 }}>
                                {targetIds.slice(0, 10).map(id => (
                                    <TargetPreviewItem key={id}>{id}</TargetPreviewItem>
                                ))}
                                {targetIds.length > 10 && (
                                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 8 }}>
                                        +{targetIds.length - 10} {t('bulkEdit.more')}
                                    </Text>
                                )}
                            </div>
                        </div>

                        <Divider style={{ margin: '12px 0' }} />

                        <div>
                            <Text strong>{t('bulkEdit.selectMode')}</Text>
                            <Space direction="vertical" style={{ width: '100%', marginTop: 12 }} size={12}>
                                <ModeCard $selected={mode === 'merge'} onClick={() => setMode('merge')}>
                                    <Flex align="center" gap={12}>
                                        <Radio checked={mode === 'merge'} />
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>
                                                <TagsOutlined /> {t('bulkEdit.mergeMode')}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {t('bulkEdit.mergeModeDesc')}
                                            </Text>
                                        </div>
                                    </Flex>
                                </ModeCard>
                                <ModeCard $selected={mode === 'replace'} onClick={() => setMode('replace')}>
                                    <Flex align="center" gap={12}>
                                        <Radio checked={mode === 'replace'} />
                                        <div>
                                            <Title level={5} style={{ margin: 0 }}>
                                                <SwapOutlined /> {t('bulkEdit.replaceMode')}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {t('bulkEdit.replaceModeDesc')}
                                            </Text>
                                        </div>
                                    </Flex>
                                </ModeCard>
                            </Space>
                        </div>

                        {mode === 'replace' && (
                            <Alert
                                message={t('bulkEdit.replaceWarning')}
                                type="warning"
                                showIcon
                                icon={<WarningOutlined />}
                            />
                        )}
                    </Space>
                );

            case 1:
                return (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                            <Text strong>{t('bulkEdit.selectTags')}</Text>
                            <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
                                <Form.Item
                                    name="tags"
                                    rules={[{ required: true, message: t('bulkEdit.tagRequired') }]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder={t('bulkEdit.selectTagsPlaceholder')}
                                        loading={tagsLoading}
                                        value={selectedTags}
                                        onChange={setSelectedTags}
                                        style={{ width: '100%' }}
                                        optionFilterProp="label"
                                        options={tags.map(tag => ({
                                            label: tag.name,
                                            value: tag.id,
                                            render: (
                                                <Space>
                                                    <Tag color={tag.colour || 'default'}>{tag.name}</Tag>
                                                    {tag.description && (
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {tag.description}
                                                        </Text>
                                                    )}
                                                </Space>
                                            )
                                        }))}
                                        tagRender={(props) => {
                                            const tag = tags.find(t => t.id === props.value);
                                            return (
                                                <Tag
                                                    color={tag?.colour || 'default'}
                                                    closable={props.closable}
                                                    onClose={props.onClose}
                                                    style={{ marginRight: 3 }}
                                                >
                                                    {props.label}
                                                </Tag>
                                            );
                                        }}
                                    />
                                </Form.Item>
                            </Form>
                        </div>

                        {selectedTags.length > 0 && (
                            <div>
                                <Text strong>{t('bulkEdit.preview')}</Text>
                                <div style={{ marginTop: 8, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                                    <Text type="secondary">{t('bulkEdit.previewDesc', { count: targetIds.length })}</Text>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <Space wrap>
                                        {selectedTags.map(tagId => {
                                            const tag = tags.find(t => t.id === tagId);
                                            return tag ? (
                                                <Tag key={tagId} color={tag.colour || 'default'}>
                                                    {tag.name}
                                                </Tag>
                                            ) : null;
                                        })}
                                    </Space>
                                </div>
                            </div>
                        )}
                    </Space>
                );

            case 2:
                return (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {isProcessing ? (
                            <>
                                <Progress
                                    percent={progress}
                                    status="active"
                                    strokeColor={{
                                        '0%': '#667eea',
                                        '100%': '#764ba2',
                                    }}
                                />
                                <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                                    {t('bulkEdit.processing')}
                                </Text>
                            </>
                        ) : (
                            <>
                                {results.every(r => r.success) ? (
                                    <Result
                                        status="success"
                                        title={t('bulkEdit.complete')}
                                        subTitle={t('bulkEdit.completeDesc', { count: results.length })}
                                    />
                                ) : (
                                    <>
                                        <Alert
                                            message={t('bulkEdit.partialCompleteTitle')}
                                            description={t('bulkEdit.partialCompleteDesc')}
                                            type="warning"
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                        />
                                        <div style={{ maxHeight: 200, overflow: 'auto' }}>
                                            <List
                                                size="small"
                                                dataSource={results}
                                                renderItem={item => (
                                                    <List.Item>
                                                        <Space>
                                                            {item.success ? (
                                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                                            ) : (
                                                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                            )}
                                                            <Text>{item.targetId}</Text>
                                                            {item.error && (
                                                                <Text type="danger" style={{ fontSize: 12 }}>
                                                                    ({item.error})
                                                                </Text>
                                                            )}
                                                        </Space>
                                                    </List.Item>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </Space>
                );

            default:
                return null;
        }
    };

    return (
        <StandardModal
            open={open}
            title={
                <Space>
                    <TagsOutlined />
                    {t('bulkEdit.title')}
                </Space>
            }
            width={600}
            onCancel={handleCancel}
            footer={[
                currentStep === 2 ? (
                    !isProcessing && (
                        <Button key="done" type="primary" onClick={() => {
                            handleReset();
                            onSuccess();
                        }}>
                            {t('common:actions.done')}
                        </Button>
                    )
                ) : (
                    <>
                        <Button key="cancel" onClick={handleCancel}>
                            {t('common:actions.cancel')}
                        </Button>
                        {currentStep > 0 && (
                            <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
                                {t('common:actions.previous')}
                            </Button>
                        )}
                        <Button
                            key="next"
                            type="primary"
                            onClick={() => {
                                if (currentStep === 1) {
                                    if (selectedTags.length === 0) {
                                        message.warning(t('bulkEdit.tagRequired'));
                                        return;
                                    }
                                    handleProcess();
                                } else {
                                    setCurrentStep(currentStep + 1);
                                }
                            }}
                        >
                            {currentStep === 1 ? t('bulkEdit.apply') : t('common:actions.next')}
                        </Button>
                    </>
                )
            ]}
            destroyOnClose
        >
            <Steps
                current={currentStep}
                items={[
                    { title: t('bulkEdit.step1') },
                    { title: t('bulkEdit.step2') },
                    { title: t('bulkEdit.step3') },
                ]}
                style={{ marginBottom: 32 }}
                size="small"
            />
            {renderStepContent()}
        </StandardModal>
    );
};

export default BulkEditMetadataModal;
