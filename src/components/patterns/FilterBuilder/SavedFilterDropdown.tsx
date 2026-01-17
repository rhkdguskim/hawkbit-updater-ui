import React, { useMemo } from 'react';
import { Dropdown, Button, Typography, Spin, Empty } from 'antd';
import { BookOutlined, FilterOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useGetFilters } from '@/api/generated/target-filter-queries/target-filter-queries';
import type { MgmtTargetFilterQuery } from '@/api/generated/model';

const { Text } = Typography;

const DropdownContent = styled.div`
    min-width: 280px;
    max-width: 400px;
    max-height: 320px;
    overflow-y: auto;
    background-color: var(--ant-color-bg-elevated, #ffffff);
    border-radius: var(--ant-border-radius-lg, 8px);
    box-shadow: var(--ant-box-shadow-light, 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05));
    border: 1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06));
`;

const FilterItem = styled.div`
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 4px;
    margin: 2px 4px;
    
    &:hover {
        background-color: var(--ant-color-bg-text-hover, rgba(0, 0, 0, 0.06));
    }
`;

const FilterName = styled.div`
    font-weight: 500;
    color: var(--ant-color-text, rgba(0, 0, 0, 0.88));
    margin-bottom: 2px;
`;

const FilterQuery = styled.div`
    font-size: 12px;
    color: var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45));
    font-family: var(--font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FooterSection = styled.div`
    padding: 8px 12px;
    border-top: 1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06));
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
`;

export interface SavedFilterDropdownProps {
    onApply: (filter: MgmtTargetFilterQuery) => void;
    onManageClick?: () => void;
}

export const SavedFilterDropdown: React.FC<SavedFilterDropdownProps> = ({
    onApply,
    onManageClick,
}) => {
    const { t } = useTranslation('targets');
    const { data, isLoading } = useGetFilters(
        { limit: 20, sort: undefined },
        { query: { staleTime: 30000 } }
    );

    const filters = useMemo(() => data?.content || [], [data?.content]);
    const totalCount = data?.total || 0;

    const dropdownContent = (
        <DropdownContent>
            {isLoading ? (
                <LoadingContainer>
                    <Spin size="small" />
                </LoadingContainer>
            ) : filters.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('savedFilters.empty')}
                    style={{ padding: '24px' }}
                />
            ) : (
                <>
                    {filters.map((filter) => (
                        <FilterItem key={filter.id} onClick={() => onApply(filter)}>
                            <FilterName>
                                <FilterOutlined style={{ marginRight: 8, color: 'var(--ant-color-primary)' }} />
                                {filter.name || t('savedFilters.untitled')}
                            </FilterName>
                            <FilterQuery>{filter.query}</FilterQuery>
                        </FilterItem>
                    ))}
                </>
            )}

            <FooterSection>
                <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                    {t('savedFilters.totalCount', { count: totalCount, defaultValue: `${totalCount} saved filters` })}
                </Text>
                {onManageClick && (
                    <Button
                        type="link"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onManageClick();
                        }}
                    >
                        {t('savedFilters.manage', { defaultValue: 'Manage' })}
                    </Button>
                )}
            </FooterSection>
        </DropdownContent>
    );

    return (
        <Dropdown
            trigger={['click']}
            dropdownRender={() => dropdownContent}
            placement="bottomLeft"
        >
            <Button
                icon={<BookOutlined />}
                size="small"
                style={{
                    borderColor: filters.length > 0 ? 'var(--ant-color-primary)' : undefined,
                }}
            >
                {t('savedFilters.quickAccess', { defaultValue: 'Saved Filters' })}
                {filters.length > 0 && (
                    <span style={{
                        marginLeft: 4,
                        background: 'var(--ant-color-primary)',
                        color: '#fff',
                        borderRadius: '50%',
                        fontSize: 'var(--ant-font-size-sm)',
                        padding: '0 6px',
                        minWidth: 18,
                        display: 'inline-block',
                        textAlign: 'center',
                    }}>
                        {filters.length}
                    </span>
                )}
            </Button>
        </Dropdown>
    );
};

export default SavedFilterDropdown;
