import React, { useState, useCallback } from 'react';
import { Input, Space, Button, Select, Tooltip } from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Search } = Input;

const SearchContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
`;

const SearchGroup = styled(Space)`
    flex: 1;
    min-width: 300px;
`;

const ActionGroup = styled(Space)`
    flex-shrink: 0;
`;

interface TargetSearchBarProps {
    onSearch: (query: string) => void;
    onRefresh: () => void;
    onAddTarget: () => void;
    canAddTarget: boolean;
    loading?: boolean;
}

type SearchField = 'controllerId' | 'name' | 'description';

const searchFieldOptions = [
    { value: 'controllerId', label: 'Controller ID' },
    { value: 'name', label: 'Name' },
    { value: 'description', label: 'Description' },
];

const TargetSearchBar: React.FC<TargetSearchBarProps> = ({
    onSearch,
    onRefresh,
    onAddTarget,
    canAddTarget,
    loading,
}) => {
    const [searchField, setSearchField] = useState<SearchField>('controllerId');
    const [searchValue, setSearchValue] = useState('');

    const buildFiqlQuery = useCallback((field: SearchField, value: string): string => {
        if (!value.trim()) return '';
        // FIQL wildcard search
        return `${field}==*${value.trim()}*`;
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        const query = buildFiqlQuery(searchField, value);
        onSearch(query);
    };

    const handleClear = () => {
        setSearchValue('');
        onSearch('');
    };

    return (
        <SearchContainer>
            <SearchGroup>
                <Select
                    value={searchField}
                    onChange={setSearchField}
                    options={searchFieldOptions}
                    style={{ width: 140 }}
                    suffixIcon={<FilterOutlined />}
                />
                <Search
                    placeholder={`Search by ${searchFieldOptions.find(o => o.value === searchField)?.label}`}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onSearch={handleSearch}
                    allowClear
                    onClear={handleClear}
                    enterButton={<SearchOutlined />}
                    style={{ maxWidth: 400 }}
                    loading={loading}
                />
            </SearchGroup>

            <ActionGroup>
                <Tooltip title="Refresh">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={onRefresh}
                        loading={loading}
                    />
                </Tooltip>
                {canAddTarget && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onAddTarget}
                    >
                        Add Target
                    </Button>
                )}
            </ActionGroup>
        </SearchContainer>
    );
};

export default TargetSearchBar;
