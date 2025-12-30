import React, { useState } from 'react';
import { Input, Button, Space, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { buildWildcardSearch } from '@/utils/fiql';
import { FilterBar } from '@/components/patterns';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SearchSelect = styled(Select)`
    && {
        width: 120px;
    }
`;

const SearchInput = styled(Input)`
    && {
        width: 300px;
    }
`;

interface DistributionSearchBarProps {
    onSearch: (query: string) => void;
    onRefresh: () => void;
    onAdd?: () => void;
    loading?: boolean;
    canAdd?: boolean;
    placeholder?: string;
    type?: 'set' | 'module';
}

const DistributionSearchBar: React.FC<DistributionSearchBarProps> = ({
    onSearch,
    onRefresh,
    onAdd,
    loading = false,
    canAdd = false,
    placeholder,
    type = 'set',
}) => {
    const { t } = useTranslation('distributions');
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('name');

    const displayPlaceholder = placeholder || t('list.searchPlaceholder', { field: t(`list.searchFields.${searchField}`) });

    const handleSearch = () => {
        if (!searchText.trim()) {
            onSearch('');
            return;
        }
        const query = buildWildcardSearch(searchField, searchText);
        onSearch(query);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <FilterBar
            extra={
                <Space size="small">
                    <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
                        {t('list.refresh')}
                    </Button>
                    {canAdd && onAdd && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                            {type === 'set' ? t('list.addSet') : t('list.addModule')}
                        </Button>
                    )}
                </Space>
            }
        >
            <Space size="small">
                <SearchSelect
                    defaultValue="name"
                    options={[
                        { value: 'name', label: t('list.searchFields.name') },
                        { value: 'version', label: t('list.searchFields.version') },
                        { value: 'description', label: t('list.searchFields.description') },
                    ]}
                    onChange={setSearchField}
                />
                <SearchInput
                    placeholder={displayPlaceholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    allowClear
                    prefix={<SearchOutlined />}
                />
                <Button type="primary" onClick={handleSearch} loading={loading}>
                    {t('list.search')}
                </Button>
            </Space>
        </FilterBar>
    );
};

export default DistributionSearchBar;
