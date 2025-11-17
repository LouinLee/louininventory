// src/components/PrivateRoute.js

import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthService from "../services/AuthService";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await AuthService.getMe();
                setUser(data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    console.log("Fetched user:", user);
    console.log("Allowed roles:", allowedRoles);
    
    if (loading) return <div>Loading...</div>;

    // Not logged in
    if (!user) return <Navigate to="/login" replace />;

    // Role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />; // redirect if role not allowed
    }

    return children;
};

export default PrivateRoute;

// Old PrivateRoute code, before using AuthService and httpOnly is still false to useCookies

// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useCookies } from "react-cookie";

// const PrivateRoute = ({ children }) => {
//     const [cookies] = useCookies(["token"]);

//     // Optional: log to see what's inside
//     console.log("Token from cookie:", cookies.token);

//     return cookies.token ? children : <Navigate to="/login" replace />;
// };

// export default PrivateRoute;
