import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FilterValue } from '@/components/patterns';

interface PageFilterState {
    filters: FilterValue[];
    quickFilter: string;
    visibleColumns: string[];
}

interface ListFilterState {
    targets: PageFilterState;
    actions: PageFilterState;
    distributions: PageFilterState;
    softwareModules: PageFilterState;
    rollouts: PageFilterState;
    targetTags: PageFilterState;
    targetTypes: PageFilterState;
    distributionSetTags: PageFilterState;
    distributionSetTypes: PageFilterState;
    softwareModuleTypes: PageFilterState;

    // Setters
    setTargets: (state: Partial<PageFilterState>) => void;
    setActions: (state: Partial<PageFilterState>) => void;
    setDistributions: (state: Partial<PageFilterState>) => void;
    setSoftwareModules: (state: Partial<PageFilterState>) => void;
    setRollouts: (state: Partial<PageFilterState>) => void;
    setTargetTags: (state: Partial<PageFilterState>) => void;
    setTargetTypes: (state: Partial<PageFilterState>) => void;
    setDistributionSetTags: (state: Partial<PageFilterState>) => void;
    setDistributionSetTypes: (state: Partial<PageFilterState>) => void;
    setSoftwareModuleTypes: (state: Partial<PageFilterState>) => void;

    // Reset
    resetPage: (page: keyof Omit<ListFilterState, 'setTargets' | 'setActions' | 'setDistributions' | 'setSoftwareModules' | 'setRollouts' | 'resetPage'>) => void;
}

const initialPageState: PageFilterState = {
    filters: [],
    quickFilter: 'all',
    visibleColumns: [],
};

// Target default visible columns
const targetDefaultColumns = [
    'name', 'ipAddress', 'targetType', 'tags', 'status', 'updateStatus', 'installedDS', 'lastControllerRequestAt'
];

// Distribution Set default visible columns
const dsDefaultColumns = [
    'name', 'version', 'type', 'completeness', 'description', 'lastModified'
];

// Software Module default visible columns
const smDefaultColumns = [
    'name', 'version', 'type', 'vendor', 'description'
];

export const useListFilterStore = create<ListFilterState>()(
    persist(
        (set) => ({
            targets: { ...initialPageState, visibleColumns: targetDefaultColumns },
            actions: { ...initialPageState, visibleColumns: ['target', 'status', 'type', 'distributionSet', 'createdAt', 'actions'] },
            distributions: { ...initialPageState, visibleColumns: dsDefaultColumns },
            softwareModules: { ...initialPageState, visibleColumns: smDefaultColumns },
            rollouts: initialPageState,
            targetTags: initialPageState,
            targetTypes: initialPageState,
            distributionSetTags: initialPageState,
            distributionSetTypes: initialPageState,
            softwareModuleTypes: initialPageState,

            setTargets: (state) => set((s) => ({ targets: { ...s.targets, ...state } })),
            setActions: (state) => set((s) => ({ actions: { ...s.actions, ...state } })),
            setDistributions: (state) => set((s) => ({ distributions: { ...s.distributions, ...state } })),
            setSoftwareModules: (state) => set((s) => ({ softwareModules: { ...s.softwareModules, ...state } })),
            setRollouts: (state) => set((s) => ({ rollouts: { ...s.rollouts, ...state } })),
            setTargetTags: (state) => set((s) => ({ targetTags: { ...s.targetTags, ...state } })),
            setTargetTypes: (state) => set((s) => ({ targetTypes: { ...s.targetTypes, ...state } })),
            setDistributionSetTags: (state) => set((s) => ({ distributionSetTags: { ...s.distributionSetTags, ...state } })),
            setDistributionSetTypes: (state) => set((s) => ({ distributionSetTypes: { ...s.distributionSetTypes, ...state } })),
            setSoftwareModuleTypes: (state) => set((s) => ({ softwareModuleTypes: { ...s.softwareModuleTypes, ...state } })),

            resetPage: (page) => set((s) => ({
                [page]: page === 'targets'
                    ? { ...initialPageState, visibleColumns: targetDefaultColumns }
                    : page === 'distributions'
                        ? { ...initialPageState, visibleColumns: dsDefaultColumns }
                        : page === 'softwareModules'
                            ? { ...initialPageState, visibleColumns: smDefaultColumns }
                            : initialPageState
            })),
        }),
        {
            name: 'updater-list-filters-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
