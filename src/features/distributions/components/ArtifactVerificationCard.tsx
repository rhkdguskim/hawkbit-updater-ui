import React, { useState } from 'react';
import { Card, Typography, Space, Button, Tooltip, Tag, Progress, message, Divider, Flex } from 'antd';
import {
    CopyOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    FileOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MgmtArtifact } from '@/api/generated/model';
import styled from 'styled-components';
import { axiosInstance } from '@/api/axios-instance';

const { Text, Title } = Typography;

const VerificationCard = styled(Card)`
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    border: 1px solid #b7eb8f;
    border-radius: 12px;
    
    .ant-card-head {
        border-bottom: 1px solid #b7eb8f;
        background: rgba(255, 255, 255, 0.5);
    }
    
    .ant-card-body {
        padding: 20px;
    }
`;

const HashRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
    
    &:hover {
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const HashValue = styled.code`
    font-family: var(--font-mono);
    font-size: 12px;
    color: #1a1a1a;
    word-break: break-all;
    flex: 1;
    margin: 0 12px;
`;

const FileInfoSection = styled.div`
    padding: 16px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    margin-bottom: 16px;
`;

interface ArtifactVerificationCardProps {
    artifact: MgmtArtifact;
    softwareModuleId: number;
    onDownloadComplete?: () => void;
}

const ArtifactVerificationCard: React.FC<ArtifactVerificationCardProps> = ({
    artifact,
    softwareModuleId,
    onDownloadComplete,
}) => {
    const { t } = useTranslation(['distributions', 'common']);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const copyToClipboard = async (text: string, hashType: string) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success(t('detail.verification.copySuccess', { hashType }));
        } catch {
            message.error(t('detail.verification.copyError'));
        }
    };

    const handleDownload = async () => {
        if (!artifact.id) return;

        setIsDownloading(true);
        setDownloadProgress(0);

        const downloadUrl =
            artifact._links?.download?.href ??
            `/rest/v1/softwaremodules/${softwareModuleId}/artifacts/${artifact.id}/download`;
        const filename = artifact.providedFilename || `artifact-${artifact.id}`;

        try {
            const response = await axiosInstance<Blob>({
                url: downloadUrl,
                method: 'GET',
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percent);
                    }
                },
            });

            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success(t('detail.verification.downloadSuccess'));
            onDownloadComplete?.();
        } catch (error) {
            message.error((error as Error).message || t('detail.downloadError'));
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const hashes = [
        { type: 'SHA256', value: artifact.hashes?.sha256, color: 'var(--ant-color-success)' },
        { type: 'SHA1', value: artifact.hashes?.sha1, color: 'var(--ant-color-primary)' },
        { type: 'MD5', value: artifact.hashes?.md5, color: '#722ed1' },
    ].filter(h => h.value);

    return (
        <VerificationCard
            title={
                <Space>
                    <SafetyCertificateOutlined style={{ color: 'var(--ant-color-success)' }} />
                    <span>{t('detail.verification.title')}</span>
                </Space>
            }
        >
            {/* File Information */}
            <FileInfoSection>
                <Flex align="center" gap={16}>
                    <FileOutlined style={{ fontSize: 32, color: 'var(--ant-color-success)' }} />
                    <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            {artifact.providedFilename || `artifact-${artifact.id}`}
                        </Title>
                        <Text type="secondary">
                            {artifact.size ? formatFileSize(artifact.size) : '-'}
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleDownload}
                        loading={isDownloading}
                        style={{ background: 'var(--ant-color-success)', borderColor: 'var(--ant-color-success)' }}
                    >
                        {t('detail.verification.download')}
                    </Button>
                </Flex>

                {isDownloading && (
                    <div style={{ marginTop: 16 }}>
                        <Progress
                            percent={downloadProgress}
                            status="active"
                            strokeColor={{
                                '0%': 'var(--ant-color-success)',
                                '100%': '#73d13d',
                            }}
                        />
                    </div>
                )}
            </FileInfoSection>

            <Divider style={{ margin: '16px 0' }}>{t('detail.verification.hashesTitle')}</Divider>

            {/* Hash Values */}
            <Space direction="vertical" style={{ width: '100%' }} size={0}>
                {hashes.map(({ type, value, color }) => (
                    <HashRow key={type}>
                        <Tag color={color} style={{ minWidth: 70, textAlign: 'center' }}>
                            {type}
                        </Tag>
                        <HashValue>{value}</HashValue>
                        <Tooltip title={t('detail.verification.copyHash', { hashType: type })}>
                            <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => copyToClipboard(value!, type)}
                            />
                        </Tooltip>
                    </HashRow>
                ))}
            </Space>

            {/* Verification Tip */}
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(82, 196, 65, 0.1)', borderRadius: 8 }}>
                <Space>
                    <CheckCircleOutlined style={{ color: 'var(--ant-color-success)' }} />
                    <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                        {t('detail.verification.tip')}
                    </Text>
                </Space>
            </div>
        </VerificationCard>
    );
};

export default ArtifactVerificationCard;
