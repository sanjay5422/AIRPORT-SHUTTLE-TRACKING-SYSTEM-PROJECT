import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    if (loading) {
        return <div className="text-white text-center mt-20">Loading...</div>; // Or a proper spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" />;
    }

    if (user && user.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;
