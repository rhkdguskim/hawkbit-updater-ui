import React from 'react';
import { Flex, Skeleton, Typography } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard, ChartLegendItem, IconBadge } from '@/components/patterns/DashboardStyles';

const { Text } = Typography;

export type DonutChartDatum = {
    name: string;
    value: number;
    color: string;
};

type DonutChartCardProps = {
    isLoading: boolean;
    data: DonutChartDatum[];
    theme: 'targets' | 'rollouts' | 'connectivity' | 'distributions' | 'fragmentation';
    icon: React.ReactNode;
    title: string;
    subtitle: React.ReactNode;
    emptyText: string;
    delay?: number;
    legendLimit?: number;
    legendGap?: number;
    legendItemStyle?: React.CSSProperties;
    legendDotStyle?: React.CSSProperties;
    legendTextStyle?: React.CSSProperties;
    paddingAngle?: number;
    showShadow?: boolean;
};

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
    isLoading,
    data,
    theme,
    icon,
    title,
    subtitle,
    emptyText,
    delay = 0,
    legendLimit,
    legendGap = 4,
    legendItemStyle,
    legendDotStyle,
    legendTextStyle,
    paddingAngle = 4,
    showShadow = false,
}) => {
    const legendData = legendLimit ? data.slice(0, legendLimit) : data;
    const baseLegendItemStyle: React.CSSProperties = { padding: '6px 10px' };
    const baseLegendDotStyle: React.CSSProperties = { width: 10, height: 10, borderRadius: 3, flexShrink: 0 };
    const baseLegendTextStyle: React.CSSProperties = { fontSize: 'var(--ant-font-size-sm)', whiteSpace: 'nowrap' };

    return (
        <ChartCard
            $theme={theme}
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme={theme}>
                        {icon}
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 'var(--ant-font-size)', fontWeight: 600 }}>{title}</span>
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{subtitle}</Text>
                    </Flex>
                </Flex>
            }
            $delay={delay}
        >
            {isLoading ? (
                <Skeleton.Avatar active size={80} shape="circle" style={{ margin: '12px auto', display: 'block' }} />
            ) : data.length > 0 ? (
                <Flex gap={8} style={{ flex: 1 }} align="center">
                    <ResponsiveContainer width="45%" height={100}>
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={28}
                                outerRadius={42}
                                paddingAngle={paddingAngle}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        style={showShadow ? { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' } : undefined}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <Flex vertical gap={legendGap} style={{ flex: 1, minWidth: 0 }}>
                        {legendData.map(entry => (
                            <ChartLegendItem key={entry.name} style={{ ...baseLegendItemStyle, ...legendItemStyle }}>
                                <Flex align="center" gap={6}>
                                    <div
                                        style={{
                                            ...baseLegendDotStyle,
                                            ...legendDotStyle,
                                            background: entry.color,
                                        }}
                                    />
                                    <Text style={{ ...baseLegendTextStyle, ...legendTextStyle }}>{entry.name}</Text>
                                </Flex>
                                <Text strong style={{ fontSize: 'var(--ant-font-size-sm)', color: entry.color }}>{entry.value}</Text>
                            </ChartLegendItem>
                        ))}
                    </Flex>
                </Flex>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{emptyText}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};
