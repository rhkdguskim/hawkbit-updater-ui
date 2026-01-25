import { useCallback, useState } from 'react';
import type { Key } from 'react';
import { axiosInstance } from '@/api/axios-instance';
import type { MgmtTarget, PagedListMgmtTarget } from '@/api/generated/model';

type UseTargetBulkActionsParams = {
    buildFinalQuery: () => string;
    totalTargets: number;
    onError: () => void;
};

export const useTargetBulkActions = ({ buildFinalQuery, totalTargets, onError }: UseTargetBulkActionsParams) => {
    const [selectedTargetIds, setSelectedTargetIds] = useState<Key[]>([]);
    const [isAllMatchingSelected, setIsAllMatchingSelected] = useState(false);
    const [isFetchingAllIds, setIsFetchingAllIds] = useState(false);

    const handleSelectAllMatching = useCallback(async () => {
        setIsFetchingAllIds(true);
        try {
            const response = await axiosInstance<PagedListMgmtTarget>({
                url: `/rest/v1/targets`,
                method: 'GET',
                params: {
                    limit: 1000,
                    q: buildFinalQuery() || undefined,
                },
            });
            const allIds = response.content?.map((target: MgmtTarget) => target.controllerId) || [];
            setSelectedTargetIds(allIds);
            setIsAllMatchingSelected(true);
        } catch {
            onError();
        } finally {
            setIsFetchingAllIds(false);
        }
    }, [buildFinalQuery, onError]);

    const handleSelectionChange = useCallback((keys: Key[]) => {
        setSelectedTargetIds(keys);
        if (keys.length === 0 || keys.length < totalTargets) {
            setIsAllMatchingSelected(false);
        }
    }, [totalTargets]);

    return {
        selectedTargetIds,
        setSelectedTargetIds,
        isAllMatchingSelected,
        setIsAllMatchingSelected,
        isFetchingAllIds,
        handleSelectAllMatching,
        handleSelectionChange,
    };
};
