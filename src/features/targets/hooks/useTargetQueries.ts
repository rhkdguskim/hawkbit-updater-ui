import { useMemo } from 'react';
import {
  useGetTarget,
  useGetAttributes,
  useGetActionHistory,
  useGetMetadata,
  useGetTags,
  useGetInstalledDistributionSet,
  useGetAssignedDistributionSet,
  useGetAutoConfirmStatus,
} from '@/api/generated/targets/targets';
import { useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { POLLING_INTERVALS } from '@/constants/config';

interface UseTargetQueriesProps {
  targetId: string | undefined;
  activeTab: string;
  assignModalOpen: boolean;
  dsSearch: string;
  onlyCompatible: boolean;
  targetTypeName?: string;
}

/**
 * Custom hook to manage all target-related queries
 * Implements lazy loading based on active tab
 */
export const useTargetQueries = ({
  targetId,
  activeTab,
  assignModalOpen,
  dsSearch,
  onlyCompatible,
  targetTypeName,
}: UseTargetQueriesProps) => {
  // Main target data - always loaded
  const targetQuery = useGetTarget(targetId!, {
    query: {
      enabled: !!targetId,
      refetchInterval: POLLING_INTERVALS.TARGET_INFO,
    },
  });

  // Tab-specific queries - lazy loaded
  const attributesQuery = useGetAttributes(targetId!, {
    query: { enabled: !!targetId && activeTab === 'attributes' },
  });

  const actionsQuery = useGetActionHistory(
    targetId!,
    { limit: 50 },
    {
      query: {
        enabled: !!targetId && activeTab === 'actions',
        refetchInterval: POLLING_INTERVALS.ACTION_HISTORY,
      },
    }
  );

  const metadataQuery = useGetMetadata(
    targetId!,
    { limit: 100 },
    { query: { enabled: !!targetId && activeTab === 'metadata' } }
  );

  const tagsQuery = useGetTags(targetId!, {
    query: { enabled: !!targetId && activeTab === 'tags' },
  });

  const installedDSQuery = useGetInstalledDistributionSet(targetId!, {
    query: {
      enabled: !!targetId && activeTab === 'distribution',
      refetchInterval: POLLING_INTERVALS.DISTRIBUTION_SET,
    },
  });

  const assignedDSQuery = useGetAssignedDistributionSet(targetId!, {
    query: {
      enabled: !!targetId && activeTab === 'distribution',
      refetchInterval: POLLING_INTERVALS.DISTRIBUTION_SET,
    },
  });

  const autoConfirmQuery = useGetAutoConfirmStatus(targetId!, {
    query: { enabled: !!targetId },
  });

  // Distribution sets query for assignment modal
  const dsQuery = useMemo(() => {
    let query = '';
    if (onlyCompatible && targetTypeName) {
      query += `type.key==${targetTypeName}`;
    }
    if (dsSearch) {
      if (query) query += ';';
      query += `(name==*${dsSearch}*,version==*${dsSearch}*)`;
    }
    return query;
  }, [onlyCompatible, targetTypeName, dsSearch]);

  const distributionSetsQuery = useGetDistributionSets(
    { limit: 100, q: dsQuery || undefined },
    { query: { enabled: assignModalOpen } }
  );

  return {
    target: targetQuery,
    attributes: attributesQuery,
    actions: actionsQuery,
    metadata: metadataQuery,
    tags: tagsQuery,
    installedDS: installedDSQuery,
    assignedDS: assignedDSQuery,
    autoConfirm: autoConfirmQuery,
    distributionSets: distributionSetsQuery,
  };
};
