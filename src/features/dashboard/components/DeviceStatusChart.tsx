import React from 'react';
import { Card, Empty } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface DeviceStatusChartProps {
    total: number;
    onlineCount: number;
    offlineCount: number;
    loading?: boolean;
}

const StyledCard = styled(Card)`
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .recharts-legend-item {
        cursor: pointer;
    }
`;

const COLORS = {
    Online: '#52c41a',
    Offline: '#cf1322'
};

export const DeviceStatusChart: React.FC<DeviceStatusChartProps> = ({
    total,
    onlineCount,
    offlineCount,
    loading
}) => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();

    const data = [
        { name: 'Online', value: onlineCount, color: COLORS.Online },
        { name: 'Offline', value: offlineCount, color: COLORS.Offline }
    ];

    const handleClick = (entry: any) => {
        if (entry.name === 'Online') {
            navigate('/targets?q=pollStatus.overdue==false');
        } else if (entry.name === 'Offline') {
            navigate('/targets?q=pollStatus.overdue==true');
        }
    };

    return (
        <StyledCard loading={loading} title={t('charts.deviceStatus')}>
            {total === 0 ? (
                <Empty description={t('empty.noDevices')} />
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            cursor="pointer"
                            onClick={(entry) => handleClick(entry)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`${value} Devices`, '']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            onClick={(e: any) => handleClick({ name: e.value })}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
            {/* Overlay for center text */}
            {total > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    marginTop: '24px' // adjusting for title
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f1f1f' }}>{total}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Total</div>
                </div>
            )}
        </StyledCard>
    );
};
