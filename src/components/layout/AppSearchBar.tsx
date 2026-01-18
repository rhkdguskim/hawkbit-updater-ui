import React, { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GlobalSearchModal from '@/features/search/GlobalSearchModal';

const SearchContainer = styled.div`
    position: relative;
    width: 200px;
    transition: all 0.3s var(--transition-gentle);
    margin-right: 12px;

    .ant-input-affix-wrapper {
        border-radius: 16px;
        background-color: var(--ant-color-fill-tertiary);
        border: 1px solid var(--border-secondary);
        transition: all 0.3s var(--transition-gentle);
        padding: 2px 12px;
        height: 32px;

        &:hover {
            background-color: var(--ant-color-fill-secondary);
            border-color: var(--ant-color-primary-border);
        }

        &:focus-within {
            background-color: var(--ant-color-bg-container);
            border-color: var(--ant-color-primary);
            box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
            width: 260px;
        }

        input {
            background-color: transparent;
            font-size: 13px;
        }
    }
    
    &:has(.ant-input-affix-wrapper:focus-within) {
        width: 260px;
    }
`;

export const AppSearchBar: React.FC = () => {
    const { t } = useTranslation('common');
    const [searchValue, setSearchValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInitialQuery, setModalInitialQuery] = useState('');

    const handleSearch = (value: string) => {
        setModalInitialQuery(value);
        setIsModalOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(searchValue);
        }
    };

    return (
        <SearchContainer>
            <Input
                placeholder={t('search.placeholderGlobal', { defaultValue: 'Search targets, rollouts, distributions...' })}
                prefix={
                    <SearchOutlined
                        style={{ color: 'var(--ant-color-text-description)', fontSize: 16, cursor: 'pointer' }}
                        onClick={() => handleSearch(searchValue)}
                    />
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                allowClear
                bordered={false}
            />
            <GlobalSearchModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialQuery={modalInitialQuery}
            />
        </SearchContainer>
    );
};
