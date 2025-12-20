import React from 'react';
import { Card, Empty } from 'antd';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import styled from 'styled-components';
import type { MgmtTarget } from '@/api/generated/model';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface VersionTreemapProps {
    targets: MgmtTarget[];
    loading?: boolean;
}

const StyledCard = styled(Card)`
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .ant-card-body {
        padding: 24px;
        height: 100%;
    }
`;

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

export const VersionTreemap: React.FC<VersionTreemapProps> = ({ targets, loading }) => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();

    if (loading) return <StyledCard loading />;

    // Group by version
    const processData = () => {
        if (!targets || targets.length === 0) return [];

        const groups: Record<string, number> = {};
        targets.forEach(t => {
            // Target address usually contains info about current stack or we can use installedDS
            // For hawkBit, version is often in metadata or we extract from installedDS link
            // Using a simple proxy: extract last part of address or use 'unknown'
            const version = t.address?.split('/').pop() || 'Unknown';
            groups[version] = (groups[version] || 0) + 1;
        });

        // Format for Treemap
        return Object.entries(groups).map(([version, size]) => ({
            name: version,
            version,
            size
        })).sort((a, b) => b.size - a.size);
    };

    const data = processData();

    const CustomizedContent = (props: any) => {
        const { x, y, width, height, index, name, size } = props;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: COLORS[index % COLORS.length],
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 1,
                    }}
                />
                {width > 60 && height > 40 ? (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight={600}
                        dominantBaseline="middle"
                    >
                        {name} ({size})
                    </text>
                ) : null}
            </g>
        );
    };

    return (
        <StyledCard title={t('charts.versionDistribution', 'Version Distribution')}>
            {data.length === 0 ? (
                <Empty description={t('empty.noData', 'No data')} />
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <Treemap
                        data={data}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent />}
                        onClick={(node: any) => {
                            // If we had a version filter, it would go here
                            // navigate(`/targets?q=version==${node.version}`);
                        }}
                    >
                        <Tooltip
                            formatter={(value: number) => [`${value} Targets`, 'Count']}
                        />
                    </Treemap>
                </ResponsiveContainer>
            )}
        </StyledCard>
    );
};
