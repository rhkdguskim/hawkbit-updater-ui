import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/config';

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
            name: STORAGE_KEYS.DASHBOARD,
        }
    )
);
