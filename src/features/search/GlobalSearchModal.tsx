import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Typography, Spin, Empty, Tabs, List, Tag, Button, Input, Badge, Tooltip } from 'antd';
import {
    MdDevices,
    MdRocketLaunch,
    MdInventory,
    MdExtension,
    MdSearch,
    MdArrowForward,
    MdLabel,
    MdCategory,
    MdMemory,
    MdApps,
} from 'react-icons/md';
import { SearchOutlined, TagsOutlined, AppstoreOutlined } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetTargetsInfinite, useGetTargets } from '@/api/generated/targets/targets';
import { useGetRolloutsInfinite, useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useGetDistributionSetsInfinite, useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetSoftwareModulesInfinite, useGetSoftwareModules } from '@/api/generated/software-modules/software-modules';
import { useGetTargetTags } from '@/api/generated/target-tags/target-tags';
import { useGetDistributionSetTags } from '@/api/generated/distribution-set-tags/distribution-set-tags';
import { useGetTargetTypes } from '@/api/generated/target-types/target-types';
import { useGetDistributionSetTypes } from '@/api/generated/distribution-set-types/distribution-set-types';
import { useGetTypes as useGetSoftwareModuleTypes } from '@/api/generated/software-module-types/software-module-types';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface GlobalSearchModalProps {
    open: boolean;
    onClose: () => void;
    initialQuery?: string;
}

