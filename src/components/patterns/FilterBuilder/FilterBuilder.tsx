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
    gap: 8px;
    padding: 12px 16px;
    background: var(--ant-color-bg-container, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06));
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
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
}) => {
    const { t } = useTranslation('common');
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
                            size="small"
                            type="default"
                            style={{
                                borderColor: 'var(--ant-color-primary, #1677ff)',
                                color: 'var(--ant-color-primary, #1677ff)',
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

                    <Input
                        placeholder={searchPlaceholder || t('actions.search')}
                        prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-description)' }} />}
                        size="small"
                        allowClear
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        style={{ width: 220, borderRadius: 6 }}
                    />

                    {filters.length > 0 && (
                        <>
                            <Divider type="vertical" style={{ height: 20 }} />
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
                                style={{ fontSize: 12 }}
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
                            size="small"
                        />
                    )}
                    {onAdd && canAdd && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            size="small"
                        >
                            {addLabel || t('actions.add')}
                        </Button>
                    )}
                </ActionsSection>
            </HeaderRow>
            {selection && selection.count > 0 && (
                <>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        background: 'var(--ant-color-primary-bg, #e6f4ff)',
                        borderRadius: '6px',
                        border: '1px solid var(--ant-color-primary-border, #91caff)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontWeight: 600, color: 'var(--ant-color-primary, #1677ff)', fontSize: 13 }}>
                                {selection.count} {selection.label || t('filter.selected')}
                            </span>
                            <Divider type="vertical" />
                            <Space size="small">
                                {selection.actions.map(action => (
                                    <Button
                                        key={action.key}
                                        size="small"
                                        type={action.danger ? 'primary' : 'default'}
                                        danger={action.danger}
                                        icon={action.icon}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        style={{ fontSize: 12 }}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </Space>
                        </div>
                        <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={selection.onClear}
                        />
                    </div>
                </>
            )}
        </Container>
    );
};

export default FilterBuilder;
