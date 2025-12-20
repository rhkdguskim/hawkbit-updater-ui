import React from 'react';
import { Card, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { MgmtAction } from '@/api/generated/model';
import { useNavigate } from 'react-router-dom';

interface ActionFunnelChartProps {
    actions: MgmtAction[];
    loading?: boolean;
}

const StyledCard = styled(Card)`
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    .recharts-rectangle {
        cursor: pointer;
    }
`;

export const ActionFunnelChart: React.FC<ActionFunnelChartProps> = ({ actions, loading }) => {
    const { t } = useTranslation('dashboard');
    const navigate = useNavigate();

    const processData = () => {
        let pending = 0;
        let running = 0;
        let finished = 0;
        let error = 0;

        actions.forEach(a => {
            const s = a.status?.toLowerCase();
            if (s === 'scheduled' || s === 'retrieving') pending++;
            else if (s === 'running') running++;
            else if (s === 'finished') finished++;
            else if (s === 'error' || s === 'canceled') error++;
        });

        return [
            { name: t('actionFunnel.pending'), status: 'scheduled', value: pending, color: '#faad14' },
            { name: t('actionFunnel.running'), status: 'running', value: running, color: '#1890ff' },
            { name: t('actionFunnel.finished'), status: 'finished', value: finished, color: '#52c41a' }, // Finished in loaded buffer
            //{ name: 'Error', status: 'error', value: error, color: '#ff4d4f' } // Maybe exclude error from funnel? Or include?
        ];
    };

    const data = processData();
    const hasData = actions.length > 0;

    const handleClick = (entry: any) => {
        if (entry && entry.status) {
            navigate(`/actions?q=status==${entry.status}`);
        }
    };

    return (
        <StyledCard loading={loading} title={t('actionFunnel.title')}>
            {!hasData ? (
                <Empty description={t('empty.noActions')} />
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={32}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 13, fontWeight: 500 }}
                            width={80}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                            contentStyle={{ borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} onClick={() => handleClick(entry)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </StyledCard>
    );
};
