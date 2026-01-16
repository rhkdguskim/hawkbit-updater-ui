import React, { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import GlobalSearchModal from '@/features/search/GlobalSearchModal';

const SearchContainer = styled.div`
    position: relative;
    width: 250px;
    transition: width 0.3s ease;
    margin-right: 16px;

    .ant-input-affix-wrapper {
        border-radius: 20px;
        background-color: var(--ant-color-split, rgba(0, 0, 0, 0.04));
        border: 1px solid transparent;
        transition: all 0.3s ease;
        padding-left: 12px;

        &:hover, &:focus-within {
            background-color: var(--ant-color-bg-container, #fff);
            border-color: var(--ant-color-primary);
            box-shadow: 0 0 0 2px var(--ant-color-primary-bg);
            width: 320px;
        }

        input {
            background-color: transparent;
        }
    }
    
    &:has(.ant-input-affix-wrapper:focus-within) {
        width: 320px;
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
