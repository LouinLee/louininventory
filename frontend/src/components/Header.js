// src/components/Header.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        document.cookie = "token=; Max-Age=0";
        navigate("/login");
    };

    return (
        <header className="navbar navbar-light bg-white shadow-sm px-4 py-2 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">📦 Inventory Management System</h5>
            <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                <FaSignOutAlt />
                Logout
            </button>
        </header>
    );
};

export default Header;
