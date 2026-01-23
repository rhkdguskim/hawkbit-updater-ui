import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  useUpdateTarget,
  useDeleteTarget,
  usePostAssignedDistributionSet,
  useActivateAutoConfirm,
  useDeactivateAutoConfirm,
  useCreateMetadata,
  useUpdateMetadata,
  useDeleteMetadata,
  getGetTargetQueryKey,
  getGetMetadataQueryKey,
} from '@/api/generated/targets/targets';
import { useNotification } from '@/hooks/useNotification';
import type { MgmtDistributionSetAssignment, MgmtDistributionSetAssignments } from '@/api/generated/model';

interface UseTargetMutationsProps {
  targetId: string | undefined;
  targetData?: { name?: string };
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onAssignSuccess?: () => void;
  onMetadataSuccess?: () => void;
}

export interface AssignDSPayload {
  dsId: number;
  type: string;
  confirmationRequired?: boolean;
  weight?: number;
  forcetime?: number;
  maintenanceWindow?: {
    schedule?: string;
    duration?: string;
    timezone?: string;
  };
}

export const useTargetMutations = ({
  targetId,
  targetData,
  onUpdateSuccess,
  onDeleteSuccess,
  onAssignSuccess,
  onMetadataSuccess,
}: UseTargetMutationsProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['targets', 'common']);
  const notification = useNotification();

  const updateTargetMutation = useUpdateTarget({
    mutation: {
      onSuccess: () => {
        notification.success(t('messages.updateSuccess'));
        queryClient.invalidateQueries({ queryKey: getGetTargetQueryKey(targetId) });
        onUpdateSuccess?.();
      },
      onError: (error) => {
        notification.error(error);
      },
    },
  });

  return {
    mutations: { updateTarget: updateTargetMutation },
    handlers: {},
  };
};
