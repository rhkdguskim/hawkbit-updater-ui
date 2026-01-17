import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface DonutChartProps {
    data: { name: string; value: number; color: string }[];
    height: number;
    showLegend?: boolean;
    tooltipTitle?: string;
    centerLabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    height,
    showLegend = true,
    tooltipTitle = 'Value',
    centerLabel,
}) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const formatPercent = (value: number) => total > 0 ? (value / total) * 100 : 0;

    const renderLabel = (entry: { name?: string; value?: number }) => {
        const value = entry.value ?? 0;
        const percent = formatPercent(value);
        return `${entry.name || tooltipTitle}: ${percent.toFixed(1)}%`;
    };

    const tooltipFormatter = (value: number | string | undefined, name?: string) => {
        const numericValue = Number(value ?? 0);
        const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
        const percent = formatPercent(safeValue);
        const label = name || tooltipTitle;
        return [`${safeValue} (${percent.toFixed(1)}%)`, label];
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="70%"
                    outerRadius="100%"
                    paddingAngle={2}
                    labelLine={true}
                    label={renderLabel}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                {centerLabel && (
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="var(--ant-color-text)"
                        style={{ fontSize: 'var(--ant-font-size-xl)', fontWeight: 700 }}
                    >
                        {centerLabel}
                    </text>
                )}
                {showLegend && <Legend verticalAlign="bottom" align="center" />}
                <RechartsTooltip formatter={tooltipFormatter} />
            </PieChart>
        </ResponsiveContainer>
    );
};
