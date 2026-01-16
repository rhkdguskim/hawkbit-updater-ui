/**
 * FIQL (Feed Item Query Language) Query Builder Utility
 *
 * hawkBit uses FIQL (also known as RSQL) for filtering.
 * This utility provides a standardized way to build FIQL queries.
 */

export type FiqlOperator = '==' | '!=' | '=lt=' | '=le=' | '=gt=' | '=ge=' | '=in=' | '=out=' | '=like=';

export interface FiqlCondition {
    field: string;
    operator: FiqlOperator;
    value: string | number | boolean | (string | number)[];
}

export interface FiqlFilterValue {
    field: string;
    operator: string;
    value: string | number | boolean;
}

export interface BuildFiqlOptions {
    fieldMap?: Record<string, string>;
    rawFields?: string[];
    customCondition?: (filter: FiqlFilterValue) => string | undefined;
}

/**
 * Escapes special characters in FIQL values.
 * RSQL reserves: " ' ( ) ; , < > = ! ~ space
 */
export const escapeValue = (value: string): string => {
    // If simple alphanumeric, return as is
    if (/^[a-zA-Z0-9.\-_]+$/.test(value)) {
        return value;
    }

    // Check if reliable Double Quote escaping is needed
    // Standard RSQL: "value"
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
};

/**
 * Formats a single value for FIQL query.
 */
const formatValue = (value: string | number | boolean): string => {
    if (typeof value === 'boolean') {
        return String(value);
    }
    if (typeof value === 'number') {
        return String(value);
    }
    return escapeValue(String(value));
};

/**
 * Builds a single FIQL condition string.
 */
export const buildCondition = (condition: FiqlCondition): string => {
    const { field, operator, value } = condition;

    if (Array.isArray(value)) {
        // For 'in' and 'out' operators
        const formattedValues = value.map(v => formatValue(v)).join(',');
        return `${field}${operator}(${formattedValues})`;
    }

    return `${field}${operator}${formatValue(value)}`;
};

/**
 * Builds a wildcard search query for a specific field.
 */
export const buildWildcardSearch = (field: string, value: string): string => {
    if (!value.trim()) return '';
    const trimmed = value.trim();
    // Wrap with wildcards
    const fullValue = `*${trimmed}*`;
    // Use escapeValue to handle special characters and quoting
    return `${field}==${escapeValue(fullValue)}`;
};

/**
 * Wraps a query string in parentheses if it contains logical operators.
 * This is crucial when mixing AND (;) and OR (,) to enforce precedence.
 */
export const group = (query: string): string => {
    if (!query) return '';
    if (query.match(/[;,]/) && !query.startsWith('(')) {
        return `(${query})`;
    }
    return query;
};

/**
 * Combines multiple FIQL conditions with AND (;) operator.
 */
export const combineWithAnd = (conditions: string[]): string => {
    const validConditions = conditions.filter(c => c && c.trim());
    if (validConditions.length === 0) return '';
    return validConditions.join(';');
};

/**
 * Combines multiple FIQL conditions with OR (,) operator.
 */
export const combineWithOr = (conditions: string[]): string => {
    const validConditions = conditions.filter(c => c && c.trim());
    if (validConditions.length === 0) return '';
    return validConditions.join(',');
};

/**
 * Helper to safely combine a main query with additional required filters (AND).
 * Ensures the main query is grouped if it looks complex.
 */
export const appendFilter = (baseQuery: string | undefined, filterCondition: string): string => {
    if (!baseQuery) return filterCondition;
    if (!filterCondition) return baseQuery;

    // Group base query if needed
    const safeBase = group(baseQuery);
    return `${safeBase};${filterCondition}`;
};

/**
 * Builds a complete FIQL query from a filter object.
 */
export const buildQueryFromFilters = (
    filters: Record<string, string | undefined>,
    options: { wildcardFields?: string[] } = {}
): string => {
    const { wildcardFields = [] } = options;
    const conditions: string[] = [];

    Object.entries(filters).forEach(([field, value]) => {
        if (value && value.trim()) {
            if (wildcardFields.includes(field)) {
                conditions.push(buildWildcardSearch(field, value));
            } else {
                conditions.push(buildCondition({ field, operator: '==', value }));
            }
        }
    });

    return combineWithAnd(conditions);
};

const mapFilterOperator = (operator: string): FiqlOperator => {
    switch (operator) {
        case 'notEquals':
            return '!=';
        case 'gt':
        case 'greaterThan':
            return '=gt=';
        case 'gte':
        case 'greaterThanOrEquals':
            return '=ge=';
        case 'lt':
        case 'lessThan':
        case 'before':
            return '=lt=';
        case 'lte':
        case 'lessThanOrEquals':
            return '=le=';
        case 'after':
            return '=gt=';
        default:
            return '==';
    }
};

const normalizeFilterValue = (operator: string, value: FiqlFilterValue['value']): FiqlFilterValue['value'] => {
    if (operator === 'contains') return `*${String(value)}*`;
    if (operator === 'startsWith') return `${String(value)}*`;
    if (operator === 'endsWith') return `*${String(value)}`;
    return value;
};

export const buildQueryFromFilterValues = (
    filters: FiqlFilterValue[],
    options: BuildFiqlOptions = {}
): string => {
    if (!filters || filters.length === 0) return '';

    const { fieldMap, rawFields, customCondition } = options;
    const rawFieldSet = rawFields ? new Set(rawFields) : null;

    const conditions = filters
        .map((filter) => {
            if (customCondition) {
                const custom = customCondition(filter);
                if (custom !== undefined) return custom;
            }

            if (rawFieldSet?.has(filter.field)) {
                return String(filter.value);
            }

            const field = fieldMap?.[filter.field] ?? filter.field;
            const operator = mapFilterOperator(filter.operator);
            const value = normalizeFilterValue(filter.operator, filter.value);

            return buildCondition({ field, operator, value });
        })
        .filter((condition): condition is string => Boolean(condition && condition.trim()));

    return conditions.reduce((acc, condition) => appendFilter(acc, condition), '');
};
