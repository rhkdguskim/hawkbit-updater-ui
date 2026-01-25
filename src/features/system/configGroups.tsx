import React from 'react';
import {
    SyncOutlined,
    SafetyCertificateOutlined,
    RocketOutlined,
    DatabaseOutlined,
    CloudDownloadOutlined,
    LinkOutlined,
} from '@ant-design/icons';

export interface ConfigItem {
    key: string;
    type: 'boolean' | 'string' | 'number' | 'time' | 'array';
    descKey: string;
}

export interface ConfigGroup {
    titleKey: string;
    descKey: string;
    icon: React.ReactNode;
    themeKey: 'polling' | 'auth' | 'rollout' | 'repo' | 'download' | 'assignment' | 'other';
    items: ConfigItem[];
}

export const CONFIG_GROUPS: ConfigGroup[] = [
    {
        titleKey: 'groups.pollingConnection',
        descKey: 'groups.pollingConnectionDesc',
        icon: <SyncOutlined />,
        themeKey: 'polling',
        items: [
            { key: 'pollingTime', type: 'time', descKey: 'descriptions.pollingTime' },
            { key: 'pollingOverdueTime', type: 'time', descKey: 'descriptions.pollingOverdueTime' },
            { key: 'minPollingTime', type: 'time', descKey: 'descriptions.minPollingTime' },
            { key: 'maintenanceWindowPollCount', type: 'number', descKey: 'descriptions.maintenanceWindowPollCount' },
        ],
    },
    {
        titleKey: 'groups.authSecurity',
        descKey: 'groups.authSecurityDesc',
        icon: <SafetyCertificateOutlined />,
        themeKey: 'auth',
        items: [
            { key: 'authentication.targettoken.enabled', type: 'boolean', descKey: 'descriptions.authTargetToken' },
            { key: 'authentication.gatewaytoken.enabled', type: 'boolean', descKey: 'descriptions.authGatewayToken' },
            { key: 'authentication.gatewaytoken.key', type: 'string', descKey: 'descriptions.authGatewayTokenKey' },
            { key: 'authentication.header.enabled', type: 'boolean', descKey: 'descriptions.authHeader' },
            { key: 'authentication.header.authority', type: 'string', descKey: 'descriptions.authHeaderAuthority' },
        ],
    },
    {
        titleKey: 'groups.rolloutPolicy',
        descKey: 'groups.rolloutPolicyDesc',
        icon: <RocketOutlined />,
        themeKey: 'rollout',
        items: [
            { key: 'rollout.approval.enabled', type: 'boolean', descKey: 'descriptions.rolloutApproval' },
            { key: 'user.confirmation.flow.enabled', type: 'boolean', descKey: 'descriptions.userConfirmationFlow' },
        ],
    },
    {
        titleKey: 'groups.repoMaintenance',
        descKey: 'groups.repoMaintenanceDesc',
        icon: <DatabaseOutlined />,
        themeKey: 'repo',
        items: [
            { key: 'repository.actions.autoclose.enabled', type: 'boolean', descKey: 'descriptions.actionsAutoclose' },
            { key: 'action.cleanup.enabled', type: 'boolean', descKey: 'descriptions.actionCleanupEnabled' },
            { key: 'action.cleanup.actionExpiry', type: 'number', descKey: 'descriptions.actionCleanupExpiry' },
            { key: 'action.cleanup.actionStatus', type: 'array', descKey: 'descriptions.actionCleanupStatus' },
            { key: 'implicit.lock.enabled', type: 'boolean', descKey: 'descriptions.implicitLock' },
        ],
    },
    {
        titleKey: 'groups.downloadSettings',
        descKey: 'groups.downloadSettingsDesc',
        icon: <CloudDownloadOutlined />,
        themeKey: 'download',
        items: [
            { key: 'anonymous.download.enabled', type: 'boolean', descKey: 'descriptions.anonymousDownload' },
        ],
    },
    {
        titleKey: 'groups.assignmentSettings',
        descKey: 'groups.assignmentSettingsDesc',
        icon: <LinkOutlined />,
        themeKey: 'assignment',
        items: [
            { key: 'multi.assignments.enabled', type: 'boolean', descKey: 'descriptions.multiAssignments' },
            { key: 'batch.assignments.enabled', type: 'boolean', descKey: 'descriptions.batchAssignments' },
        ],
    },
];

export const ACTION_STATUS_OPTIONS = [
    { label: 'canceled', value: 'canceled' },
    { label: 'error', value: 'error' },
    { label: 'finished', value: 'finished' },
    { label: 'warning', value: 'warning' },
];

export const extractValue = (configValue: unknown): unknown => {
    if (configValue && typeof configValue === 'object' && 'value' in configValue) {
        return (configValue as { value?: unknown }).value;
    }
    return configValue;
};

export const isValidTimeFormat = (value: string): boolean => {
    const timeRegex = /^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/;
    return timeRegex.test(value);
};
