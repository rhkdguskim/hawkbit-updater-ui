import React, { useState, useCallback } from 'react';
import { Button, Popover, Divider, Space } from 'antd';
import { PlusOutlined, ClearOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FilterChip } from './FilterChip';
import { FilterCondition, type FilterField, type FilterConditionValue } from './FilterCondition';
import { SavedFilterDropdown } from './SavedFilterDropdown';
import { ColumnCustomizer, type ColumnOption } from './ColumnCustomizer';
import { CloseOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { type ToolbarAction } from '../EnhancedTable/SelectionToolbar';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`;

const FiltersSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    flex: 1;
`;

const ActionsSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ChipsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
`;

export interface FilterValue {
    id: string;
    field: string;
    fieldLabel: string;
    operator: string;
    operatorLabel: string;
    value: string | number | boolean;
    displayValue: string;
}

export interface SelectionInfo {
    count: number;
    actions: ToolbarAction[];
    onClear: () => void;
    label?: string;
}

export interface FilterBuilderProps {
    fields: FilterField[];
    filters: FilterValue[];
    onFiltersChange: (filters: FilterValue[]) => void;
    onRefresh?: () => void;
    onAdd?: () => void;
    canAdd?: boolean;
    addLabel?: string;
    loading?: boolean;
    extra?: React.ReactNode;
    onApplySavedFilter?: (query: string, name?: string) => void;
    onManageSavedFilters?: () => void;
    buildQuery?: (filters: FilterValue[]) => string;

    columns?: ColumnOption[];
    visibleColumns?: string[];
    onVisibilityChange?: (columns: string[]) => void;

    // Global Search
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    hideSearchInput?: boolean;

    // Selection integration
    selection?: SelectionInfo;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
    fields,
    filters,
    onFiltersChange,
    onRefresh,
    onAdd,
    canAdd = true,
    addLabel,
    loading = false,
    extra,
    onApplySavedFilter,
    onManageSavedFilters,
    buildQuery,
    columns,
    visibleColumns,
    onVisibilityChange,
    selection,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    hideSearchInput = false,
}) => {
    const { t } = useTranslation('common');
    const { t: tActions } = useTranslation('common'); // Or just use t since it's already common
    const [conditionOpen, setConditionOpen] = useState(false);

    const operatorLabels: Record<string, string> = React.useMemo(() => ({
        'equals': t('filter.operators.equals', { defaultValue: '=' }),
        'notEquals': t('filter.operators.notEquals', { defaultValue: '≠' }),
        'greaterThan': t('filter.operators.gt', { defaultValue: '>' }),
        'greaterThanOrEquals': t('filter.operators.gte', { defaultValue: '≥' }),
        'lessThan': t('filter.operators.lt', { defaultValue: '<' }),
        'lessThanOrEquals': t('filter.operators.lte', { defaultValue: '≤' }),
        'contains': t('filter.contains', { defaultValue: 'contains' }),
        'startsWith': t('filter.startsWith', { defaultValue: 'starts with' }),
        'endsWith': t('filter.endsWith', { defaultValue: 'ends with' }),
        'before': t('filter.before', { defaultValue: 'before' }),
        'after': t('filter.after', { defaultValue: 'after' }),
    }), [t]);

    const handleAddFilter = useCallback((condition: FilterConditionValue) => {
        const field = fields.find(f => f.key === condition.field);
        if (!field || condition.value === null) return;

        let displayValue = String(condition.value);
        if (field.type === 'select' && field.options) {
            const option = field.options.find(o => o.value === condition.value);
            displayValue = option?.label || displayValue;
        } else if (field.type === 'boolean') {
            displayValue = condition.value === 'true' || condition.value === true ? t('yes') : t('no');
        }

        const newFilter: FilterValue = {
            id: `${condition.field}-${Date.now()}`,
            field: condition.field,
            fieldLabel: field.label,
            operator: condition.operator,
            operatorLabel: operatorLabels[condition.operator] || condition.operator,
            value: condition.value,
            displayValue,
        };

        const nextFilters = [...filters, newFilter];

        if (buildQuery) {
            // Skip confirmation and apply immediately
            onFiltersChange(nextFilters);
        } else {
            onFiltersChange(nextFilters);
        }
        setConditionOpen(false);
    }, [fields, filters, onFiltersChange, operatorLabels, t, buildQuery]);

    const handleRemoveFilter = useCallback((id: string) => {
        const nextFilters = filters.filter(f => f.id !== id);
        onFiltersChange(nextFilters);
    }, [filters, onFiltersChange]);

    const handleClearAll = useCallback(() => {
        onFiltersChange([]);
    }, [onFiltersChange]);


    return (
        <Container>
            <HeaderRow>
                <FiltersSection>
                    <Popover
                        content={
                            <FilterCondition
                                fields={fields}
                                onApply={handleAddFilter}
                            />
                        }
                        trigger="click"
                        open={conditionOpen}
                        onOpenChange={setConditionOpen}
                        placement="bottomLeft"
                    >
                        <Button
                            icon={<PlusOutlined />}
                            size="middle"
                            type="default"
                            style={{
                                borderRadius: '8px',
                                borderStyle: 'dashed',
                                borderColor: 'var(--ant-color-primary)',
                                color: 'var(--ant-color-primary)',
                                fontWeight: 500,
                            }}
                        >
                            {t('filter.addFilter')}
                        </Button>
                    </Popover>

                    {onApplySavedFilter && (
                        <SavedFilterDropdown
                            onApply={(f) => onApplySavedFilter(f.query || '', f.name)}
                            onManageClick={onManageSavedFilters}
                        />
                    )}


                    {!hideSearchInput && (
                        <Input
                            placeholder={searchPlaceholder || t('actions.search')}
                            prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-description)' }} />}
                            size="middle"
                            allowClear
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            style={{
                                width: 320,
                                borderRadius: 8,
                                background: 'var(--bg-container)',
                                border: '1px solid var(--border-color)',
                            }}
                        />
                    )}

                    {!hideSearchInput && filters.length > 0 && (
                        <Divider type="vertical" style={{ height: 20 }} />
                    )}

                    {filters.length > 0 && (
                        <>
                            <ChipsContainer>
                                {filters.map((filter) => (
                                    <FilterChip
                                        key={filter.id}
                                        field={filter.fieldLabel}
                                        operator={filter.operatorLabel}
                                        value={filter.displayValue}
                                        onRemove={() => handleRemoveFilter(filter.id)}
                                    />
                                ))}
                            </ChipsContainer>
                            <Button
                                type="text"
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={handleClearAll}
                                style={{ fontSize: 'var(--ant-font-size-sm)' }}
                            >
                                {t('filter.clear')}
                            </Button>
                        </>
                    )}
                </FiltersSection>

                <ActionsSection>
                    {extra}
                    {columns && visibleColumns && onVisibilityChange && (
                        <ColumnCustomizer
                            t={t}
                            columns={columns}
                            visibleColumns={visibleColumns}
                            onVisibilityChange={onVisibilityChange}
                        />
                    )}
                    {onRefresh && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={onRefresh}
                            loading={loading}
                            size="middle"
                            style={{ borderRadius: 8 }}
                        />
                    )}
                    {onAdd && canAdd && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            size="middle"
                        >
                            {addLabel || t('actions.add')}
                        </Button>
                    )}
                </ActionsSection>
            </HeaderRow>
            {selection && selection.count > 0 && (
                <>
                    <Divider style={{ margin: '12px 0 8px' }} />
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        background: 'rgba(var(--ant-color-primary-rgb), 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(var(--ant-color-primary-rgb), 0.2)',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{
                                fontWeight: 700,
                                color: 'var(--ant-color-primary)',
                                fontSize: 'var(--ant-font-size)',
                                letterSpacing: '-0.01em'
                            }}>
                                {selection.count} {selection.label || t('filter.selected')}
                            </span>
                            <Divider type="vertical" style={{ height: 20, borderColor: 'rgba(var(--ant-color-primary-rgb), 0.2)' }} />
                            <Space size="middle">
                                {selection.actions.map(action => (
                                    <Button
                                        key={action.key}
                                        size="middle"
                                        type={action.danger ? 'primary' : 'default'}
                                        danger={action.danger}
                                        icon={action.icon}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        style={{
                                            borderRadius: '8px',
                                            fontSize: 'var(--ant-font-size-sm)',
                                            fontWeight: 600,
                                            boxShadow: action.danger ? 'var(--shadow-sm)' : 'none'
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </Space>
                        </div>
                        <Button
                            type="text"
                            size="middle"
                            icon={<CloseOutlined />}
                            onClick={selection.onClear}
                            style={{ color: 'var(--ant-color-text-secondary)' }}
                        />
                    </div>
                </>
            )}
        </Container>
    );
};

export default FilterBuilder;
