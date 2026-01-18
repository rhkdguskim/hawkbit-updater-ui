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
import {
    SelectionBarContainer as SelectionBar,
    SelectionBarText as SelectionText,
    SelectionBarDivider as SelectionDot,
    SelectionActionButton as StyledActionButton,
    SelectionCloseButton as CloseButton
} from '../../shared/SelectionStyles';

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

const AddFilterButton = styled(Button)`
    &.ant-btn {
        border-radius: 6px;
        border-style: dashed;
        border-color: var(--ant-color-primary);
        color: var(--ant-color-primary);
        font-weight: 500;
        font-size: 13px;
        height: 32px;
        padding: 4px 12px;
        transition: all 0.2s ease;

        &:hover {
            border-style: solid;
            background: rgba(var(--color-primary-rgb), 0.08);
            transform: translateY(-1px);
        }
    }
`;

const SearchInput = styled(Input)`
    &.ant-input-affine-wrapper {
        width: 260px;
        height: 32px;
        border-radius: 6px;
        background: var(--bg-container);
        border: 1px solid var(--border-color);
        transition: all 0.2s ease;
        font-size: 13px;

        &:hover, &:focus-within {
            border-color: var(--ant-color-primary);
            box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
        }
    }
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
        onFiltersChange(nextFilters);
        setConditionOpen(false);
    }, [fields, filters, onFiltersChange, operatorLabels, t]);

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
                        <AddFilterButton
                            icon={<PlusOutlined />}
                            size="small"
                            type="default"
                        >
                            {t('filter.addFilter')}
                        </AddFilterButton>
                    </Popover>

                    {onApplySavedFilter && (
                        <SavedFilterDropdown
                            onApply={(f) => onApplySavedFilter(f.query || '', f.name)}
                            onManageClick={onManageSavedFilters}
                        />
                    )}


                    {!hideSearchInput && (
                        <SearchInput
                            placeholder={searchPlaceholder || t('actions.search')}
                            prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
                            size="small"
                            allowClear
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    )}

                    {!hideSearchInput && filters.length > 0 && (
                        <Divider type="vertical" style={{ height: 16 }} />
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
                            icon={<ReloadOutlined style={{ fontSize: 13 }} />}
                            onClick={onRefresh}
                            loading={loading}
                            size="small"
                            style={{ borderRadius: 6, height: 32, width: 32 }}
                        />
                    )}
                    {onAdd && canAdd && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            size="small"
                            style={{
                                boxShadow: 'var(--shadow-sm)',
                                fontWeight: 600,
                                borderRadius: 6,
                                height: 28,
                                padding: '0 10px',
                                fontSize: '13px'
                            }}
                        >
                            {addLabel || t('actions.add')}
                        </Button>
                    )}
                </ActionsSection>
            </HeaderRow>
            {selection && selection.count > 0 && (
                <SelectionBar>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SelectionText>
                            {selection.count} {selection.label || t('filter.selected')}
                        </SelectionText>
                        <SelectionDot type="vertical" />
                        <Space size="middle">
                            {selection.actions.map(action => (
                                <StyledActionButton
                                    key={action.key}
                                    size="middle"
                                    type={action.danger ? 'primary' : 'default'}
                                    danger={action.danger}
                                    icon={action.icon}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                >
                                    {action.label}
                                </StyledActionButton>
                            ))}
                        </Space>
                    </div>
                    <CloseButton
                        type="text"
                        size="middle"
                        icon={<CloseOutlined />}
                        onClick={selection.onClear}
                    />
                </SelectionBar>
            )}
        </Container>
    );
};

export default FilterBuilder;
