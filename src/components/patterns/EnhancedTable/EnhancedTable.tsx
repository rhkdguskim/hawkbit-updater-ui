import React, { useRef, useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableProps } from 'antd';
import styled from 'styled-components';
import type { ToolbarAction } from './SelectionToolbar';

const TableContainer = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    /* Compact row heights */
    .ant-table-tbody > tr > td {
        padding: 6px 8px !important;
    }

    .ant-table-thead > tr > th {
        padding: 8px !important;
        font-size: 12px;
        font-weight: 600;
    }

    /* Row hover effects - Monday.com style */
    .ant-table-tbody > tr {
        transition: background-color 0.15s ease;

        &:hover {
            background-color: var(--ant-color-primary-bg, #e6f4ff) !important;
        }

        /* Show checkbox on hover */
        .ant-table-selection-column .ant-checkbox-wrapper {
            opacity: 0.3;
            transition: opacity 0.15s ease;
        }

        &:hover .ant-table-selection-column .ant-checkbox-wrapper,
        &.ant-table-row-selected .ant-table-selection-column .ant-checkbox-wrapper {
            opacity: 1;
        }
    }

    /* Selected row style */
    .ant-table-tbody > tr.ant-table-row-selected {
        background-color: var(--ant-color-primary-bg-hover, #bae0ff) !important;

        > td {
            background: transparent !important;
        }
    }

    /* Action cell hover effects */
    .hover-action-cell {
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    .ant-table-tbody > tr:hover .hover-action-cell {
        opacity: 1;
    }

    /* Always visible action cell (for edit/delete/view) */
    .action-cell {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    /* Table wrapper takes remaining space but allows scroll */
    .ant-table-wrapper {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    .ant-table {
        flex: 1;
        min-height: 0;
    }

    /* Ant Design's internal scroll container */
    .ant-table-body {
        flex: 1;
        
        /* Custom scrollbar styling for better visibility */
        &::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }

        &::-webkit-scrollbar-track {
            background: var(--ant-color-bg-layout, #f5f5f5);
            border-radius: 6px;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--ant-color-border, #d9d9d9);
            border-radius: 6px;
            border: 2px solid var(--ant-color-bg-layout, #f5f5f5);
            
            &:hover {
                background: var(--ant-color-primary-border, #91caff);
            }

            &:active {
                background: var(--ant-color-primary, #1677ff);
            }
        }

        /* Firefox scrollbar styling */
        scrollbar-width: auto;
        scrollbar-color: var(--ant-color-border, #d9d9d9) var(--ant-color-bg-layout, #f5f5f5);
    }

    /* Prevent tbody rows from stretching - rows should only be as tall as their content */
    .ant-table-tbody {
        & > tr {
            height: auto !important;
        }
    }

    /* Compact select dropdowns in cells */
    .ant-select-selector {
        font-size: 12px !important;
    }

    /* Editable cell styling */
    .editable-cell {
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        transition: background-color 0.15s ease;

        &:hover {
            background-color: var(--ant-color-fill-quaternary, #f5f5f5);
        }
    }
`;


export interface EnhancedTableProps<T> extends Omit<TableProps<T>, 'rowSelection'> {
    /** Selection toolbar actions */
    selectionActions?: ToolbarAction[];
    /** Selected row keys */
    selectedRowKeys?: React.Key[];
    /** Callback when selection changes */
    onSelectionChange?: (keys: React.Key[], rows: T[]) => void;
    /** Row key field */
    rowKeyField?: string;
    /** Infinite scroll: Callback to fetch next page */
    onFetchNextPage?: () => void;
    /** Infinite scroll: Whether there are more pages to fetch */
    hasNextPage?: boolean;
    /** Infinite scroll: Whether the next page is currently being fetched */
    isFetchingNextPage?: boolean;
    /** Callback when column filters/sorters change */
    onTableChange?: TableProps<T>['onChange'];
    /** Total items matching current filter (for "Select all matching" feature) */
    totalItems?: number;
    /** Callback to select all items matching current filter */
    onSelectAllMatching?: () => void;
    /** Whether all items matching filter are selected */
    isAllMatchingSelected?: boolean;
}

export function EnhancedTable<T extends object>({
    selectionActions = [],
    selectedRowKeys = [],
    onSelectionChange,
    rowKeyField = 'id',
    onFetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    onTableChange,
    totalItems,
    onSelectAllMatching,
    isAllMatchingSelected,
    loading,
    ...tableProps
}: EnhancedTableProps<T>) {
    const { t } = useTranslation('common');
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState<number | undefined>(undefined);
    const endMessageCooldownRef = useRef(false);

    const isLoading = typeof loading === 'object' ? loading.spinning : loading;

    // Handle infinite scroll
    useEffect(() => {
        if (!onFetchNextPage || !hasNextPage || isFetchingNextPage) return;

        const tableBody = containerRef.current?.querySelector('.ant-table-body');
        if (!tableBody) return;

        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

            // Trigger fetch when 50px from bottom
            if (scrollBottom < 50) {
                if (onFetchNextPage && hasNextPage && !isFetchingNextPage) {
                    onFetchNextPage();
                } else if (!hasNextPage && !isFetchingNextPage && (tableProps.dataSource?.length ?? 0) > 0) {
                    // Show "End of List" message as a toast notification
                    if (!endMessageCooldownRef.current) {
                        message.info(t('messages.noMoreData', 'End of List'));
                        endMessageCooldownRef.current = true;
                        // specific debounce time to prevent spamming
                        setTimeout(() => {
                            endMessageCooldownRef.current = false;
                        }, 2000);
                    }
                }
            }
        };

        tableBody.addEventListener('scroll', handleScroll);
        return () => {
            tableBody.removeEventListener('scroll', handleScroll);
        };
    }, [onFetchNextPage, hasNextPage, isFetchingNextPage, tableProps.dataSource?.length]);

    useEffect(() => {
        const calculateScrollHeight = () => {
            if (containerRef.current) {
                const containerHeight = containerRef.current.offsetHeight;
                // Approximate heights of elements within TableContainer:
                // SelectionToolbar: ~44px
                // Table Header: ~35px (small size)
                // Pagination: ~48px (including margins)
                const paginationHeight = tableProps.pagination !== false ? 48 : 0;
                const headerHeight = 35;
                const showFooter = isFetchingNextPage;
                const footerHeight = showFooter ? 55 : 0;

                // Subtract heights of other elements to find available space for table body
                const calculatedHeight = containerHeight - paginationHeight - headerHeight - footerHeight - 8;
                setScrollY(calculatedHeight > 100 ? calculatedHeight : undefined);
            }
        };

        // Use ResizeObserver for more reliable container size tracking
        const observer = new ResizeObserver(() => {
            calculateScrollHeight();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        // Initial calculation
        calculateScrollHeight();

        return () => {
            observer.disconnect();
        };
    }, [selectedRowKeys.length, tableProps.pagination, tableProps.dataSource?.length, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        // Handle selection clear if needed, but usually handled by parent now
    }, [selectedRowKeys.length]);

    const rowSelection: TableProps<T>['rowSelection'] = onSelectionChange
        ? {
            selectedRowKeys,
            onChange: (keys, rows) => onSelectionChange(keys, rows),
            columnWidth: 40,
        }
        : undefined;

    // Merge calculated scroll.y with user-provided scroll settings
    const scroll = {
        x: 'max-content',
        ...(scrollY && { y: scrollY }),
        ...tableProps.scroll,
    };

    const handleTableChange: TableProps<T>['onChange'] = (pagination, filters, sorter, extra) => {
        onTableChange?.(pagination, filters, sorter, extra);
        tableProps.onChange?.(pagination, filters, sorter, extra);
    };

    return (
        <TableContainer ref={containerRef}>
            <Spin spinning={!!isLoading} size="large" wrapperClassName="h-full flex flex-col">
                {selectedRowKeys.length > 0 && totalItems !== undefined && totalItems > selectedRowKeys.length && !isAllMatchingSelected && onSelectAllMatching && (
                    <div style={{
                        padding: '8px 16px',
                        background: 'var(--ant-color-primary-bg)',
                        borderBottom: '1px solid var(--ant-color-primary-border)',
                        textAlign: 'center',
                        fontSize: '13px',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        All <strong>{selectedRowKeys.length}</strong> items on this page are selected.{' '}
                        <a onClick={(e) => { e.preventDefault(); onSelectAllMatching(); }} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                            Select all {totalItems} items matching this filter
                        </a>
                    </div>
                )}
                {isAllMatchingSelected && (
                    <div style={{
                        padding: '8px 16px',
                        background: 'var(--ant-color-info-bg)',
                        borderBottom: '1px solid var(--ant-color-info-border)',
                        textAlign: 'center',
                        fontSize: '13px',
                    }}>
                        All <strong>{totalItems}</strong> items matching this filter are selected.{' '}
                        <a onClick={(e) => { e.preventDefault(); onSelectionChange?.([], []); }} style={{ fontWeight: 600 }}>
                            Clear selection
                        </a>
                    </div>
                )}
                <Table<T>
                    {...tableProps}
                    rowSelection={rowSelection}
                    rowKey={(tableProps.rowKey as string) || rowKeyField}
                    size="small"
                    scroll={scroll}
                    sticky
                    onChange={handleTableChange}
                    footer={
                        isFetchingNextPage
                            ? () => (
                                <div style={{ textAlign: 'center', padding: '12px' }}>
                                    <Spin size="small" />
                                </div>
                            )
                            : undefined
                    }
                />
            </Spin>
        </TableContainer>
    );
}

export default EnhancedTable;
