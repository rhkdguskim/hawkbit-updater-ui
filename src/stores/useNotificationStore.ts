import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    timestamp: number;
    read: boolean;
    link?: string;
}

interface NotificationState {
    notifications: Notification[];
    lastCheckTimestamp: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    removeNotification: (id: string) => void;
    updateLastCheck: (timestamp: number) => void;
    unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            lastCheckTimestamp: Date.now(),
            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    read: false,
                };
                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                }));
            },
            markAsRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                })),
            markAllAsRead: () =>
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                })),
            clearAll: () => set({ notifications: [] }),
            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                })),
            updateLastCheck: (timestamp) => set({ lastCheckTimestamp: timestamp }),
            unreadCount: () => get().notifications.filter(n => !n.read).length
        }),
        {
            name: 'notification-storage',
        }
    )
);
