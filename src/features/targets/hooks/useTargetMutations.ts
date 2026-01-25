import { useCallback } from 'react';
import { message } from 'antd';
import type { TFunction } from 'i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
    useDeleteTarget,
    useCreateTargets,
    useUpdateTarget,
    usePostAssignedDistributionSet,
    getGetTargetsInfiniteQueryKey,
} from '@/api/generated/targets/targets';
import type {
    MgmtTarget,
    MgmtDistributionSetAssignment,
} from '@/api/generated/model';
import type { AssignPayload } from '../components';

type UseTargetMutationsParams = {
    t: TFunction;
    targetToDelete: MgmtTarget | null;
    targetToAssign: MgmtTarget | null;
    setDeleteModalOpen: (open: boolean) => void;
    setTargetToDelete: (target: MgmtTarget | null) => void;
    setFormModalOpen: (open: boolean) => void;
    setEditingTarget: (target: MgmtTarget | null) => void;
    setAssignModalOpen: (open: boolean) => void;
    setTargetToAssign: (target: MgmtTarget | null) => void;
};

export const useTargetMutations = ({
    t,
    targetToDelete,
    targetToAssign,
    setDeleteModalOpen,
    setTargetToDelete,
    setFormModalOpen,
    setEditingTarget,
    setAssignModalOpen,
    setTargetToAssign,
}: UseTargetMutationsParams) => {
    const queryClient = useQueryClient();

    const deleteTargetMutation = useDeleteTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.deleteSuccess'));
                setDeleteModalOpen(false);
                setTargetToDelete(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
            },
            onError: (error: Error) => {
                const errMsg = error.message || t('messages.deleteFailed');
                if (errMsg.includes('409')) message.error(t('messages.conflict', { ns: 'common' }));
                else message.error(errMsg);
            },
        },
    });

    const createTargetMutation = useCreateTargets({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.createSuccess'));
                setFormModalOpen(false);
                setEditingTarget(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
            },
            onError: (error: Error) => {
                const errMsg = error.message || t('messages.createFailed');
                if (errMsg.includes('409')) message.error(t('messages.targetExists'));
                else message.error(errMsg);
            },
        },
    });

    const updateTargetMutation = useUpdateTarget({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.updateSuccess', { defaultValue: 'Target updated' }));
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
            },
            onError: (error: Error) => {
                message.error(error.message || t('messages.updateFailed', { defaultValue: 'Failed to update target' }));
            },
        },
    });

    const assignDSMutation = usePostAssignedDistributionSet({
        mutation: {
            onSuccess: () => {
                message.success(t('messages.assignSuccess'));
                setAssignModalOpen(false);
                setTargetToAssign(null);
                queryClient.invalidateQueries({ queryKey: getGetTargetsInfiniteQueryKey() });
            },
            onError: (error: Error) => {
                message.error(error.message || t('messages.error', { ns: 'common' }));
            },
        },
    });

    const handleDeleteConfirm = useCallback(() => {
        if (targetToDelete?.controllerId) {
            deleteTargetMutation.mutate({ targetId: targetToDelete.controllerId });
        }
    }, [deleteTargetMutation, targetToDelete]);

    const handleCreateTarget = useCallback((values: { controllerId?: string; name?: string; description?: string; targetType?: number }) => {
        if (values.controllerId) {
            createTargetMutation.mutate({
                data: [{ 
                    controllerId: values.controllerId, 
                    name: values.name || values.controllerId, 
                    description: values.description,
                    targetType: values.targetType,
                }],
            });
        }
    }, [createTargetMutation]);

    const handleInlineUpdate = useCallback(async (controllerId: string, newName: string) => {
        await updateTargetMutation.mutateAsync({
            targetId: controllerId,
            data: { controllerId, name: newName },
        });
    }, [updateTargetMutation]);

    const handleAssignDS = useCallback((payload: AssignPayload) => {
        if (targetToAssign?.controllerId) {
            const assignment: MgmtDistributionSetAssignment = {
                id: payload.dsId,
                type: payload.type,
                confirmationRequired: payload.confirmationRequired,
                weight: payload.weight,
                forcetime: payload.forcetime,
                maintenanceWindow: payload.maintenanceWindow,
            };
            assignDSMutation.mutate({
                targetId: targetToAssign.controllerId,
                data: [assignment],
            });
        }
    }, [assignDSMutation, targetToAssign]);

    return {
        deleteTargetMutation,
        createTargetMutation,
        updateTargetMutation,
        assignDSMutation,
        handleDeleteConfirm,
        handleCreateTarget,
        handleInlineUpdate,
        handleAssignDS,
    };
};
