import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Typography, Spin, Empty, Tabs, List, Tag, Button, Input } from 'antd';
import {
    MdDevices,
    MdRocketLaunch,
    MdInventory,
    MdExtension,
    MdSearch,
    MdArrowForward,
} from 'react-icons/md';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetTargetsInfinite, useGetTargets } from '@/api/generated/targets/targets';
import { useGetRolloutsInfinite, useGetRollouts } from '@/api/generated/rollouts/rollouts';
import { useGetDistributionSetsInfinite, useGetDistributionSets } from '@/api/generated/distribution-sets/distribution-sets';
import { useGetSoftwareModulesInfinite, useGetSoftwareModules } from '@/api/generated/software-modules/software-modules';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface GlobalSearchModalProps {
    open: boolean;
    onClose: () => void;
    initialQuery?: string;
}

const ResultItem = styled(List.Item)`
    border-radius: 8px;
    padding: 12px !important;
    transition: all 0.2s;
    cursor: pointer;
    border-bottom: 1px solid var(--ant-color-border-secondary) !important;

    &:hover {
        background: var(--ant-color-bg-layout);
    }
    
    &:last-child {
        border-bottom: none !important;
    }
`;

const ItemIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--ant-color-primary-bg);
    color: var(--ant-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-right: 12px;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    margin-bottom: 8px;
    padding: 0 12px;
`;

const StyledModal = styled(Modal)`
    .ant-modal-content {
        padding: 0;
        overflow: hidden;
        border-radius: 12px;
    }
    .ant-modal-body {
        padding: 0;
    }
    .ant-tabs-nav {
        margin-bottom: 0;
        padding: 0 16px;
        border-bottom: 1px solid var(--ant-color-border-secondary);
    }
`;

const ScrollableContent = styled.div`
    height: 60vh;
    overflow-y: auto;
    padding: 0 16px 16px;
`;

const InfiniteSearchResults = ({
    query,
    useHook,
    handleNavigate,
    pathPrefix,
    icon,
    searchQueryStr,
    isEnabled
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
        return <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>;
    }

    if (items.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No results found" />;
    }

    return (
        <ScrollableContent onScroll={handleScroll}>
            <SectionHeader>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                    {total} RESULTS
                </Text>
            </SectionHeader>
            <List
                dataSource={items}
                split={false}
                renderItem={(item: any) => (
                    <ResultItem onClick={() => handleNavigate(`${pathPrefix}/${item.controllerId || item.id}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <ItemIcon>{icon}</ItemIcon>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong ellipsis>{item.name || item.controllerId}</Text>
                                    <Tag style={{ marginRight: 0 }}>{item.status || item.type || item.targetType?.name}</Tag>
                                </div>
                                <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                                    {item.description || item.version || item.controllerId}
                                </Text>
                            </div>
                        </div>
                    </ResultItem>
                )}
            />
            {isFetchingNextPage && <div style={{ textAlign: 'center', padding: 10 }}><Spin size="small" /></div>}
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

    // Queries
    // Construct specific RSQL queries for each entity type
    const queries = useMemo(() => {
        if (!debouncedQuery) return { targets: '', rollouts: '', distSets: '', modules: '' };
        const q = debouncedQuery.replace(/[*;=,()]/g, '');
        return {
            targets: `(name==*${q}*,controllerId==*${q}*)`,
            rollouts: `(name==*${q}*)`,
            distSets: `(name==*${q}*,version==*${q}*)`,
            modules: `(name==*${q}*,version==*${q}*)`
        };
    }, [debouncedQuery]);

    // Summary Data (Limit 5)
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

    const isLoadingSummary = targetsLoading || rolloutsLoading || distSetsLoading || modulesLoading;
    const targetsCount = targetsData?.total || 0;
    const rolloutsCount = rolloutsData?.total || 0;
    const distSetsCount = distSetsData?.total || 0;
    const modulesCount = modulesData?.total || 0;
    const totalResults = targetsCount + rolloutsCount + distSetsCount + modulesCount;

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    const renderSummarySection = (title: string, count: number, data: any[], pathPrefix: string, icon: React.ReactNode, tabKey: string) => {
        if (!data || data.length === 0) return null;
        return (
            <div>
                <SectionHeader>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                        {title}
                    </Text>
                    {count > 5 && (
                        <Button type="link" size="small" onClick={() => setActiveTab(tabKey)}>
                            {t('labels.viewAll', { defaultValue: 'View All' })} ({count}) <MdArrowForward />
                        </Button>
                    )}
                </SectionHeader>
                <List
                    dataSource={data}
                    split={false}
                    renderItem={(item: any) => (
                        <ResultItem onClick={() => handleNavigate(`${pathPrefix}/${item.controllerId || item.id}`)}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <ItemIcon>{icon}</ItemIcon>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong ellipsis>{item.name || item.controllerId}</Text>
                                        <Tag style={{ marginRight: 0 }}>{item.status || item.type || item.targetType?.name}</Tag>
                                    </div>
                                    <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                                        {item.description || item.version || item.controllerId}
                                    </Text>
                                </div>
                            </div>
                        </ResultItem>
                    )}
                />
            </div>
        );
    };

    const tabItems = [
        {
            key: 'all',
            label: t('search.tabs.all', { defaultValue: 'All Results' }),
            children: (
                <ScrollableContent>
                    {isLoadingSummary ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
                    ) : !debouncedQuery ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                            <MdSearch style={{ fontSize: 48, marginBottom: 16 }} />
                            <Title level={5}>{t('search.startTyping', { defaultValue: 'Type to search...' })}</Title>
                        </div>
                    ) : totalResults === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('search.noResults', { defaultValue: 'No results found' })} />
                    ) : (
                        <>
                            {renderSummarySection(t('nav.targets'), targetsCount, targetsData?.content || [], '/targets', <MdDevices />, 'targets')}
                            {renderSummarySection(t('nav.rollouts'), rolloutsCount, rolloutsData?.content || [], '/rollouts', <MdRocketLaunch />, 'rollouts')}
                            {renderSummarySection(t('nav.distributionSets'), distSetsCount, distSetsData?.content || [], '/distributions/sets', <MdInventory />, 'distSets')}
                            {renderSummarySection(t('nav.softwareModules'), modulesCount, modulesData?.content || [], '/distributions/modules', <MdExtension />, 'modules')}
                        </>
                    )}
                </ScrollableContent>
            )
        },
        {
            key: 'targets',
            label: `${t('nav.targets')}`,
            children: <InfiniteSearchResults query={debouncedQuery} useHook={useGetTargetsInfinite} handleNavigate={handleNavigate} pathPrefix="/targets" icon={<MdDevices />} searchQueryStr={queries.targets} isEnabled={activeTab === 'targets'} />
        },
        {
            key: 'rollouts',
            label: `${t('nav.rollouts')}`,
            children: <InfiniteSearchResults query={debouncedQuery} useHook={useGetRolloutsInfinite} handleNavigate={handleNavigate} pathPrefix="/rollouts" icon={<MdRocketLaunch />} searchQueryStr={queries.rollouts} isEnabled={activeTab === 'rollouts'} />
        },
        {
            key: 'distSets',
            label: `${t('nav.distributionSets')}`,
            children: <InfiniteSearchResults query={debouncedQuery} useHook={useGetDistributionSetsInfinite} handleNavigate={handleNavigate} pathPrefix="/distributions/sets" icon={<MdInventory />} searchQueryStr={queries.distSets} isEnabled={activeTab === 'distSets'} />
        },
        {
            key: 'modules',
            label: `${t('nav.softwareModules')}`,
            children: <InfiniteSearchResults query={debouncedQuery} useHook={useGetSoftwareModulesInfinite} handleNavigate={handleNavigate} pathPrefix="/distributions/modules" icon={<MdExtension />} searchQueryStr={queries.modules} isEnabled={activeTab === 'modules'} />
        }
    ];

    return (
        <StyledModal
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            closable={false}
            centered
            destroyOnClose
        >
            <div style={{ padding: 16 }}>
                <Input
                    prefix={<SearchOutlined style={{ fontSize: 20, color: 'var(--ant-color-text-description)', marginRight: 8 }} />}
                    placeholder={t('search.placeholderGlobal', { defaultValue: 'Search targets, rollouts, distributions...' })}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    bordered={false}
                    style={{ fontSize: 18 }}
                    autoFocus
                    allowClear
                />
            </div>

            {debouncedQuery && (
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    style={{ marginTop: -12 }}
                />
            )}

            {!debouncedQuery && tabItems[0].children}

            <div style={{ padding: '8px 16px', background: 'var(--ant-color-bg-layout)', borderTop: '1px solid var(--ant-color-border-secondary)', display: 'flex', justifyContent: 'flex-end', fontSize: 12, color: 'var(--ant-color-text-description)' }}>
                <span>{t('search.closeHint', { defaultValue: 'Use {{key}} to close', key: 'ESC' })}</span>
            </div>
        </StyledModal>
    );
};

export default GlobalSearchModal;
