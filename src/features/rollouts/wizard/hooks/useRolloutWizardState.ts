import { useEffect, useMemo, useState } from 'react';
import { Form } from 'antd';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';
import { useGetTargets } from '@/api/generated/targets/targets';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { buildTargetFilter, type TargetFilterBuilderState } from '../utils/buildTargetFilter';

export interface WizardFormData {
    name: string;
    description?: string;
    distributionSetId?: number;
    distributionSetName?: string;
    targetFilterQuery?: string;
    amountGroups: number;
    successThreshold: number;
    errorThreshold: number;
}

export const useRolloutWizardState = () => {
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
    const [dsSearchField, setDsSearchField] = useState<'name' | 'version' | 'description'>('name');
    const [dsTypeFilter, setDsTypeFilter] = useState<string | undefined>(undefined);
    const [filterMode] = useState<'builder'>('builder');
    const [builderState, setBuilderState] = useState<TargetFilterBuilderState>({
        allTargets: false,
        targetTypes: [],
        targetTypeMode: 'anyOf',
        tags: [],
        tagMode: 'anyOf',
    });

    const [basicInfoForm] = Form.useForm<WizardFormData>();
    const [groupSettingsForm] = Form.useForm<WizardFormData>();

    const amountGroupsValue = Form.useWatch('amountGroups', groupSettingsForm);

    useEffect(() => {
        if (filterMode === 'builder') {
            const timer = setTimeout(() => {
                const fiql = buildTargetFilter(builderState);
                setFormData((prev) => ({ ...prev, targetFilterQuery: fiql }));
            }, 500);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [builderState, filterMode]);

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

    const { data: dsTypesData, isLoading: dsTypesLoading } = useGetDistributionSetTypes({ limit: 100 });
    const { data: dsData, isLoading: dsLoading } = useGetDistributionSets({
        limit: 50,
        q: dsQuery || undefined,
    });

    const { data: targetTagsData, isLoading: targetTagsLoading } = useGetTargetTags({ limit: 200 });
    const { data: targetTypesData, isLoading: targetTypesLoading } = useGetTargetTypes({ limit: 200 });

    const { data: targetsData, isLoading: isLoadingTargets, refetch: refetchTargets } = useGetTargets(
        {
            q: formData.targetFilterQuery === 'controllerId==*' ? undefined : formData.targetFilterQuery,
            limit: 100,
        },
        {
            query: {
                enabled: false,
            },
        }
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.targetFilterQuery || builderState.allTargets) {
                refetchTargets();
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.targetFilterQuery, builderState.allTargets, refetchTargets]);

    return {
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
        refetchTargets,
    };
};
