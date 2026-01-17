import React, { useMemo } from 'react';
import { Popover, Button, Typography, Spin, Statistic, Row, Col, Space } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, WarningOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useGetTargets } from '@/api/generated/targets/targets';

const { Text } = Typography;

const PreviewContainer = styled.div`
    min-width: 280px;
    max-width: 360px;
    padding: 8px 0;
`;

const StatRow = styled(Row)`
    margin-bottom: 16px;
`;

const WarningBox = styled.div<{ $severity: 'high' | 'medium' | 'low' }>`
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    background-color: ${(props) => {
        switch (props.$severity) {
            case 'high': return 'rgba(255, 77, 79, 0.1)';
            case 'medium': return 'rgba(250, 173, 20, 0.1)';
            default: return 'rgba(82, 196, 26, 0.1)';
        }
    }};
    border: 1px solid ${(props) => {
        switch (props.$severity) {
            case 'high': return 'rgba(255, 77, 79, 0.3)';
            case 'medium': return 'rgba(250, 173, 20, 0.3)';
            default: return 'rgba(82, 196, 26, 0.3)';
        }
    }};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid var(--ant-color-border-secondary, rgba(5, 5, 5, 0.06));
`;

export interface FilterPreviewProps {
    query: string;
    onConfirm: () => void;
    onCancel: () => void;
    open: boolean;
    children: React.ReactNode;
    thresholds?: {
        high: number;
        medium: number;
    };
}

export const FilterPreview: React.FC<FilterPreviewProps> = ({
    query,
    onConfirm,
    onCancel,
    open,
    children,
    thresholds = { high: 1000, medium: 100 },
}) => {
    const { t } = useTranslation('targets');

    const { data, isLoading } = useGetTargets(
        { q: query || undefined, limit: 1, offset: 0 },
        { query: { enabled: open && !!query, staleTime: 5000 } }
    );

    const totalCount = data?.total || 0;

    const severity = useMemo(() => {
        if (totalCount >= thresholds.high) return 'high';
        if (totalCount >= thresholds.medium) return 'medium';
        return 'low';
    }, [totalCount, thresholds]);

    const severityConfig = useMemo(() => ({
        high: {
            icon: <ExclamationCircleOutlined style={{ color: 'var(--ant-color-error)', fontSize: 24 }} />,
            title: t('filterPreview.highWarning', { defaultValue: 'Large Scale Operation' }),
            description: t('filterPreview.highWarningDesc', {
                count: totalCount,
                defaultValue: `This filter affects ${totalCount.toLocaleString()} targets. Please review carefully.`
            }),
            color: 'var(--ant-color-error)',
        },
        medium: {
            icon: <WarningOutlined style={{ color: 'var(--ant-color-warning)', fontSize: 24 }} />,
            title: t('filterPreview.mediumWarning', { defaultValue: 'Moderate Scale' }),
            description: t('filterPreview.mediumWarningDesc', {
                count: totalCount,
                defaultValue: `This filter affects ${totalCount.toLocaleString()} targets.`
            }),
            color: 'var(--ant-color-warning)',
        },
        low: {
            icon: <CheckCircleOutlined style={{ color: 'var(--ant-color-success)', fontSize: 24 }} />,
            title: t('filterPreview.safeOperation', { defaultValue: 'Safe Operation' }),
            description: t('filterPreview.safeOperationDesc', {
                count: totalCount,
                defaultValue: `This filter affects ${totalCount.toLocaleString()} targets.`
            }),
            color: 'var(--ant-color-success)',
        },
    }), [totalCount, t]);

    const config = severityConfig[severity];

    const content = (
        <PreviewContainer>
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin />
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                        {t('filterPreview.loading', { defaultValue: 'Analyzing filter...' })}
                    </Text>
                </div>
            ) : (
                <>
                    <WarningBox $severity={severity}>
                        <Space align="start">
                            {config.icon}
                            <div>
                                <Text strong style={{ color: config.color }}>
                                    {config.title}
                                </Text>
                                <Text type="secondary" style={{ display: 'block', fontSize: 'var(--ant-font-size-sm)', marginTop: 4 }}>
                                    {config.description}
                                </Text>
                            </div>
                        </Space>
                    </WarningBox>

                    <StatRow gutter={16}>
                        <Col span={24}>
                            <Statistic
                                title={t('filterPreview.affectedTargets', { defaultValue: 'Affected Targets' })}
                                value={totalCount}
                                valueStyle={{
                                    color: config.color,
                                    fontSize: 28,
                                    fontWeight: 600,
                                }}
                            />
                        </Col>
                    </StatRow>

                    {query && (
                        <div style={{ marginBottom: 12 }}>
                            <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>
                                {t('filterPreview.query', { defaultValue: 'Query:' })}
                            </Text>
                            <Text
                                code
                                style={{
                                    display: 'block',
                                    marginTop: 4,
                                    fontSize: 'var(--ant-font-size-sm)',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {query}
                            </Text>
                        </div>
                    )}

                    <ButtonGroup>
                        <Button size="small" onClick={onCancel}>
                            {t('filterPreview.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            onClick={onConfirm}
                            danger={severity === 'high'}
                        >
                            {severity === 'high'
                                ? t('filterPreview.confirmAnyway', { defaultValue: 'Apply Anyway' })
                                : t('filterPreview.confirm', { defaultValue: 'Apply Filter' })
                            }
                        </Button>
                    </ButtonGroup>
                </>
            )}
        </PreviewContainer>
    );

    return (
        <Popover
            content={content}
            title={
                <Space>
                    <EyeOutlined />
                    {t('filterPreview.title', { defaultValue: 'Filter Preview' })}
                </Space>
            }
            trigger="click"
            open={open}
            placement="bottom"
        >
            {children}
        </Popover>
    );
};

export default FilterPreview;
