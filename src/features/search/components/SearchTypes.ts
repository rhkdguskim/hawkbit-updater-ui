export interface SearchableItem {
    id?: number;
    controllerId?: string;
    name?: string;
    description?: string;
    version?: string;
    status?: string;
    type?: string;
    targetType?: number | { name?: string };
    targetTypeName?: string;
    colour?: string;
    key?: string;
}

export interface PagedListGeneric {
    content: SearchableItem[];
    total?: number;
}

export interface CategoryColor {
    bg: string;
    icon: string;
}

export interface InfiniteSearchResultsProps {
    query: string;
    useHook: (params: Record<string, unknown>, options: Record<string, unknown>) => {
        data?: { pages: PagedListGeneric[] };
        fetchNextPage: () => void;
        hasNextPage?: boolean;
        isFetchingNextPage: boolean;
        isLoading: boolean;
    };
    handleNavigate: (path: string) => void;
    pathPrefix: string;
    icon: React.ReactNode;
    searchQueryStr: string;
    isEnabled: boolean;
    categoryColor: CategoryColor;
}

export interface GlobalSearchModalProps {
    open: boolean;
    onClose: () => void;
    initialQuery?: string;
}
