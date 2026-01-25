import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Space, Steps, message, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useCreate, useStart, getGetRolloutsQueryKey } from '@/api/generated/rollouts/rollouts';
import { PageHeader, PageLayout } from '@/components/patterns';
import { ActionsBar, StepsCard, WizardContent, WizardLayout, WizardRightCol, WizardRow, WizardScrollable, WizardShell } from './components/WizardLayout';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { DistributionSetStep } from './steps/DistributionSetStep';
import { TargetSelectionStep } from './steps/TargetSelectionStep';
import { ApprovalPolicyStep, ReviewStep } from './steps/ApprovalPolicyStep';
import { useRolloutWizardState } from './hooks/useRolloutWizardState';
import { useRolloutValidation } from './hooks/useRolloutValidation';

interface RolloutWizardProps {
    isModal?: boolean;
    onClose?: () => void;
    onSuccess?: (rolloutId: number) => void;
}

export const RolloutWizard: React.FC<RolloutWizardProps> = ({ isModal, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation(['rollouts', 'common']);
    const { token } = theme.useToken();

    const {
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        builderState,
        setBuilderState,
        filterMode,
        dsSearchValue,
        setDsSearchValue,
        dsSearchField,
        setDsSearchField,
        dsTypeFilter,
        setDsTypeFilter,
        basicInfoForm,
        groupSettingsForm,
        amountGroupsValue,
        isCheckingName,
        setIsCheckingName,
        nameError,
        setNameError,
        dsTypesData,
        dsTypesLoading,
        dsData,
        dsLoading,
        targetTagsData,
        targetTagsLoading,
        targetTypesData,
        targetTypesLoading,
        targetsData,
        isLoadingTargets,
    } = useRolloutWizardState();

    const createMutation = useCreate({
        mutation: {
            onSuccess: async (data) => {
                message.success(t('wizard.messages.createSuccess'));
                queryClient.invalidateQueries({ queryKey: getGetRolloutsQueryKey() });

                if (data.id) {
                    const rolloutId = data.id;
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

    const { handleNext, handlePrev, handleCreate } = useRolloutValidation({
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        basicInfoForm,
        groupSettingsForm,
        setIsCheckingName,
        setNameError,
        filterMode,
        builderState,
        targetsData,
        createMutation,
    });

    const steps = useMemo(() => [
        { title: t('wizard.steps.basicInfo') },
        { title: t('wizard.steps.distributionSet') },
        { title: t('wizard.steps.targetFilter') },
        { title: t('wizard.steps.groupSettings') },
        { title: t('wizard.steps.review') },
    ], [t]);

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <BasicInfoStep
                        form={basicInfoForm}
                        formData={formData}
                        nameError={nameError}
                        isCheckingName={isCheckingName}
                        onNameChange={() => setNameError(null)}
                        isModal={isModal}
                    />
                );
            case 1:
                return (
                    <DistributionSetStep
                        formData={formData}
                        onSelectDistributionSet={(distributionSetId, name) => setFormData(prev => ({
                            ...prev,
                            distributionSetId,
                            distributionSetName: name,
                        }))}
                        dsSearchField={dsSearchField}
                        setDsSearchField={setDsSearchField}
                        setDsSearchValue={setDsSearchValue}
                        dsTypeFilter={dsTypeFilter}
                        setDsTypeFilter={setDsTypeFilter}
                        dsTypesData={dsTypesData}
                        dsTypesLoading={dsTypesLoading}
                        dsData={dsData}
                        dsLoading={dsLoading}
                        isModal={isModal}
                    />
                );
            case 2:
                return (
                    <TargetSelectionStep
                        builderState={builderState}
                        setBuilderState={setBuilderState}
                        targetTypesData={targetTypesData}
                        targetTagsData={targetTagsData}
                        targetTypesLoading={targetTypesLoading}
                        targetTagsLoading={targetTagsLoading}
                        targetsData={targetsData}
                        isLoadingTargets={isLoadingTargets}
                        isModal={isModal}
                    />
                );
            case 3:
                return (
                    <ApprovalPolicyStep
                        form={groupSettingsForm}
                        formData={formData}
                        amountGroupsValue={amountGroupsValue}
                        targetsTotal={targetsData?.total || 0}
                        isModal={isModal}
                    />
                );
            case 4:
                return (
                    <ReviewStep
                        formData={formData}
                        targetsData={targetsData}
                        isLoadingTargets={isLoadingTargets}
                        isModal={isModal}
                    />
                );
            default:
                return null;
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
