import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute — guards a route by:
 *  1. Ensuring the user is authenticated (has a token)
 *  2. Optionally ensuring the user has one of the required roles
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['WORKER']}>
 *     <WorkerLayout />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const { token, user } = useSelector((state) => state.auth);

    // 1. Not logged in — send to login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role check — if roles specified and user's role not in list, redirect to their correct dashboard
    if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
        const roleRedirectMap = {
            CUSTOMER: '/customer/dashboard',
            WORKER: '/worker/dashboard',
            UNION_ADMIN: '/union/dashboard',
            SUPER_ADMIN: '/admin/dashboard',
        };
        const correctPath = roleRedirectMap[user.role] || '/login';
        return <Navigate to={correctPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
