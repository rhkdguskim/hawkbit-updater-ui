import { Form, Input, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd';
import type { WizardFormData } from '../hooks/useRolloutWizardState';
import { ReleaseNotesArea, ReleaseNotesHint, WizardCard } from '../components/WizardLayout';

type BasicInfoStepProps = {
    form: FormInstance<WizardFormData>;
    formData: WizardFormData;
    nameError: string | null;
    isCheckingName: boolean;
    onNameChange: () => void;
    isModal?: boolean;
};

export const BasicInfoStep = ({
    form,
    formData,
    nameError,
    isCheckingName,
    onNameChange,
    isModal,
}: BasicInfoStepProps) => {
    const { t } = useTranslation(['rollouts']);

    return (
        <WizardCard title={t('wizard.basicInfo.title')} $isModal={isModal}>
            <Form
                form={form}
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
                        onChange={onNameChange}
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
};
