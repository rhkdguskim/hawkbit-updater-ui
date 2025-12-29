import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ApprovalRule {
    id: string;
    type: 'target_count' | 'tag' | 'target_type' | 'time_range';
    enabled: boolean;
    condition: any;
    priority: number;
}

interface ApprovalPolicyState {
    globalEnabled: boolean;
    rules: ApprovalRule[];
    setGlobalEnabled: (enabled: boolean) => void;
    toggleRule: (id: string, enabled: boolean) => void;
    updateRule: (id: string, condition: any) => void;
}

export const useApprovalPolicyStore = create<ApprovalPolicyState>()(
    persist(
        (set) => ({
            globalEnabled: true,
            rules: [
                {
                    id: 'rule-target-count',
                    type: 'target_count',
                    enabled: true,
                    condition: { threshold: 500 },
                    priority: 1,
                },
                {
                    id: 'rule-tag-production',
                    type: 'tag',
                    enabled: true,
                    condition: { tag: 'production' },
                    priority: 2,
                },
                {
                    id: 'rule-target-type-gateway',
                    type: 'target_type',
                    enabled: false,
                    condition: { targetType: 'gateway' },
                    priority: 3,
                },
                {
                    id: 'rule-time-business-hours',
                    type: 'time_range',
                    enabled: true,
                    condition: { start: '22:00', end: '06:00' },
                    priority: 4,
                },
            ],
            setGlobalEnabled: (enabled) => set({ globalEnabled: enabled }),
            toggleRule: (id, enabled) =>
                set((state) => ({
                    rules: state.rules.map((r) => (r.id === id ? { ...r, enabled } : r)),
                })),
            updateRule: (id, condition) =>
                set((state) => ({
                    rules: state.rules.map((r) => (r.id === id ? { ...r, condition } : r)),
                })),
        }),
        {
            name: 'approval-policy-storage',
        }
    )
);
