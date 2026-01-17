import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/useLanguageStore';
import type { Language } from '@/stores/useLanguageStore';
import styled from 'styled-components';

const LanguageSelect = styled(Select)`
    && {
        width: 130px;
        .ant-select-selector {
            padding-left: 4px !important;
        }
    }
`;

const FlagIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 15px;
    margin-right: 8px;
    border-radius: 2px;
    overflow: hidden;
    
    img, svg {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

// Simple SVG Flags
const Flags = {
    ko: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
            <rect fill="#fff" width="300" height="200" />
            <circle cx="150" cy="100" r="50" fill="#c60c30" />
            <path fill="#003478" d="M150 100A50 50 0 0 0 150 150A50 50 0 0 1 150 100z" />
            <path fill="#c60c30" d="M150 100A50 50 0 0 1 150 50A50 50 0 0 0 150 100z" />
            <g transform="translate(150,100)" fill="none" stroke="#000" strokeWidth="10" strokeLinecap="square">
                <g>
                    <path d="M-70-60l-20-10M-90-40l20 10M-95-50l25 12.5" />
                    <path d="M-70 60l-20 10M-90 40l20-10M-95 50l25-12.5" strokeDasharray="37.5 5 37.5" />
                </g>
                <g transform="scale(-1,1)">
                    <path d="M-70-60l-20-10M-90-40l20 10M-95-50l25 12.5" strokeDasharray="18 5 18" />
                    <path d="M-70 60l-20 10M-90 40l20-10M-95 50l25-12.5" strokeDasharray="9 5 9 5 9" />
                </g>
            </g>
        </svg>
    ),
    en: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900">
            <rect width="7410" height="3900" fill="#b22234" />
            <path d="M0,450H7410M0,1650H7410M0,2850H7410M0,3900H7410M0,1050H7410M0,2250H7410M0,3450H7410" stroke="#fff" strokeWidth="300" />
            <rect width="2964" height="2100" fill="#3c3b6e" />
            <g fill="#fff">
                <g id="s18">
                    <g id="s9">
                        <g id="s5">
                            <g id="s4">
                                <path id="s" d="M247,90 317.534230,307.082039 132.873218,172.917961H361.126782L176.465770,307.082039z" />
                                <use xlinkHref="#s" y="420" />
                                <use xlinkHref="#s" y="840" />
                                <use xlinkHref="#s" y="1260" />
                            </g>
                            <use xlinkHref="#s" y="1680" />
                        </g>
                        <use xlinkHref="#s4" x="247" y="210" />
                    </g>
                    <use xlinkHref="#s9" x="494" />
                </g>
                <use xlinkHref="#s18" x="988" />
                <use xlinkHref="#s9" x="1976" />
                <use xlinkHref="#s5" x="2470" />
            </g>
        </svg>
    ),
    zh: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
            <rect fill="#de2910" width="900" height="600" />
            <path fill="#ffde00" d="M165.7 179l36.1 11.2-12.4 34 26.3-24.8 35.1 8.2-27.1-23.9 15.6-32.9-33.1 13.5-25.2-25.9-1.9 36z" />
            <path fill="#ffde00" d="M312.3 90.3l5.5 16.9-14.4-11.2 17.6-3.8-15.1-9.9 17.9 1.1-6.8-16.5 11.2 14.4 16.9-5.5-11.3 14.2zM362.4 148.6l10.8 14-17.8-1.5 13.9 11.4-13.7 11.6 15.8-9.1 2.2 17.8 8-15.9 17.5 4-15-10.2zM362.4 271.4l15-10.2-17.5 4-8-15.9-2.2 17.8-15.8-9.1 13.7 11.6-13.9 11.4 17.8-1.5zM312.3 329.7l11.3 14.2-16.9-5.5-11.2 14.4 6.8-16.5-17.9 1.1 15.1-9.9-17.6-3.8 14.4-11.2z" />
        </svg>
    )
};

interface LanguageSwitcherProps {
    className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { t } = useTranslation('common');
    const { language, setLanguage } = useLanguageStore();

    const languageOptions = [
        { value: 'ko', label: <><FlagIcon>{Flags.ko}</FlagIcon>{t('languages.ko')}</> },
        { value: 'en', label: <><FlagIcon>{Flags.en}</FlagIcon>{t('languages.en')}</> },
        { value: 'zh', label: <><FlagIcon>{Flags.zh}</FlagIcon>{t('languages.zh')}</> },
    ];

    return (
        <LanguageSelect
            value={language}
            onChange={(value) => setLanguage(value as Language)}
            options={languageOptions}
            suffixIcon={<GlobalOutlined />}
            variant="borderless"
            className={className}
            optionLabelProp="label"
        />
    );
};

export default LanguageSwitcher;
