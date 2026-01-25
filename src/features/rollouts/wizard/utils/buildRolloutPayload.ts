import type { MgmtRolloutRestRequestBodyPost } from '@/api/generated/model';
import type { WizardFormData } from '../hooks/useRolloutWizardState';

type BuildRolloutPayloadParams = {
    formData: WizardFormData;
    targetFilterQuery?: string;
};

export const buildRolloutPayload = ({ formData, targetFilterQuery }: BuildRolloutPayloadParams) => {
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

    if (targetFilterQuery && targetFilterQuery.trim() !== '') {
        payload.targetFilterQuery = targetFilterQuery;
    }

    return payload;
};
