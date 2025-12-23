import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
    setFocusMode: (value: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            isFocusMode: false,
            toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
            setFocusMode: (value) => set({ isFocusMode: value }),
        }),
        {
            name: 'dashboard-storage',
        }
    )
);
