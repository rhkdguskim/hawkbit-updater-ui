import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/useLanguageStore';
import type { Language } from '@/stores/useLanguageStore';

interface LanguageSwitcherProps {
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { t } = useTranslation('common');
    const { language, setLanguage } = useLanguageStore();

    const languageOptions = [
        { value: 'ko', label: t('languages.ko') },
        { value: 'en', label: t('languages.en') },
    ];

    return (
        <Select
            value={language}
            onChange={(value) => setLanguage(value as Language)}
            options={languageOptions}
            suffixIcon={<GlobalOutlined />}
            style={{ width: 120 }}
            variant="borderless"
            className={className}
        />
    );
};

export default LanguageSwitcher;
