import { Alert, Descriptions, Form, InputNumber, Table, Tag, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import type { PagedListMgmtTarget } from '@/api/generated/model';
import type { WizardFormData } from '../hooks/useRolloutWizardState';
import { ReleaseNotesPreview, WizardCard } from '../components/WizardLayout';

const { Text } = Typography;

type ApprovalPolicyStepProps = {
    form: FormInstance<WizardFormData>;
    formData: WizardFormData;
    amountGroupsValue?: number;
    targetsTotal: number;
    isModal?: boolean;
};

type ReviewStepProps = {
    formData: WizardFormData;
    targetsData?: PagedListMgmtTarget;
    isLoadingTargets: boolean;
    isModal?: boolean;
};

export const ApprovalPolicyStep = ({
    form,
    formData,
    amountGroupsValue,
    targetsTotal,
    isModal,
}: ApprovalPolicyStepProps) => {
    const { t } = useTranslation(['rollouts']);
    const amountGroups = amountGroupsValue || formData.amountGroups;

    const groupSize = Math.floor(targetsTotal / amountGroups);
    const remainder = targetsTotal % amountGroups;

    return (
        <WizardCard title={t('wizard.groupSettings.title')} $isModal={isModal}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    amountGroups: formData.amountGroups,
                    successThreshold: formData.successThreshold,
                    errorThreshold: formData.errorThreshold,
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <Form.Item name="amountGroups" label={t('wizard.groupSettings.amountGroups')} rules={[{ required: true }]}>
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                    <div style={{ marginTop: 30 }}>
                        <Text type="secondary">
                            {t('wizard.groupSettings.preview', {
                                count: amountGroups,
                                size: groupSize,
                            })}
                        </Text>
                    </div>
                </div>

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
                    <InputNumber<number>
                        min={0}
                        max={100}
                        formatter={value => `${value}%`}
                        parser={value => value?.replace('%', '') as unknown as number}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <Form.Item name="errorThreshold" label={t('wizard.groupSettings.errorThreshold')} rules={[{ required: true }]}>
                    <InputNumber<number>
                        min={0}
                        max={100}
                        formatter={value => `${value}%`}
                        parser={value => value?.replace('%', '') as unknown as number}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </WizardCard>
    );
};

export const ReviewStep = ({ formData, targetsData, isLoadingTargets, isModal }: ReviewStepProps) => {
    const { t } = useTranslation(['rollouts']);

    return (
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
};
