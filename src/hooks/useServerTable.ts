import { useState, useCallback, useEffect } from 'react';
import type { TableProps } from 'antd';
import type { SorterResult, TablePaginationConfig, FilterValue } from 'antd/es/table/interface';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

interface UseServerTableProps {
    defaultPageSize?: number;
    defaultSort?: string;
    syncToUrl?: boolean;
    allowedSortFields?: string[]; // List of fields that can be sorted
}

interface PaginationState {
    current: number;
    pageSize: number;
}

export function useServerTable<T>({
    defaultPageSize = 25,
    syncToUrl = false,
    allowedSortFields,
}: UseServerTableProps = {}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const sortDisabled = Array.isArray(allowedSortFields) && allowedSortFields.length === 0;

    // Initialize state from URL if enabled
    const [pagination, setPagination] = useState<PaginationState>(() => {
        if (syncToUrl) {
            const page = parseInt(searchParams.get('page') || '1', 10);
            const size = parseInt(searchParams.get('size') || String(defaultPageSize), 10);
            return { current: page, pageSize: size };
        }
        return { current: 1, pageSize: defaultPageSize };
    });

    const [sort, setSort] = useState<string>(() => {
        if (syncToUrl) {
            if (sortDisabled) return '';
            const urlSort = searchParams.get('sort') || '';
            // Validate sort field if allowedSortFields is provided and not empty
            if (urlSort && allowedSortFields && allowedSortFields.length > 0) {
                const sortField = urlSort.split(':')[0];
                if (!allowedSortFields.includes(sortField)) {
                    return ''; // Invalid sort field, ignore it
                }
            }
            return urlSort;
        }
        return '';
    });

    const [searchQuery, setSearchQuery] = useState<string>(() => {
        if (syncToUrl) {
            return searchParams.get('q') || '';
        }
        return '';
    });

    const [globalSearch, setGlobalSearch] = useState<string>(() => {
        if (syncToUrl) {
            return searchParams.get('search') || '';
        }
        return '';
    });

    // Debounce global search to optimize API calls
    const debouncedGlobalSearch = useDebounce(globalSearch, 500);

    // Sync state to URL
    useEffect(() => {
        if (!syncToUrl) return;

        const newParams = new URLSearchParams(searchParams);

        if (pagination.current !== 1) newParams.set('page', String(pagination.current));
        else newParams.delete('page');

        if (pagination.pageSize !== defaultPageSize) newParams.set('size', String(pagination.pageSize));
        else newParams.delete('size');

        if (sort) newParams.set('sort', sort);
        else newParams.delete('sort');

        if (searchQuery) newParams.set('q', searchQuery);
        else newParams.delete('q');

        if (globalSearch) newParams.set('search', globalSearch);
        else newParams.delete('search');

        setSearchParams(newParams, { replace: true });
    }, [pagination, sort, searchQuery, globalSearch, syncToUrl, searchParams, setSearchParams, defaultPageSize]);

    const offset = (pagination.current - 1) * pagination.pageSize;

    const handleTableChange: TableProps<T>['onChange'] = useCallback((
        newPagination: TablePaginationConfig,
        _filters: Record<string, FilterValue | null>,
        sorter: SorterResult<T> | SorterResult<T>[]
    ) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || prev.pageSize,
        }));

        if (sortDisabled) {
            setSort('');
            return;
        }

        if (Array.isArray(sorter)) {
            // Handle multiple sorters not implemented for this simple hook yet
        } else if (sorter.field && sorter.order) {
            const field = sorter.field as string;
            if (allowedSortFields && allowedSortFields.length > 0 && !allowedSortFields.includes(field)) {
                setSort('');
                return;
            }
            const order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
            setSort(`${field}:${order}`);
        } else {
            setSort('');
        }
    }, [allowedSortFields, sortDisabled]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    // Helper to reset pagination when external filters change
    const resetPagination = useCallback(() => {
        setPagination((prev) => ({ ...prev, current: 1 }));
    }, []);

    return {
        pagination,
        offset,
        sort,
        searchQuery,
        setSearchQuery,
        globalSearch,
        setGlobalSearch,
        debouncedGlobalSearch,
        handleTableChange,
        handleSearch,
        resetPagination,
        setPagination,
    };
}
