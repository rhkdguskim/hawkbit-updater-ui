import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Spin, Tabs, Tag, Badge } from 'antd';
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
import { SearchOutlined, TagsOutlined } from '@ant-design/icons';
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
import type { SearchableItem, GlobalSearchModalProps } from './components/SearchTypes';
import { InfiniteSearchResults } from './components/InfiniteSearchResults';
import {
    StyledModal,
    SearchHeader,
    SearchInput,
    ScrollableContent,
    CategorySection,
    CategoryHeader,
    CategoryTitle,
    CategoryIcon,
    ResultCard,
    IconWrapper,
    ResultInfo,
    ResultTitle,
    ResultSubtitle,
    ResultMeta,
    ColorDot,
    EmptyState,
    EmptyIcon,
    FooterBar,
    ShortcutBadge,
    LoadingWrapper,
    ViewAllButton,
    TabBadge,
    CATEGORY_COLORS,
} from './components/GlobalSearchStyles';

const { Text, Title } = Typography;

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose, initialQuery = '' }) => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 300);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (open) {
            setQuery(initialQuery);
            setActiveTab('all');
        }
    }, [open, initialQuery]);

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
    const { data: targetTagsData, isLoading: targetTagsLoading } = useGetTargetTags(
        { q: queries.tags, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
    const { data: dsTagsData, isLoading: dsTagsLoading } = useGetDistributionSetTags(
        { q: queries.tags, limit: 5 },
        { query: { enabled: !!debouncedQuery && activeTab === 'all', staleTime: 0 } }
    );
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
        item: SearchableItem,
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
        data: SearchableItem[],
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
                {data.map((item) => renderResultCard(item, pathPrefix, icon, categoryColor, showColor))}
            </CategorySection>
        );
    };

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
                            <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                {t('search.description', { defaultValue: 'Search across Targets, Rollouts, Distributions, Tags and Types' })}
                            </Text>
                        </EmptyState>
                    ) : totalResults === 0 ? (
                        <EmptyState>
                            <EmptyIcon><MdSearch /></EmptyIcon>
                            <Title level={5} style={{ marginBottom: 8, color: 'var(--ant-color-text-secondary)' }}>
                                {t('search.noResults', { defaultValue: 'No results found' })}
                            </Title>
                            <Text type="secondary">{t('search.tryDifferentKeywords', { defaultValue: 'Try different keywords' })}</Text>
                        </EmptyState>
                    ) : (
                        <>
                            {renderCategory(t('nav.targets'), targetsCount, targetsData?.content || [], '/targets', <MdDevices />, CATEGORY_COLORS.targets, 'targets')}
                            {renderCategory(t('nav.rollouts'), rolloutsCount, rolloutsData?.content || [], '/rollouts', <MdRocketLaunch />, CATEGORY_COLORS.rollouts, 'rollouts')}
                            {renderCategory(t('nav.distributionSets'), distSetsCount, distSetsData?.content || [], '/distributions/sets', <MdInventory />, CATEGORY_COLORS.distSets, 'distSets')}
                            {renderCategory(t('nav.softwareModules'), modulesCount, modulesData?.content || [], '/distributions/modules', <MdExtension />, CATEGORY_COLORS.modules, 'modules')}

                            {(targetTagsCount > 0 || dsTagsCount > 0) && (
                                <>
                                    {renderCategory(t('nav.targetTags', { defaultValue: 'Target Tags' }), targetTagsCount, targetTagsData?.content || [], '/targets/tags', <MdLabel />, CATEGORY_COLORS.targetTags, undefined, true)}
                                    {renderCategory(t('nav.dsTags', { defaultValue: 'Distribution Set Tags' }), dsTagsCount, dsTagsData?.content || [], '/distributions/tags', <MdLabel />, CATEGORY_COLORS.dsTags, undefined, true)}
                                </>
                            )}

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
                            {renderCategory(t('nav.targetTags', { defaultValue: 'Target Tags' }), targetTagsCount, targetTagsData?.content || [], '/targets/tags', <MdLabel />, CATEGORY_COLORS.targetTags, undefined, true)}
                            {renderCategory(t('nav.dsTags', { defaultValue: 'Distribution Set Tags' }), dsTagsCount, dsTagsData?.content || [], '/distributions/tags', <MdLabel />, CATEGORY_COLORS.dsTags, undefined, true)}
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
            destroyOnHidden
        >
            <SearchHeader>
                <SearchInput
                    prefix={<SearchOutlined style={{ fontSize: 'var(--ant-font-size-xl)', color: 'var(--ant-color-primary)', marginRight: 12 }} />}
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
