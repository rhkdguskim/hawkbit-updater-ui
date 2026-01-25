import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Flex, Modal, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { FormInstance } from 'antd';
import { useApprovalPolicyStore } from '@/stores/useApprovalPolicyStore';
import { getRollouts } from '@/api/generated/rollouts/rollouts';
import { escapeValue } from '@/utils/fiql';
import type { MgmtRolloutRestRequestBodyPost, PagedListMgmtTarget } from '@/api/generated/model';
import { buildTargetFilter } from '../utils/buildTargetFilter';
import { buildRolloutPayload } from '../utils/buildRolloutPayload';
import type { TargetFilterBuilderState } from '../utils/buildTargetFilter';
import type { WizardFormData } from './useRolloutWizardState';

dayjs.extend(isBetween);

const { Text } = Typography;

type CreateMutation = {
    mutate: (params: { data: MgmtRolloutRestRequestBodyPost }) => void;
};

type UseRolloutValidationParams = {
    currentStep: number;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    formData: WizardFormData;
    setFormData: Dispatch<SetStateAction<WizardFormData>>;
    basicInfoForm: FormInstance<WizardFormData>;
    groupSettingsForm: FormInstance<WizardFormData>;
    setIsCheckingName: Dispatch<SetStateAction<boolean>>;
    setNameError: Dispatch<SetStateAction<string | null>>;
    filterMode: 'builder';
    builderState: TargetFilterBuilderState;
    targetsData?: PagedListMgmtTarget;
    createMutation: CreateMutation;
};

export const useRolloutValidation = ({
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
}: UseRolloutValidationParams) => {
    const { t } = useTranslation(['rollouts', 'common']);

    const handleNext = useCallback(async () => {
        if (currentStep === 0) {
            try {
                const values = await basicInfoForm.validateFields();
                setIsCheckingName(true);
                setNameError(null);

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
            if (filterMode === 'builder') {
                const fiql = buildTargetFilter(builderState);
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
    }, [
        currentStep,
        basicInfoForm,
        builderState,
        filterMode,
        formData.distributionSetId,
        groupSettingsForm,
        setCurrentStep,
        setFormData,
        setIsCheckingName,
        setNameError,
        t,
    ]);

    const handlePrev = useCallback(() => {
        setCurrentStep(currentStep - 1);
    }, [currentStep, setCurrentStep]);

    const handleCreate = useCallback(() => {
        if (!builderState.allTargets && !formData.targetFilterQuery?.trim()) {
            message.warning(t('wizard.targetFilter.required'));
            setCurrentStep(2);
            return;
        }

        const { rules } = useApprovalPolicyStore.getState();
        const activeRules = rules.filter(rule => rule.enabled);
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
            const payload = buildRolloutPayload({ formData, targetFilterQuery: finalQuery });
            createMutation.mutate({ data: payload });
        };

        if (matchingRules.length > 0) {
            Modal.confirm({
                title: t('approvalPolicy.confirmTitle'),
                content: (
                    <Flex vertical gap={12}>
                        <Text>{t('approvalPolicy.matchingRulesDesc')}</Text>
                        <ul>
                            {matchingRules.map((rule, index) => (
                                <li key={index}><Text strong>{rule}</Text></li>
                            ))}
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
    }, [builderState, createMutation, formData, setCurrentStep, t, targetsData]);

    return {
        handleNext,
        handlePrev,
        handleCreate,
    };
};
