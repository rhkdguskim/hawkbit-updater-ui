import React from 'react';
import { Typography, List, Flex, Empty, Spin, Tag, Tooltip } from 'antd';
import { WarningOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ListCard } from '../DashboardStyles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface HighErrorTargetsWidgetProps {
    isLoading: boolean;
    data: { id: string; count: number; name: string }[];
}

export const HighErrorTargetsWidget: React.FC<HighErrorTargetsWidgetProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common', 'targets']);
    const navigate = useNavigate();

    return (
        <ListCard title={
            <Flex align="center" gap={8}>
                <WarningOutlined style={{ color: 'var(--ant-color-error)' }} />
                <span>{t('actionRequired.highErrorTargets', 'Reliability Alert (High Error Targets)')}</span>
            </Flex>
        } style={{ height: '100%' }}>
            {isLoading ? (
                <Flex align="center" justify="center" style={{ height: 180 }}>
                    <Spin />
                </Flex>
            ) : data.length === 0 ? (
                <Flex vertical align="center" justify="center" style={{ height: 160, opacity: 0.6 }}>
                    <Text type="secondary">{t('actionRequired.allHealthy', 'All targets healthy')}</Text>
                </Flex>
            ) : (
                <List
                    size="small"
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            style={{ padding: '8px 4px', cursor: 'pointer' }}
                            onClick={() => navigate(`/targets/${item.id}`)}
                            extra={
                                <Flex align="center" gap={8}>
                                    <Tag color="error" style={{ margin: 0, borderRadius: 10, fontFamily: 'var(--font-mono)' }}>
                                        {item.count} {t('common:status.failed', 'Failures')}
                                    </Tag>
                                    <ArrowRightOutlined style={{ fontSize: 12, opacity: 0.3 }} />
                                </Flex>
                            }
                        >
                            <List.Item.Meta
                                title={
                                    <Tooltip title={`ID: ${item.id}`}>
                                        <Text strong style={{ fontSize: 'var(--ant-font-size-sm)' }}>{item.name}</Text>
                                    </Tooltip>
                                }
                                description={
                                    <Text type="secondary" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>{item.id}</Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </ListCard>
    );
};
