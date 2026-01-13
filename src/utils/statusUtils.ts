

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
    | 'active' | 'completed' | 'canceled' | 'failed'
    | 'wait_for_confirmation' | 'waiting_for_confirmation' | 'canceling' | 'timeout';

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
        case 'canceling':
            return 'processing';
        case 'paused':
        case 'warning':
        case 'timeout':
        case 'wait_for_confirmation':
        case 'waiting_for_confirmation':
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

/**
 * Standard interface for HawkBit translation options
 */
interface StatusLabelOptions {
    defaultValue?: string;
    [key: string]: string | number | boolean | undefined;
}

export const getStatusLabel = (
    status: string | undefined,
    t: (key: string, options?: StatusLabelOptions) => string
): string => {
    if (!status) return t('common:status.unknown');
    const key = status.toLowerCase();
    // Use common namespace for basic statuses if possible
    return t(`common:status.${key}`);
};

/**
 * Translates common backend messages from HawkBit to localized labels.
 */
export const translateStatusMessage = (
    message: string,
    t: (key: string, options?: any) => string
): string => {
    const trimmed = message.trim();

    // Mapping for common messages
    if (/^Update failed, rollback performed$/i.test(trimmed)) return t('actions:statusMessages.updateFailedRollback');
    if (/^Starting services$/i.test(trimmed)) return t('actions:statusMessages.startingServices');
    if (/^Updating binaries$/i.test(trimmed)) return t('actions:statusMessages.updatingBinaries');
    if (/^Downloading artifacts$/i.test(trimmed)) return t('actions:statusMessages.downloadingArtifacts');
    if (/^Verifying services stopped$/i.test(trimmed)) return t('actions:statusMessages.verifyingServicesStopped');
    if (/^Creating backup$/i.test(trimmed)) return t('actions:statusMessages.creatingBackup');
    if (/^Starting update process$/i.test(trimmed)) return t('actions:statusMessages.startingUpdateProcess');

    // Installation complete variants
    if (/^Installation complete$/i.test(trimmed)) return t('actions:statusMessages.installationComplete');
    if (/^Installation completed$/i.test(trimmed)) return t('actions:statusMessages.installationComplete');
    if (/^Update installed successfully$/i.test(trimmed)) return t('actions:statusMessages.updateInstalledSuccessfully');
    if (/^Update successful$/i.test(trimmed)) return t('actions:statusMessages.updateSuccessful');
    if (/^Finished$/i.test(trimmed)) return t('common:status.finished');

    // Messages with potential dynamic content
    if (/^Update Server: Target retrieved update action and should start now the download\.$/i.test(trimmed))
        return t('actions:statusMessages.targetRetrieved');

    if (trimmed.startsWith('Update Server: Target downloads')) {
        const pathPart = trimmed.replace('Update Server: Target downloads ', '');
        return t('actions:statusMessages.targetDownloads', { path: pathPart });
    }

    if (trimmed.startsWith('Assignment initiated by user')) {
        const userPart = trimmed.replace('Assignment initiated by user ', '').replace(/'/g, '');
        return t('actions:statusMessages.assignmentInitiated', { user: userPart });
    }

    return message;
};

/**
 * Action Status Utilities
 * Centralized logic for determining action display status
 */

export interface ActionLike {
    status?: string;
    detailStatus?: string;
    lastStatusCode?: number;
}

/**
 * Check if action is in canceled/canceling state
 */
export const isActionCanceled = (action: ActionLike): boolean => {
    const status = action.status?.toLowerCase() || '';
    return status === 'canceled' || status === 'cancelled' ||
        status === 'canceling' || status === 'cancelling';
};

/**
 * Check if action has error status
 */
export const isActionErrored = (action: ActionLike): boolean => {
    const status = action.status?.toLowerCase() || '';
    const detail = action.detailStatus?.toLowerCase() || '';

    // Don't treat canceled as error
    if (isActionCanceled(action)) return false;

    const hasErrorStatus = status === 'error' || status === 'failed';
    const hasErrorDetail = detail.includes('error') || detail.includes('failed');
    const hasErrorCode = typeof action.lastStatusCode === 'number' && action.lastStatusCode >= 400;

    return hasErrorStatus || hasErrorDetail || hasErrorCode;
};

/**
 * Check if action is in progress (cancellable)
 */
export const isActionInProgress = (status?: string): boolean => {
    const normalized = status?.toLowerCase() || '';
    return [
        'running',
        'pending',
        'scheduled',
        'retrieving',
        'downloading',
        'wait_for_confirmation',
        'waiting_for_confirmation',
    ].includes(normalized);
};

/**
 * Get display status for an action with proper priority:
 * canceled > canceling > error > actual status
 */
export const getActionDisplayStatus = (action: ActionLike): string => {
    const status = action.status?.toLowerCase() || '';

    // 1. Canceled states (highest priority)
    if (status === 'canceled' || status === 'cancelled') return 'canceled';
    if (status === 'canceling' || status === 'cancelling') return 'canceling';

    // 2. Error states
    if (isActionErrored(action)) return 'error';

    // 3. Return actual status
    return action.status || 'unknown';
};
