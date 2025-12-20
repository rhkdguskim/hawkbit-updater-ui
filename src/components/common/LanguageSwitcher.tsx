import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguageStore } from '@/stores/useLanguageStore';
import type { Language } from '@/stores/useLanguageStore';

const languageOptions = [
    { value: 'ko', label: '🇰🇷 한국어' },
    { value: 'en', label: '🇺🇸 English' },
];

interface LanguageSwitcherProps {
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { language, setLanguage } = useLanguageStore();

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
