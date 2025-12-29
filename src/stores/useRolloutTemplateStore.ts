import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RolloutTemplate {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
    config: {
        amountGroups: number;
        successThreshold: number;
        errorThreshold: number;
        startImmediately: boolean;
    };
    isDefault?: boolean;
}

interface RolloutTemplateState {
    templates: RolloutTemplate[];

    // Actions
    addTemplate: (template: Omit<RolloutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => RolloutTemplate;
    updateTemplate: (id: string, updates: Partial<Omit<RolloutTemplate, 'id' | 'createdAt'>>) => void;
    deleteTemplate: (id: string) => void;
    getTemplate: (id: string) => RolloutTemplate | undefined;
    getDefaultTemplates: () => RolloutTemplate[];
}

// Default templates that come pre-installed
const DEFAULT_TEMPLATES: RolloutTemplate[] = [
    {
        id: 'default-canary',
        name: 'Canary Release',
        description: '10% → 50% → 100% (3 groups, 95% success threshold)',
        createdAt: 0,
        updatedAt: 0,
        config: {
            amountGroups: 3,
            successThreshold: 95,
            errorThreshold: 5,
            startImmediately: false,
        },
        isDefault: true,
    },
    {
        id: 'default-full',
        name: 'Full Rollout',
        description: '100% at once (1 group, 80% success threshold)',
        createdAt: 0,
        updatedAt: 0,
        config: {
            amountGroups: 1,
            successThreshold: 80,
            errorThreshold: 20,
            startImmediately: false,
        },
        isDefault: true,
    },
    {
        id: 'default-careful',
        name: 'Careful Rollout',
        description: '5% → 15% → 30% → 50% → 100% (5 groups, 99% success threshold)',
        createdAt: 0,
        updatedAt: 0,
        config: {
            amountGroups: 5,
            successThreshold: 99,
            errorThreshold: 1,
            startImmediately: false,
        },
        isDefault: true,
    },
    {
        id: 'default-staged',
        name: 'Staged Rollout',
        description: '25% → 50% → 75% → 100% (4 groups, 90% success threshold)',
        createdAt: 0,
        updatedAt: 0,
        config: {
            amountGroups: 4,
            successThreshold: 90,
            errorThreshold: 10,
            startImmediately: false,
        },
        isDefault: true,
    },
];

const generateId = () => `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useRolloutTemplateStore = create<RolloutTemplateState>()(
    persist(
        (set, get) => ({
            templates: [...DEFAULT_TEMPLATES],

            addTemplate: (templateData) => {
                const now = Date.now();
                const newTemplate: RolloutTemplate = {
                    ...templateData,
                    id: generateId(),
                    createdAt: now,
                    updatedAt: now,
                    isDefault: false,
                };

                set((state) => ({
                    templates: [...state.templates, newTemplate],
                }));

                return newTemplate;
            },

            updateTemplate: (id, updates) => {
                set((state) => ({
                    templates: state.templates.map((t) =>
                        t.id === id
                            ? { ...t, ...updates, updatedAt: Date.now() }
                            : t
                    ),
                }));
            },

            deleteTemplate: (id) => {
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id || t.isDefault),
                }));
            },

            getTemplate: (id) => {
                return get().templates.find((t) => t.id === id);
            },

            getDefaultTemplates: () => {
                return get().templates.filter((t) => t.isDefault);
            },
        }),
        {
            name: 'rollout-templates-storage',
            version: 1,
        }
    )
);
