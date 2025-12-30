import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/useLanguageStore';
import type { Language } from '@/stores/useLanguageStore';
import styled from 'styled-components';

const LanguageSelect = styled(Select)`
    && {
        width: 120px;
    }
`;

interface LanguageSwitcherProps {
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { t } = useTranslation('common');
    const { language, setLanguage } = useLanguageStore();

    const languageOptions = [
        { value: 'ko', label: t('languages.ko') },
        { value: 'en', label: t('languages.en') },
        { value: 'zh', label: t('languages.zh') },
    ];

    return (
        <LanguageSelect
            value={language}
            onChange={(value) => setLanguage(value as Language)}
            options={languageOptions}
            suffixIcon={<GlobalOutlined />}
            variant="borderless"
            className={className}
        />
    );
};

export default LanguageSwitcher;
