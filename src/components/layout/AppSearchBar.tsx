import React, { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GlobalSearchModal from '@/features/search/GlobalSearchModal';

const SearchContainer = styled.div`
    position: relative;
    width: 240px;
    transition: all 0.3s var(--transition-gentle);
    margin-right: 16px;

    .ant-input-affix-wrapper {
        border-radius: 12px;
        background-color: var(--ant-color-fill-quaternary);
        border: 1px solid var(--ant-color-border-secondary);
        transition: all 0.25s ease;
        padding: 4px 14px;
        height: 40px;

        &:hover {
            background-color: var(--ant-color-fill-tertiary);
            border-color: var(--ant-color-border);
        }

        &:focus-within {
            background-color: var(--ant-color-bg-container);
            border-color: var(--ant-color-primary);
            box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.12);
            width: 300px;
        }

        input {
            background-color: transparent;
            font-size: 14px;
            
            &::placeholder {
                color: var(--ant-color-text-quaternary);
            }
        }
    }
    
    &:has(.ant-input-affix-wrapper:focus-within) {
        width: 300px;
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
