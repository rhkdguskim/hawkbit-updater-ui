import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

interface FailureChartProps {
    data: any[];
}

const FailureChart: React.FC<FailureChartProps> = ({ data }) => {
    const { t } = useTranslation('dashboard');
    return (
        <Card
            title={t('charts.failureAnalysis')}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="timeout" stackId="a" fill="#ff4d4f" name={t('charts.timeout')} />
                    <Bar dataKey="installError" stackId="a" fill="#ffa940" name={t('charts.installError')} />
                    <Bar dataKey="networkError" stackId="a" fill="#ffec3d" name={t('charts.networkError')} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default FailureChart;