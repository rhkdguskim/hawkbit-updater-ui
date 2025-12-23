import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Role = 'Admin' | 'Operator';

interface AuthState {
    user: string | null;
    role: Role | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: string, token: string) => void;
    logout: () => void;
}

// Role Mapping Policy
// Based on HawkBit server accounts:
// - 'admin' user has full permissions → Admin role
// - other users (e.g., 'readonly') → Operator role
const getRole = (username: string): Role => {
    if (username === 'admin') return 'Admin';
    return 'Operator';
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            role: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) =>
                set({
                    user,
                    token,
                    role: getRole(user),
                    isAuthenticated: true,
                }),
            logout: () =>
                set({
                    user: null,
                    role: null,
                    token: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'updater-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
