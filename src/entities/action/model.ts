/**
 * Action Entity Model
 * 
 * Pure functions for Action domain logic.
 */



interface ActionLike {
    status?: string | null;
    detailStatus?: string | null;
    lastStatusCode?: number | null;
}

/**
 * Checks if an action has an error state.
 */
export const isActionErrored = (action: ActionLike): boolean => {
    const status = (action.status as string)?.toLowerCase() || '';
    const detail = action.detailStatus?.toLowerCase() || '';

    const hasErrorStatus = status === 'error' || status === 'failed';
    const hasErrorDetail = detail.includes('error') || detail.includes('failed');
    const hasErrorCode = typeof action.lastStatusCode === 'number' && action.lastStatusCode >= 400;

    return hasErrorStatus || hasErrorDetail || hasErrorCode;
};

/**
 * Checks if an action is in a terminal state (finished, error, canceled).
 */
export const isTerminalState = (action: ActionLike): boolean => {
    const status = (action.status as string)?.toLowerCase() || '';
    return ['finished', 'error', 'canceled'].includes(status);
};

/**
 * Checks if an action is currently active.
 */
export const isActive = (action: ActionLike): boolean => {
    const status = (action.status as string)?.toLowerCase() || '';
    const activeStatuses = ['scheduled', 'pending', 'retrieving', 'running', 'waiting_for_confirmation', 'downloading'];
    return activeStatuses.includes(status) && !isActionErrored(action);
};
