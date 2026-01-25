import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Spin, Tag, Badge } from 'antd';
import { MdSearch } from 'react-icons/md';
import type { InfiniteSearchResultsProps, PagedListGeneric } from './SearchTypes';
import {
    ScrollableContent,
    CategoryHeader,
    CategoryTitle,
    ResultCard,
    IconWrapper,
    ResultInfo,
    ResultTitle,
    ResultSubtitle,
    ResultMeta,
    EmptyState,
    EmptyIcon,
    LoadingWrapper,
} from './GlobalSearchStyles';

const { Text } = Typography;

export const InfiniteSearchResults: React.FC<InfiniteSearchResultsProps> = ({
    query,
    useHook,
    handleNavigate,
    pathPrefix,
    icon,
    searchQueryStr,
    isEnabled,
    categoryColor
}) => {
    const { t } = useTranslation('common');
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useHook(
        { q: searchQueryStr, limit: 20 },
        {
            query: {
                enabled: !!query && isEnabled,
                staleTime: 0,
                initialPageParam: 0,
                getNextPageParam: (lastPage: PagedListGeneric, allPages: PagedListGeneric[]) => {
                    const fetchedCount = allPages.flatMap((p) => p.content).length;
                    const total = lastPage.total || 0;
                    return fetchedCount < total ? fetchedCount : undefined;
                }
            }
        }
    );

    const items = data?.pages.flatMap((page) => page.content) || [];
    const total = data?.pages[0]?.total || 0;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    if (isLoading) {
        return <LoadingWrapper><Spin size="large" /></LoadingWrapper>;
    }

    if (items.length === 0) {
        return (
            <EmptyState>
                <EmptyIcon><MdSearch /></EmptyIcon>
                <Text type="secondary">{t('search.noResults')}</Text>
            </EmptyState>
        );
    }

    return (
        <ScrollableContent onScroll={handleScroll}>
            <CategoryHeader>
                <CategoryTitle>
                    <Badge count={total} style={{ backgroundColor: categoryColor.icon }} />
                    <span>{t('search.results')}</span>
                </CategoryTitle>
            </CategoryHeader>
            {items.map((item, index) => (
                <ResultCard
                    key={item.id || item.controllerId || index}
                    $isClickable
                    onClick={() => handleNavigate(`${pathPrefix}/${item.controllerId || item.id}`)}
                >
                    <IconWrapper $bgColor={categoryColor.bg} $iconColor="white">{icon}</IconWrapper>
                    <ResultInfo>
                        <ResultTitle>{item.name || item.controllerId}</ResultTitle>
                        <ResultSubtitle>{item.description || item.version || item.controllerId}</ResultSubtitle>
                    </ResultInfo>
                    <ResultMeta>
                        <Tag style={{ marginRight: 0, borderRadius: 6 }}>
                            {item.status || item.type || item.targetTypeName || t('common:labels.notAvailable')}
                        </Tag>
                    </ResultMeta>
                </ResultCard>
            ))}
            {isFetchingNextPage && <LoadingWrapper><Spin size="small" /></LoadingWrapper>}
        </ScrollableContent>
    );
};
