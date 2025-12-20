import React, { useState } from 'react';
import { Input, Button, Space, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';

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
    placeholder = 'Search by name or version',
    type = 'set',
}) => {
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('name');

    const handleSearch = () => {
        if (!searchText.trim()) {
            onSearch('');
            return;
        }

        // Simple FIQL construction
        const query = `${searchField}==*${searchText}*`;
        onSearch(query);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Space>
                <Select
                    defaultValue="name"
                    options={[
                        { value: 'name', label: 'Name' },
                        { value: 'version', label: 'Version' },
                        { value: 'description', label: 'Description' },
                    ]}
                    onChange={setSearchField}
                    style={{ width: 120 }}
                />
                <Input
                    placeholder={placeholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ width: 300 }}
                    allowClear
                    prefix={<SearchOutlined />}
                />
                <Button type="primary" onClick={handleSearch} loading={loading}>
                    Search
                </Button>
                <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
                    Refresh
                </Button>
            </Space>

            {canAdd && onAdd && (
                <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                    Add {type === 'set' ? 'Distribution Set' : 'Software Module'}
                </Button>
            )}
        </div>
    );
};

export default DistributionSearchBar;
