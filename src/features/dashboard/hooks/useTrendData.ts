import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';

interface MetricStats {
    totalTargets: number;
    onlineCount: number;
    offlineCount: number;
    successRate: number;
}

const STORAGE_KEY = 'dashboard_daily_stats_v1';

export const useTrendData = (currentStats: MetricStats, loading: boolean) => {
    const [history, setHistory] = useState<(MetricStats & { date: string })[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to load trend data", e);
            return [];
        }
    });

    const trends = useMemo(() => {
        const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        const yesterdayData = history.find(d => d.date === yesterdayStr);

        if (yesterdayData) {
            const calcTrend = (now: number, prev: number) => {
                if (prev === 0) return now > 0 ? 100 : 0;
                return Number(((now - prev) / prev * 100).toFixed(1));
            };

            return {
                totalTargets: calcTrend(currentStats.totalTargets, yesterdayData.totalTargets),
                onlineCount: calcTrend(currentStats.onlineCount, yesterdayData.onlineCount),
                offlineCount: calcTrend(currentStats.offlineCount, yesterdayData.offlineCount),
                successRate: calcTrend(currentStats.successRate, yesterdayData.successRate),
                hasHistory: true
            };
        }
        return {
            totalTargets: null,
            onlineCount: null,
            offlineCount: null,
            successRate: null,
            hasHistory: false
        };
    }, [currentStats, history]);

    useEffect(() => {
        if (loading) return;

        const todayStr = dayjs().format('YYYY-MM-DD');
        const currentData = { date: todayStr, ...currentStats };

        queueMicrotask(() => {
            setHistory(prev => {
                // Check if we need to update
                const existingToday = prev.find(d => d.date === todayStr);
                if (existingToday &&
                    existingToday.totalTargets === currentStats.totalTargets &&
                    existingToday.onlineCount === currentStats.onlineCount &&
                    existingToday.offlineCount === currentStats.offlineCount &&
                    existingToday.successRate === currentStats.successRate) {
                    return prev;
                }

                const newHistory = [currentData, ...prev.filter(d => d.date !== todayStr)].slice(0, 7);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
                return newHistory;
            });
        });
    }, [loading, currentStats]);

    return trends;
};
