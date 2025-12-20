import React from 'react';
import { Card, Statistic, Typography, Flex } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

const CompactCard = styled(Card)`
    height: 100%;
    .ant-card-body {
        padding: 12px 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
`;

interface KPICardProps {
    title: string;
    value: number | string;
    trend?: number;
    suffix?: string;
    color?: string;
    icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, trend, suffix, color, icon }) => {
    const isPositive = trend && trend > 0;
    const trendColor = isPositive ? '#52c41a' : '#ff4d4f';

    return (
        <CompactCard variant="borderless" style={{ borderLeft: `4px solid ${color || '#1890ff'}` }}>
            <Flex justify="space-between" align="start">
                <Text type="secondary" style={{ fontSize: '13px' }}>{title}</Text>
                {icon && <span style={{ fontSize: '16px', color: color }}>{icon}</span>}
            </Flex>
            <Flex align="baseline" gap={8} style={{ marginTop: 4 }}>
                <Statistic
                    value={value}
                    styles={{ content: { fontSize: '24px', fontWeight: 600 } }}
                    suffix={<span style={{ fontSize: '14px' }}>{suffix}</span>}
                />
                {trend !== undefined && (
                    <Text style={{ color: trendColor, fontSize: '12px' }}>
                        {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {Math.abs(trend)}%
                    </Text>
                )}
            </Flex>
        </CompactCard>
    );
};