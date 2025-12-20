import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const AuthGuard: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
