import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketClient } from '@/api/websocket/client';
import { WEB_SOCKET_TOPICS } from '@/api/websocket/topics';
import type {
    WebSocketConnectionState,
    WebSocketMessage,
    ActionEventPayload,
    TargetEventPayload,
    RolloutEventPayload,
} from '@/api/websocket/types';
import { useAuthStore } from '@/stores/useAuthStore';

const WS_ENDPOINT = '/ws/stomp';

export const useWebSocket = () => {
    const queryClient = useQueryClient();
    const clientRef = useRef<WebSocketClient | null>(null);
    const [connectionState, setConnectionState] = useState<WebSocketConnectionState>('DISCONNECTED');
    const { isAuthenticated } = useAuthStore();

    const handleActionEvent = useCallback((message: WebSocketMessage) => {
        const { eventType, payload } = message;
        const actionPayload = payload as ActionEventPayload;

        console.log('[WebSocket] Action event:', eventType, actionPayload);

        window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));

        switch (eventType) {
            case 'CREATED':
            case 'UPDATE':
                queryClient.invalidateQueries({ queryKey: ['actions'] });
                if (actionPayload.targetId) {
                    queryClient.invalidateQueries({ queryKey: ['target', actionPayload.targetId, 'actions'] });
                }
                break;
        }
    }, [queryClient]);

    const handleTargetEvent = useCallback((message: WebSocketMessage) => {
        const { eventType, payload } = message;
        const targetPayload = payload as TargetEventPayload;

        console.log('[WebSocket] Target event:', eventType, targetPayload);

        window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));

        switch (eventType) {
            case 'CREATED':
            case 'UPDATE':
                queryClient.invalidateQueries({ queryKey: ['targets'] });
                queryClient.invalidateQueries({ queryKey: ['target', targetPayload.controllerId] });
                break;
            case 'POLL':
                queryClient.setQueryData(['target', targetPayload.controllerId, 'lastSeen'], Date.now());
                break;
        }
    }, [queryClient]);

    const handleRolloutEvent = useCallback((message: WebSocketMessage) => {
        const { eventType, payload } = message;
        const rolloutPayload = payload as RolloutEventPayload;

        console.log('[WebSocket] Rollout event:', eventType, rolloutPayload);

        window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));

        switch (eventType) {
            case 'UPDATE':
            case 'STOPPED':
                queryClient.invalidateQueries({ queryKey: ['rollouts'] });
                queryClient.invalidateQueries({ queryKey: ['rollout', rolloutPayload.id] });
                queryClient.invalidateQueries({ queryKey: ['actions'] });
                break;
        }
    }, [queryClient]);

    const handleRepositoryEvent = useCallback((message: WebSocketMessage) => {
        const { eventType, entityClass } = message;

        console.log('[WebSocket] Repository event:', eventType, entityClass);

        switch (entityClass) {
            case 'DistributionSet':
                queryClient.invalidateQueries({ queryKey: ['distributionSets'] });
                break;
            case 'SoftwareModule':
                queryClient.invalidateQueries({ queryKey: ['softwareModules'] });
                break;
        }
    }, [queryClient]);

    const handleSystemEvent = useCallback((message: WebSocketMessage) => {
        console.log('[WebSocket] System event:', message);
        queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
    }, [queryClient]);

    useEffect(() => {
        if (!isAuthenticated) {
            if (clientRef.current) {
                clientRef.current.disconnect();
                clientRef.current = null;
            }
            return;
        }

        const baseURL = import.meta.env.VITE_API_BASE_URL || '';
        const wsUrl = `${baseURL}${WS_ENDPOINT}`;

        const client = new WebSocketClient({
            endpoint: wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 20000,
            heartbeatOutgoing: 20000,
            debug: import.meta.env.DEV,
        });

        clientRef.current = client;

        const unsubscribeState = client.onConnectionStateChange(setConnectionState);

        client.connect();

        const unsubscribeActions = client.subscribe(WEB_SOCKET_TOPICS.ACTIONS, handleActionEvent);
        const unsubscribeTargets = client.subscribe(WEB_SOCKET_TOPICS.TARGETS, handleTargetEvent);
        const unsubscribeRollouts = client.subscribe(WEB_SOCKET_TOPICS.ROLLOUTS, handleRolloutEvent);
        const unsubscribeRepository = client.subscribe(WEB_SOCKET_TOPICS.REPOSITORY, handleRepositoryEvent);
        const unsubscribeSystem = client.subscribe(WEB_SOCKET_TOPICS.SYSTEM, handleSystemEvent);

        return () => {
            unsubscribeActions();
            unsubscribeTargets();
            unsubscribeRollouts();
            unsubscribeRepository();
            unsubscribeSystem();
            unsubscribeState();
            client.disconnect();
        };
    }, [isAuthenticated, handleActionEvent, handleTargetEvent, handleRolloutEvent, handleRepositoryEvent, handleSystemEvent]);

    return {
        connectionState,
        isConnected: connectionState === 'CONNECTED',
        client: clientRef.current,
    };
};
