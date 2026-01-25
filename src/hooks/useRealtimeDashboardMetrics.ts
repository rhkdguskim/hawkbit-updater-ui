import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import type { WebSocketMessage } from '@/api/websocket/types';

interface RealtimeMetrics {
    totalTargets: number;
    onlineTargets: number;
    activeActions: number;
    pendingApprovals: number;
    activeRollouts: number;
    errorRate1h: number;
    pausedRollouts: number;
    delayedActions: number;
    lastEventTimestamp: number;
}

export const useRealtimeDashboardMetrics = () => {
    const queryClient = useQueryClient();
    const { isConnected } = useWebSocket();
    const [metrics, setMetrics] = useState<RealtimeMetrics>({
        totalTargets: 0,
        onlineTargets: 0,
        activeActions: 0,
        pendingApprovals: 0,
        activeRollouts: 0,
        errorRate1h: 0,
        pausedRollouts: 0,
        delayedActions: 0,
        lastEventTimestamp: Date.now(),
    });

    const handleWebSocketMessage = useCallback((event: CustomEvent) => {
        const message = event.detail as WebSocketMessage;
        
        setMetrics(prev => ({
            ...prev,
            lastEventTimestamp: Date.now(),
        }));

        switch (message.entityType) {
            case 'TARGET':
                queryClient.invalidateQueries({ queryKey: ['targets'] });
                break;
            case 'ACTION':
            case 'ASSIGNMENT':
            case 'MULTI_ACTION':
                queryClient.invalidateQueries({ queryKey: ['actions'] });
                break;
            case 'ROLLOUT':
            case 'ROLLOUT_GROUP':
                queryClient.invalidateQueries({ queryKey: ['rollouts'] });
                break;
        }
    }, [queryClient]);

    useEffect(() => {
        window.addEventListener('websocket-message', handleWebSocketMessage as EventListener);
        return () => {
            window.removeEventListener('websocket-message', handleWebSocketMessage as EventListener);
        };
    }, [handleWebSocketMessage]);

    const updateMetrics = useCallback((updates: Partial<RealtimeMetrics>) => {
        setMetrics(prev => ({
            ...prev,
            ...updates,
            lastEventTimestamp: Date.now(),
        }));
    }, []);

    return {
        metrics,
        updateMetrics,
        isRealtimeActive: isConnected,
        lastUpdated: new Date(metrics.lastEventTimestamp).toISOString(),
    };
};
