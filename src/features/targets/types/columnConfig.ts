/**
 * Column Configuration Types
 * Pure data definitions without UI dependencies
 */

export interface ColumnConfig {
    key: string;
    defaultVisible: boolean;
    sortable: boolean;
    filterable: boolean;
}

// All available columns with their configuration
export const COLUMN_CONFIG: ColumnConfig[] = [
    { key: 'name', defaultVisible: true, sortable: true, filterable: true },
    { key: 'ipAddress', defaultVisible: true, sortable: false, filterable: true },
    { key: 'targetType', defaultVisible: true, sortable: false, filterable: true },
    { key: 'tags', defaultVisible: true, sortable: false, filterable: true },
    { key: 'status', defaultVisible: true, sortable: false, filterable: true },
    { key: 'updateStatus', defaultVisible: true, sortable: false, filterable: true },
    { key: 'installedDS', defaultVisible: true, sortable: false, filterable: false },
    { key: 'lastControllerRequestAt', defaultVisible: true, sortable: true, filterable: false },
    { key: 'autoConfirmActive', defaultVisible: false, sortable: false, filterable: true },
    { key: 'lastModifiedAt', defaultVisible: false, sortable: true, filterable: false },
    { key: 'createdAt', defaultVisible: false, sortable: true, filterable: false },
    { key: 'securityToken', defaultVisible: false, sortable: false, filterable: false },
    { key: 'address', defaultVisible: false, sortable: false, filterable: false },
    { key: 'actions', defaultVisible: true, sortable: false, filterable: false },
];

// Allowed sort fields for API
export const ALLOWED_SORT_FIELDS = ['name', 'controllerId', 'lastModifiedAt', 'createdAt', 'lastControllerRequestAt'];

// Filter field configuration
export interface FilterFieldConfig {
    key: string;
    type: 'text' | 'select' | 'dateRange';
    fiqlField?: string; // Optional mapping to API field
}

export const FILTER_FIELD_CONFIG: FilterFieldConfig[] = [
    { key: 'name', type: 'text' },
    { key: 'controllerId', type: 'text' },
    { key: 'ipAddress', type: 'text' },
    { key: 'description', type: 'text' },
    { key: 'targetType', type: 'select', fiqlField: 'targetTypeName' },
    { key: 'tag', type: 'select', fiqlField: 'tag' },
    { key: 'updateStatus', type: 'select' },
    { key: 'autoConfirmActive', type: 'select' },
    { key: 'status', type: 'select' },
    { key: 'createdAt', type: 'dateRange' },
    { key: 'lastModifiedAt', type: 'dateRange' },
];