// Animations
const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 var(--ant-color-primary-bg); }
    50% { box-shadow: 0 0 20px 5px var(--ant-color-primary-bg); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const StyledModal = styled(Modal)`
    .ant-modal-content {
        padding: 0;
        overflow: hidden;
        border-radius: 16px;
        background: var(--ant-color-bg-container);
        backdrop-filter: blur(20px);
        border: 1px solid var(--ant-color-border-secondary);
    }
    .ant-modal-body {
        padding: 0;
    }
    .ant-tabs-nav {
        margin-bottom: 0;
        padding: 0 20px;
        border-bottom: 1px solid var(--ant-color-border-secondary);
        background: var(--ant-color-bg-layout);
    }
    .ant-tabs-tab {
        padding: 12px 16px;
        transition: all 0.2s ease;
    }
    .ant-tabs-tab:hover {
        color: var(--ant-color-primary);
    }
    .ant-tabs-ink-bar {
        background: linear-gradient(90deg, var(--ant-color-primary), var(--ant-color-primary-hover));
        height: 3px;
        border-radius: 3px 3px 0 0;
    }
`;

const SearchHeader = styled.div`
    padding: 20px 24px;
    background: linear-gradient(135deg, var(--ant-color-bg-container) 0%, var(--ant-color-bg-layout) 100%);
    border-bottom: 1px solid var(--ant-color-border-secondary);
`;

const SearchInput = styled(Input)`
    font-size: 18px;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    
    .ant-input {
        font-size: 18px;
        background: transparent;
    }
    
    .ant-input::placeholder {
        color: var(--ant-color-text-description);
    }
`;

const ScrollableContent = styled.div`
    height: 55vh;
    overflow-y: auto;
    padding: 16px 20px 20px;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--ant-color-border-secondary);
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: var(--ant-color-text-quaternary);
    }
`;

const CategorySection = styled.div`
    margin-bottom: 24px;
    animation: ${fadeIn} 0.3s ease forwards;
`;

const CategoryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;
`;

const CategoryTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ant-color-text-secondary);
`;

const CategoryIcon = styled.div<{ $color?: string }>`
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: ${props => props.$color || 'var(--ant-color-primary-bg)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: ${props => props.$color ? 'white' : 'var(--ant-color-primary)'};
`;

const ResultCard = styled.div<{ $isClickable?: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    margin-bottom: 8px;
    cursor: ${props => props.$isClickable ? 'pointer' : 'default'};
    transition: all 0.2s ease;
    
    ${props => props.$isClickable && `
        &:hover {
            border-color: var(--ant-color-primary-border);
            background: var(--ant-color-primary-bg);
            transform: translateX(4px);
        }
    `}
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const IconWrapper = styled.div<{ $bgColor?: string; $iconColor?: string }>`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$bgColor || 'linear-gradient(135deg, var(--ant-color-primary-bg) 0%, var(--ant-color-primary-bg-hover) 100%)'};
    color: ${props => props.$iconColor || 'var(--ant-color-primary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-right: 14px;
    flex-shrink: 0;
`;

const ResultInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ResultTitle = styled(Text)`
    font-weight: 600;
    font-size: 14px;
    color: var(--ant-color-text);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ResultSubtitle = styled(Text)`
    font-size: 12px;
    color: var(--ant-color-text-description);
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ResultMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-left: 12px;
`;

const ColorDot = styled.div<{ $color?: string }>`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background: ${props => props.$color || 'var(--ant-color-text-quaternary)'};
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--ant-color-bg-layout) 0%, var(--ant-color-bg-container) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: var(--ant-color-text-quaternary);
    margin-bottom: 20px;
`;

const FooterBar = styled.div`
    padding: 10px 20px;
    background: var(--ant-color-bg-layout);
    border-top: 1px solid var(--ant-color-border-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--ant-color-text-description);
`;

const ShortcutBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--ant-color-bg-container);
    border: 1px solid var(--ant-color-border-secondary);
    font-size: 11px;
    font-weight: 500;
    margin-left: 4px;
`;

const LoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
`;

const ViewAllButton = styled(Button)`
    font-size: 12px;
    height: 28px;
    padding: 0 12px;
    border-radius: 6px;
    
    &:hover {
        transform: translateX(2px);
    }
`;

const TabBadge = styled(Badge)`
    .ant-badge-count {
        font-size: 10px;
        min-width: 18px;
        height: 18px;
        line-height: 18px;
        padding: 0 6px;
        border-radius: 9px;
    }
`;

// Category color configurations
const CATEGORY_COLORS = {
    targets: { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '#3b82f6' },
    rollouts: { bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', icon: '#f97316' },
    distSets: { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', icon: '#22c55e' },
    modules: { bg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', icon: '#a855f7' },
    targetTags: { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', icon: '#ec4899' },
    dsTags: { bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', icon: '#14b8a6' },
    targetTypes: { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', icon: '#6366f1' },
    dsTypes: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '#f59e0b' },
    smTypes: { bg: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', icon: '#84cc16' },
};

// Infinite search results component for specific tabs
const InfiniteSearchResults = ({
    query,
    useHook,
    handleNavigate,
    pathPrefix,
    icon,
    searchQueryStr,
    isEnabled,
    categoryColor
}: any) => {
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
                getNextPageParam: (lastPage: any, allPages: any[]) => {
                    const fetchedCount = allPages.flatMap((p: any) => p.content).length;
                    const total = lastPage.total || 0;
                    return fetchedCount < total ? fetchedCount : undefined;
                }
            }
        }
    );

    const items = data?.pages.flatMap((page: any) => page.content) || [];
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
                <Text type="secondary">No results found</Text>
            </EmptyState>
        );
    }

    return (
        <ScrollableContent onScroll={handleScroll}>
            <CategoryHeader>
                <CategoryTitle>
                    <Badge count={total} style={{ backgroundColor: categoryColor?.icon || 'var(--ant-color-primary)' }} />
                    <span>RESULTS</span>
                </CategoryTitle>
            </CategoryHeader>
            {items.map((item: any, index: number) => (
                <ResultCard
                    key={item.id || item.controllerId || index}
                    $isClickable
                    onClick={() => handleNavigate(`${pathPrefix}/${item.controllerId || item.id}`)}
                >
                    <IconWrapper $bgColor={categoryColor?.bg} $iconColor="white">{icon}</IconWrapper>
                    <ResultInfo>
                        <ResultTitle>{item.name || item.controllerId}</ResultTitle>
                        <ResultSubtitle>{item.description || item.version || item.controllerId}</ResultSubtitle>
                    </ResultInfo>
                    <ResultMeta>
                        <Tag style={{ marginRight: 0, borderRadius: 6 }}>
                            {item.status || item.type || item.targetType?.name || 'N/A'}
                        </Tag>
                    </ResultMeta>
                </ResultCard>
            ))}
            {isFetchingNextPage && <LoadingWrapper><Spin size="small" /></LoadingWrapper>}
        </ScrollableContent>
    );
};

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose, initialQuery = '' }) => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 300);
    const [activeTab, setActiveTab] = useState('all');

    // Sync state when open or initialQuery changes
    useEffect(() => {
        if (open) {
            setQuery(initialQuery);
            setActiveTab('all');
        }
    }, [open, initialQuery]);

    // Construct RSQL queries
    const queries = useMemo(() => {
        if (!debouncedQuery) return { targets: '', rollouts: '', distSets: '', modules: '', tags: '', types: '' };
        const q = debouncedQuery.replace(/[*;=,()]/g, '');
        return {
            targets: `(name==*${q}*,controllerId==*${q}*)`,
            rollouts: `(name==*${q}*)`,
            distSets: `(name==*${q}*,version==*${q}*)`,
            modules: `(name==*${q}*,version==*${q}*)`,
            tags: `(name==*${q}*)`,
            types: `(name==*${q}*)`
        };
    }, [debouncedQuery]);

    // Main entity queries (limit 5 for summary)
    const { data: targetsData, isLoading: targetsLoading } = useGetTargets(
        { q: queries.targets, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: rolloutsData, isLoading: rolloutsLoading } = useGetRollouts(
        { q: queries.rollouts, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: distSetsData, isLoading: distSetsLoading } = useGetDistributionSets(
        { q: queries.distSets, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: modulesData, isLoading: modulesLoading } = useGetSoftwareModules(
        { q: queries.modules, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );

    // Tag queries
    const { data: targetTagsData, isLoading: targetTagsLoading } = useGetTargetTags(
        { q: queries.tags, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: dsTagsData, isLoading: dsTagsLoading } = useGetDistributionSetTags(
        { q: queries.tags, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );

    // Type queries
    const { data: targetTypesData, isLoading: targetTypesLoading } = useGetTargetTypes(
        { q: queries.types, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: dsTypesData, isLoading: dsTypesLoading } = useGetDistributionSetTypes(
        { q: queries.types, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: smTypesData, isLoading: smTypesLoading } = useGetSoftwareModuleTypes(
        { q: queries.types, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );

    const isLoadingSummary = targetsLoading || rolloutsLoading || distSetsLoading || modulesLoading ||
        targetTagsLoading || dsTagsLoading || targetTypesLoading || dsTypesLoading || smTypesLoading;

    // Counts
    const targetsCount = targetsData?.total || 0;
    const rolloutsCount = rolloutsData?.total || 0;
    const distSetsCount = distSetsData?.total || 0;
    const modulesCount = modulesData?.total || 0;
    const targetTagsCount = targetTagsData?.total || 0;
    const dsTagsCount = dsTagsData?.total || 0;
    const targetTypesCount = targetTypesData?.total || 0;
    const dsTypesCount = dsTypesData?.total || 0;
    const smTypesCount = smTypesData?.total || 0;

    const totalResults = targetsCount + rolloutsCount + distSetsCount + modulesCount +
        targetTagsCount + dsTagsCount + targetTypesCount + dsTypesCount + smTypesCount;
    const totalTagsAndTypes = targetTagsCount + dsTagsCount + targetTypesCount + dsTypesCount + smTypesCount;

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    const renderResultCard = (
        item: any,
        pathPrefix: string,
        icon: React.ReactNode,
        categoryColor: { bg: string; icon: string },
        showColor?: boolean
    ) => (
        <ResultCard
            key={item.id}
            $isClickable
            onClick={() => handleNavigate(`${pathPrefix}/${item.id}`)}
        >
            <IconWrapper $bgColor={categoryColor.bg} $iconColor="white">{icon}</IconWrapper>
            <ResultInfo>
                <ResultTitle>{item.name}</ResultTitle>
                <ResultSubtitle>{item.description || t('noDescription')}</ResultSubtitle>
            </ResultInfo>
            <ResultMeta>
                {showColor && item.colour && <ColorDot $color={item.colour} />}
                {item.key && <Tag style={{ marginRight: 0, borderRadius: 6 }}>{item.key}</Tag>}
            </ResultMeta>
        </ResultCard>
    );

    const renderCategory = (
        title: string,
        count: number,
        data: any[],
        pathPrefix: string,
        icon: React.ReactNode,
        categoryColor: { bg: string; icon: string },
        tabKey?: string,
        showColor?: boolean
    ) => {
        if (!data || data.length === 0) return null;
        return (
            <CategorySection>
                <CategoryHeader>
                    <CategoryTitle>
                        <CategoryIcon $color={categoryColor.icon}>{icon}</CategoryIcon>
                        {title}
                        <Badge count={count} style={{ backgroundColor: categoryColor.icon }} />
                    </CategoryTitle>
                    {count > 5 && tabKey && (
                        <ViewAllButton type="link" size="small" onClick={() => setActiveTab(tabKey)}>
                            {t('labels.viewAll')} <MdArrowForward />
                        </ViewAllButton>
                    )}
                </CategoryHeader>
                {data.map((item: any) => renderResultCard(item, pathPrefix, icon, categoryColor, showColor))}
            </CategorySection>
        );
    };

    // Tab items configuration
    const tabItems = [
        {
            key: 'all',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t('search.tabs.all', { defaultValue: 'All Results' })}
                    {debouncedQuery && <TabBadge count={totalResults} overflowCount={999} />}
                </span>
            ),
            children: (
                <ScrollableContent>
                    {isLoadingSummary ? (
                        <LoadingWrapper><Spin size="large" /></LoadingWrapper>
                    ) : !debouncedQuery ? (
                        <EmptyState>
                            <EmptyIcon><MdSearch /></EmptyIcon>
                            <Title level={5} style={{ marginBottom: 8, color: 'var(--ant-color-text-secondary)' }}>
                                {t('search.startTyping', { defaultValue: 'Type to search...' })}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                {t('search.description', { defaultValue: 'Search across Targets, Rollouts, Distributions, Tags and Types' })}
                            </Text>
                        </EmptyState>
                    ) : totalResults === 0 ? (
                        <EmptyState>
                            <EmptyIcon><MdSearch /></EmptyIcon>
                            <Title level={5} style={{ marginBottom: 8, color: 'var(--ant-color-text-secondary)' }}>
                                {t('search.noResults', { defaultValue: 'No results found' })}
                            </Title>
                            <Text type="secondary">Try different keywords</Text>
                        </EmptyState>
                    ) : (
                        <>
                            {/* Main Entities */}
                            {renderCategory(t('nav.targets'), targetsCount, targetsData?.content || [], '/targets', <MdDevices />, CATEGORY_COLORS.targets, 'targets')}
                            {renderCategory(t('nav.rollouts'), rolloutsCount, rolloutsData?.content || [], '/rollouts', <MdRocketLaunch />, CATEGORY_COLORS.rollouts, 'rollouts')}
                            {renderCategory(t('nav.distributionSets'), distSetsCount, distSetsData?.content || [], '/distributions/sets', <MdInventory />, CATEGORY_COLORS.distSets, 'distSets')}
                            {renderCategory(t('nav.softwareModules'), modulesCount, modulesData?.content || [], '/distributions/modules', <MdExtension />, CATEGORY_COLORS.modules, 'modules')}

                            {/* Tags Section */}
                            {(targetTagsCount > 0 || dsTagsCount > 0) && (
                                <>
                                    {renderCategory(t('nav.targetTags', { defaultValue: 'Target Tags' }), targetTagsCount, targetTagsData?.content || [], '/targets/tags', <MdLabel />, CATEGORY_COLORS.targetTags, undefined, true)}
                                    {renderCategory(t('nav.dsTags', { defaultValue: 'Distribution Set Tags' }), dsTagsCount, dsTagsData?.content || [], '/distributions/tags', <MdLabel />, CATEGORY_COLORS.dsTags, undefined, true)}
                                </>
                            )}

                            {/* Types Section */}
                            {(targetTypesCount > 0 || dsTypesCount > 0 || smTypesCount > 0) && (
                                <>
                                    {renderCategory(t('nav.targetTypes', { defaultValue: 'Target Types' }), targetTypesCount, targetTypesData?.content || [], '/targets/types', <MdCategory />, CATEGORY_COLORS.targetTypes)}
                                    {renderCategory(t('nav.dsTypes', { defaultValue: 'Distribution Set Types' }), dsTypesCount, dsTypesData?.content || [], '/distributions/types', <MdMemory />, CATEGORY_COLORS.dsTypes)}
                                    {renderCategory(t('nav.smTypes', { defaultValue: 'Software Module Types' }), smTypesCount, smTypesData?.content || [], '/system/types', <MdApps />, CATEGORY_COLORS.smTypes)}
                                </>
                            )}
                        </>
                    )}
                </ScrollableContent>
            )
        },
        {
            key: 'targets',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdDevices />
                    {t('nav.targets')}
                </span>
            ),
            children: (
                <InfiniteSearchResults
                    query={debouncedQuery}
                    useHook={useGetTargetsInfinite}
                    handleNavigate={handleNavigate}
                    pathPrefix="/targets"
                    icon={<MdDevices />}
                    searchQueryStr={queries.targets}
                    isEnabled={activeTab === 'targets'}
                    categoryColor={CATEGORY_COLORS.targets}
                />
            )
        },
        {
            key: 'rollouts',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdRocketLaunch />
                    {t('nav.rollouts')}
                </span>
            ),
            children: (
                <InfiniteSearchResults
                    query={debouncedQuery}
                    useHook={useGetRolloutsInfinite}
                    handleNavigate={handleNavigate}
                    pathPrefix="/rollouts"
                    icon={<MdRocketLaunch />}
                    searchQueryStr={queries.rollouts}
                    isEnabled={activeTab === 'rollouts'}
                    categoryColor={CATEGORY_COLORS.rollouts}
                />
            )
        },
        {
            key: 'distSets',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdInventory />
                    {t('nav.distributionSets')}
                </span>
            ),
            children: (
                <InfiniteSearchResults
                    query={debouncedQuery}
                    useHook={useGetDistributionSetsInfinite}
                    handleNavigate={handleNavigate}
                    pathPrefix="/distributions/sets"
                    icon={<MdInventory />}
                    searchQueryStr={queries.distSets}
                    isEnabled={activeTab === 'distSets'}
                    categoryColor={CATEGORY_COLORS.distSets}
                />
            )
        },
        {
            key: 'modules',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MdExtension />
                    {t('nav.softwareModules')}
                </span>
            ),
            children: (
                <InfiniteSearchResults
                    query={debouncedQuery}
                    useHook={useGetSoftwareModulesInfinite}
                    handleNavigate={handleNavigate}
                    pathPrefix="/distributions/modules"
                    icon={<MdExtension />}
                    searchQueryStr={queries.modules}
                    isEnabled={activeTab === 'modules'}
                    categoryColor={CATEGORY_COLORS.modules}
                />
            )
        },
        {
            key: 'tagsTypes',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TagsOutlined />
                    {t('nav.tagsAndTypes')}
                    {debouncedQuery && <TabBadge count={totalTagsAndTypes} overflowCount={999} />}
                </span>
            ),
            children: (
                <ScrollableContent>
                    {isLoadingSummary ? (
                        <LoadingWrapper><Spin size="large" /></LoadingWrapper>
                    ) : !debouncedQuery ? (
                        <EmptyState>
                            <EmptyIcon><TagsOutlined /></EmptyIcon>
                            <Title level={5} style={{ marginBottom: 8, color: 'var(--ant-color-text-secondary)' }}>
                                {t('search.startTyping')}
                            </Title>
                        </EmptyState>
                    ) : totalTagsAndTypes === 0 ? (
                        <EmptyState>
                            <EmptyIcon><TagsOutlined /></EmptyIcon>
                            <Text type="secondary">{t('search.noResults')}</Text>
                        </EmptyState>
                    ) : (
                        <>
                            {/* Tags */}
                            {renderCategory(t('nav.targetTags', { defaultValue: 'Target Tags' }), targetTagsCount, targetTagsData?.content || [], '/targets/tags', <MdLabel />, CATEGORY_COLORS.targetTags, undefined, true)}
                            {renderCategory(t('nav.dsTags', { defaultValue: 'Distribution Set Tags' }), dsTagsCount, dsTagsData?.content || [], '/distributions/tags', <MdLabel />, CATEGORY_COLORS.dsTags, undefined, true)}

                            {/* Types */}
                            {renderCategory(t('nav.targetTypes', { defaultValue: 'Target Types' }), targetTypesCount, targetTypesData?.content || [], '/targets/types', <MdCategory />, CATEGORY_COLORS.targetTypes)}
                            {renderCategory(t('nav.dsTypes', { defaultValue: 'Distribution Set Types' }), dsTypesCount, dsTypesData?.content || [], '/distributions/types', <MdMemory />, CATEGORY_COLORS.dsTypes)}
                            {renderCategory(t('nav.smTypes', { defaultValue: 'Software Module Types' }), smTypesCount, smTypesData?.content || [], '/system/types', <MdApps />, CATEGORY_COLORS.smTypes)}
                        </>
                    )}
                </ScrollableContent>
            )
        }
    ];

    return (
        <StyledModal
            open={open}
            onCancel={onClose}
            footer={null}
            width={680}
            closable={false}
            centered
            destroyOnClose
        >
            <SearchHeader>
                <SearchInput
                    prefix={<SearchOutlined style={{ fontSize: 22, color: 'var(--ant-color-primary)', marginRight: 12 }} />}
                    placeholder={t('search.placeholderGlobal', { defaultValue: 'Search targets, rollouts, distributions, tags, types...' })}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    bordered={false}
                    autoFocus
                    allowClear
                    size="large"
                />
            </SearchHeader>

            {debouncedQuery ? (
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    style={{ marginTop: 0 }}
                />
            ) : (
                tabItems[0].children
            )}

            <FooterBar>
                <span>
                    {debouncedQuery && totalResults > 0 && (
                        <>{totalResults} {t('actions.results', { defaultValue: 'results' })}</>
                    )}
                </span>
                <span>
                    {t('search.closeHint', { defaultValue: 'Use {{key}} to close', key: '' })}
                    <ShortcutBadge>ESC</ShortcutBadge>
                </span>
            </FooterBar>
        </StyledModal>
    );
};

export default GlobalSearchModal;
