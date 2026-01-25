export const WEB_SOCKET_TOPICS = {
    ACTIONS: '/topic/events/actions',
    TARGETS: '/topic/events/targets',
    ROLLOUTS: '/topic/events/rollouts',
    SYSTEM: '/topic/events/system',
    REPOSITORY: '/topic/events/repository',
    DOWNLOADS: '/topic/events/downloads',
} as const;

export type WebSocketTopic = typeof WEB_SOCKET_TOPICS[keyof typeof WEB_SOCKET_TOPICS];
