import { buildCondition, combineWithAnd, combineWithOr } from '@/utils/fiql';

export type TargetFilterBuilderState = {
    allTargets: boolean;
    targetTypes: string[];
    targetTypeMode: 'anyOf' | 'allOf';
    tags: string[];
    tagMode: 'anyOf' | 'allOf';
};

export const buildTargetFilter = (state: TargetFilterBuilderState) => {
    if (state.allTargets) {
        return 'controllerId==*';
    }

    const clauses: string[] = [];

    if (state.targetTypes.length > 0) {
        const typeConditions = state.targetTypes.map((type) =>
            buildCondition({ field: 'targettype.name', operator: '==', value: type })
        );
        if (state.targetTypeMode === 'anyOf') {
            clauses.push(`(${combineWithOr(typeConditions)})`);
        } else {
            clauses.push(combineWithAnd(typeConditions));
        }
    }

    if (state.tags.length > 0) {
        const tagConditions = state.tags.map((tag) =>
            buildCondition({ field: 'tag.name', operator: '==', value: tag })
        );
        if (state.tagMode === 'anyOf') {
            clauses.push(`(${combineWithOr(tagConditions)})`);
        } else {
            clauses.push(combineWithAnd(tagConditions));
        }
    }

    return combineWithAnd(clauses);
};
