export type EventType = 'CREATED' | 'UPDATE' | 'DELETED' | 'STOPPED' | 'POLL';

export type EntityType =
    | 'ACTION'
    | 'ASSIGNMENT'
    | 'MULTI_ACTION'
    | 'TARGET'
    | 'ROLLOUT'
    | 'ROLLOUT_GROUP'
    | 'SYSTEM_CONFIG'
    | 'DOWNLOAD_PROGRESS'
    | 'DistributionSet'
    | 'SoftwareModule';

export interface WebSocketMessage<T = unknown> {
    eventType: EventType;
    entityType: EntityType;
    entityClass?: string;
    payload: T;
    timestamp?: number;
}

export interface ActionEventPayload {
    id: number;
    targetId?: string;
    status?: string;
}

export interface AssignmentEventPayload {
    distributionSetId?: number; // Optional: only present for TargetAssignDistributionSetEvent
    totalActions: number;
}

export interface MultiActionEventPayload {
    controllerIds: string[];
    actionIds: number[];
}

export interface TargetEventPayload {
    controllerId: string;
    status?: string;
}

export interface RolloutEventPayload {
    id: number;
    status?: string;
}

export interface RolloutGroupEventPayload {
    rolloutId: number;
    id: number;
    status?: string;
}

export interface SystemConfigEventPayload {
    key: string;
    value: string;
}

export interface DownloadProgressEventPayload {
    actionStatusId: number;
    shippedBytes: number;
}

export type WebSocketConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface WebSocketConfig {
    endpoint: string;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    debug?: boolean;
}
