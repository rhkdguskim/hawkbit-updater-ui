import { Client, type IFrame, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketConfig, WebSocketConnectionState, WebSocketMessage } from './types';

export type MessageHandler = (message: WebSocketMessage) => void;
export type ConnectionStateHandler = (state: WebSocketConnectionState) => void;

export class WebSocketClient {
    private client: Client | null = null;
    private config: WebSocketConfig;
    private subscriptions: Map<string, string> = new Map();
    private messageHandlers: Map<string, MessageHandler[]> = new Map();
    private connectionStateHandlers: ConnectionStateHandler[] = [];
    private currentState: WebSocketConnectionState = 'DISCONNECTED';

    constructor(config: WebSocketConfig) {
        this.config = {
            reconnectDelay: 5000,
            heartbeatIncoming: 20000,
            heartbeatOutgoing: 20000,
            debug: false,
            ...config,
        };
    }

    connect(): void {
        if (this.client?.connected) {
            console.warn('[WebSocket] Already connected');
            return;
        }

        this.updateState('CONNECTING');

        this.client = new Client({
            webSocketFactory: () => {
                const sock = new SockJS(this.config.endpoint);
                return sock as unknown as WebSocket;
            },
            reconnectDelay: this.config.reconnectDelay,
            heartbeatIncoming: this.config.heartbeatIncoming,
            heartbeatOutgoing: this.config.heartbeatOutgoing,
            debug: this.config.debug ? (str) => console.log('[STOMP]', str) : undefined,

            onConnect: () => {
                this.updateState('CONNECTED');
                this.resubscribeAll();
            },

            onDisconnect: () => {
                this.updateState('DISCONNECTED');
            },

            onStompError: (frame: IFrame) => {
                console.error('[WebSocket] STOMP error:', frame.headers['message'], frame.body);
                this.updateState('ERROR');
            },

            onWebSocketError: (event: Event) => {
                console.error('[WebSocket] WebSocket error:', event);
                this.updateState('ERROR');
            },
        });

        this.client.activate();
    }

    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.subscriptions.clear();
        this.updateState('DISCONNECTED');
    }

    subscribe(topic: string, handler: MessageHandler): () => void {
        if (!this.messageHandlers.has(topic)) {
            this.messageHandlers.set(topic, []);
        }
        this.messageHandlers.get(topic)!.push(handler);

        if (this.client?.connected && !this.subscriptions.has(topic)) {
            this.subscribeToTopic(topic);
        }

        return () => {
            const handlers = this.messageHandlers.get(topic);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
                if (handlers.length === 0) {
                    this.unsubscribeFromTopic(topic);
                    this.messageHandlers.delete(topic);
                }
            }
        };
    }

    onConnectionStateChange(handler: ConnectionStateHandler): () => void {
        this.connectionStateHandlers.push(handler);
        handler(this.currentState);

        return () => {
            const index = this.connectionStateHandlers.indexOf(handler);
            if (index > -1) {
                this.connectionStateHandlers.splice(index, 1);
            }
        };
    }

    getConnectionState(): WebSocketConnectionState {
        return this.currentState;
    }

    private subscribeToTopic(topic: string): void {
        if (!this.client?.connected) return;

        const subscription = this.client.subscribe(topic, (message: IMessage) => {
            this.handleMessage(topic, message);
        });

        this.subscriptions.set(topic, subscription.id);
    }

    private unsubscribeFromTopic(topic: string): void {
        const subscriptionId = this.subscriptions.get(topic);
        if (subscriptionId && this.client?.connected) {
            this.client.unsubscribe(subscriptionId);
        }
        this.subscriptions.delete(topic);
    }

    private resubscribeAll(): void {
        const topics = Array.from(this.messageHandlers.keys());
        this.subscriptions.clear();
        topics.forEach((topic) => this.subscribeToTopic(topic));
    }

    private handleMessage(topic: string, message: IMessage): void {
        try {
            const parsedMessage: WebSocketMessage = JSON.parse(message.body);
            const handlers = this.messageHandlers.get(topic);
            if (handlers) {
                handlers.forEach((handler) => handler(parsedMessage));
            }
        } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error, message.body);
        }
    }

    private updateState(state: WebSocketConnectionState): void {
        this.currentState = state;
        this.connectionStateHandlers.forEach((handler) => handler(state));
    }
}
