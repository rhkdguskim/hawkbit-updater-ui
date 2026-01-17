import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Upload, Divider, Typography, message, Space, Card, Alert } from 'antd';
import { UploadOutlined, DeleteOutlined, LinkOutlined, SaveOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores/useThemeStore';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const { Title, Text } = Typography;

const PreviewContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    background: var(--bg-color-secondary);
    border: 1px dashed var(--border-color);
    border-radius: 8px;
    margin-bottom: 24px;
    
    img {
        max-height: 80px;
        max-width: 100%;
        object-fit: contain;
    }
`;

interface UISettingsModalProps {
    open: boolean;
    onClose: () => void;
}

export const UISettingsModal: React.FC<UISettingsModalProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { customLogo, setCustomLogo } = useThemeStore();
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [tempLogo, setTempLogo] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setLogoUrl(customLogo || '');
            setTempLogo(customLogo);
        }
    }, [open, customLogo]);

    const handleSave = () => {
        if (tempLogo && tempLogo.length > 2 * 1024 * 1024) { // 2MB Check (approx)
            message.error(t('uiSettings.messages.tooLarge'));
            return;
        }
        setCustomLogo(tempLogo);
        message.success(t('uiSettings.messages.saved'));
        onClose();
    };

    const handleReset = () => {
        setCustomLogo(null);
        setTempLogo(null);
        setLogoUrl('');
        message.info(t('uiSettings.messages.reset'));
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setLogoUrl(url);
        if (url) {
            setTempLogo(url);
        }
    };

    const handleFileUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error(t('uiSettings.messages.onlyImages'));
            return Upload.LIST_IGNORE;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error(t('uiSettings.messages.sizeLimit'));
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setTempLogo(e.target.result as string);
                setLogoUrl(''); // Clear URL input if file is uploaded
            }
        };
        reader.readAsDataURL(file);
        return false; // Prevent auto upload
    };

    return (
        <Modal
            title={t('uiSettings.title')}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="reset" icon={<DeleteOutlined />} onClick={handleReset} danger>
                    {t('uiSettings.resetDefault')}
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    {t('actions.cancel')}
                </Button>,
                <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    {t('uiSettings.save')}
                </Button>,
            ]}
        >
            <Title level={5}>{t('uiSettings.headerLogo')}</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                {t('uiSettings.description')}
            </Text>

            <PreviewContainer>
                {tempLogo ? (
                    <img src={tempLogo} alt="Logo Preview" />
                ) : (
                    <Text type="secondary">{t('uiSettings.defaultLogo')}</Text>
                )}
            </PreviewContainer>

            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Divider style={{ margin: '0 0 16px 0', fontSize: '14px' }}>{t('uiSettings.imageSource')}</Divider>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Input
                            placeholder={t('uiSettings.enterUrl')}
                            prefix={<LinkOutlined />}
                            value={logoUrl}
                            onChange={handleUrlChange}
                            allowClear
                        />
                        <div style={{ textAlign: 'center', margin: '8px 0' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>{t('uiSettings.or')}</Text>
                        </div>
                        <Upload
                            beforeUpload={handleFileUpload}
                            showUploadList={false}
                            maxCount={1}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />} block>
                                {t('uiSettings.uploadLocal')}
                            </Button>
                        </Upload>
                    </Space>
                </div>

                <Alert
                    message={t('uiSettings.storageNote')}
                    description={t('uiSettings.storageNoteDesc')}
                    type="info"
                    showIcon
                />
            </Space>
        </Modal>
    );
};
