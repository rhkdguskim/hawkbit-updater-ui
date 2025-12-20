export interface TrendMetric {
    current: number;
    trend: number; // Percentage change (e.g., 5.2 for +5.2%)
    history: number[]; // Last 24h points for sparkline
}

export const mockKPIData = {
    totalTargets: { current: 1250, trend: 5.2, history: [1100, 1150, 1200, 1220, 1250] },
    onlineRate: { current: 98.5, trend: 0.5, history: [95, 96, 97, 98, 98.5] },
    successRate: { current: 99.2, trend: -0.8, history: [100, 99, 98, 99, 99.2] },
    pendingActions: { current: 45, trend: 12.0, history: [20, 30, 40, 42, 45] },
};

export const mockFailureData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    timeout: Math.floor(Math.random() * 5),
    installError: Math.floor(Math.random() * 3),
    networkError: Math.floor(Math.random() * 2),
}));

export const mockVersionData = [
    { name: 'v2.0 (Stable)', size: 800, fill: '#52c41a' },
    { name: 'v2.1 (Canary)', size: 100, fill: '#1890ff' },
    { name: 'v1.5 (Legacy)', size: 300, fill: '#faad14' },
    { name: 'v1.0 (Deprecated)', size: 50, fill: '#ff4d4f' },
];

export const mockLogs = [
    { id: 1, time: '10:05:23', type: 'error', message: 'Target-102 update failed: Timeout' },
    { id: 2, time: '10:05:10', type: 'info', message: 'Rollout "Seoul-Patch-V2" Group 2 started' },
    { id: 3, time: '10:04:55', type: 'success', message: 'Target-501 update completed successfully' },
    { id: 4, time: '10:04:12', type: 'warning', message: 'Target-303 is offline for > 1 hour' },
    { id: 5, time: '10:03:00', type: 'info', message: 'System maintenance scheduled for 22:00 UTC' },
];
