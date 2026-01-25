import { useEffect } from 'react';
import { message, notification } from 'antd';
import React from 'react';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import type { WebSocketMessage } from '@/api/websocket/types';

interface RolloutPayload {
    id: number;
    status?: string;
}

interface ActionPayload {
    id: number;
    targetId?: string;
    status?: string;
}

interface TargetPayload {
    controllerId: string;
    status?: string;
}

export const useWebSocketNotifications = () => {
    useEffect(() => {
        const handleWebSocketMessage = (event: Event) => {
            const customEvent = event as CustomEvent<WebSocketMessage>;
            const wsMessage = customEvent.detail;
            const { eventType, entityType, payload } = wsMessage;

            if (entityType === 'ROLLOUT' && eventType === 'STOPPED') {
                const rolloutPayload = payload as RolloutPayload;
                notification.error({
                    message: 'Rollout Stopped',
                    description: `Rollout #${rolloutPayload.id} has been stopped. Check error logs for details.`,
                    icon: React.createElement(CloseCircleOutlined, { style: { color: '#dc2626' } }),
                    placement: 'topRight',
                    duration: 8,
                });
                return;
            }

            if (entityType === 'ACTION' && eventType === 'CREATED') {
                const actionPayload = payload as ActionPayload;
                message.success({
                    content: `New deployment action #${actionPayload.id} created`,
                    icon: React.createElement(ThunderboltOutlined),
                    duration: 3,
                });
                return;
            }

            if (entityType === 'ACTION' && eventType === 'UPDATE') {
                const actionPayload = payload as ActionPayload;
                
                if (actionPayload.status === 'FINISHED') {
                    message.success({
                        content: `Action #${actionPayload.id} completed successfully`,
                        icon: React.createElement(CheckCircleOutlined),
                        duration: 2,
                    });
                } else if (actionPayload.status === 'ERROR' || actionPayload.status === 'CANCELED') {
                    notification.warning({
                        message: 'Action Failed',
                        description: `Action #${actionPayload.id} ended with status: ${actionPayload.status}`,
                        icon: React.createElement(WarningOutlined, { style: { color: '#f59e0b' } }),
                        placement: 'topRight',
                        duration: 5,
                    });
                }
                return;
            }

            if (entityType === 'TARGET' && eventType === 'UPDATE') {
                const targetPayload = payload as TargetPayload;
                
                if (targetPayload.status === 'ONLINE') {
                    message.info({
                        content: `Device ${targetPayload.controllerId} is now online`,
                        duration: 2,
                    });
                }
            }
        };

        window.addEventListener('websocket-message', handleWebSocketMessage);

        return () => {
            window.removeEventListener('websocket-message', handleWebSocketMessage);
        };
    }, []);
};
