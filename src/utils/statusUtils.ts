

// We'll use a functional approach or just pure functions. 
// Since we need translation, we might need a hook or pass the t function.
// For a pure utility, assuming the caller passes 't' or we return the key.
// Let's return the key and let the component translate, OR accept 't'.

// To keep it simple and consistent with usage (e.g. inside components), 
// we can export a hook or just helper functions. 
// Given the existing code uses `t`, let's make a helper that accepts `t`.

export type StatusType =
    | 'finished' | 'running' | 'paused' | 'ready' | 'creating'
    | 'starting' | 'error' | 'waiting_for_approval' | 'scheduled'
    | 'pending' | 'retrieving' | 'retrieved' | 'downloading'
    | 'active' | 'completed' | 'canceled' | 'failed';

export const getStatusColor = (status?: string): string => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
        case 'finished':
        case 'completed':
        case 'success':
            return 'success';
        case 'running':
        case 'active':
        case 'retrieving':
        case 'retrieved':
        case 'downloading':
        case 'processing':
            return 'processing';
        case 'paused':
            return 'warning';
        case 'ready':
            return 'cyan';
        case 'creating':
        case 'scheduled':
        case 'pending':
            return 'default';
        case 'starting':
            return 'blue';
        case 'error':
        case 'failed':
        case 'canceled':
            return 'error';
        case 'waiting_for_approval':
            return 'purple';
        default:
            return 'default';
    }
};

export const getStatusLabel = (status: string, t: (key: string, options?: any) => string): string => {
    if (!status) return t('common:status.unknown', { defaultValue: 'UNKNOWN' });
    const key = status.toLowerCase();
    // Try to find a specific key, simple fallback handled by i18next usually if configured, 
    // but here we provide a default value logic similar to existing code.
    return t(`common:status.${key}`, { defaultValue: status.replace(/_/g, ' ').toUpperCase() });
};
