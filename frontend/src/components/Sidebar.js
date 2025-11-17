// src/components/Sidebar.js

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Products', path: '/products' },
        { name: 'Categories', path: '/categories' },
        { name: 'Warehouses', path: '/warehouses' },
        { name: 'Inbound', path: '/inbound' },
        { name: 'Outbound', path: '/outbound' },
    ];

    return (
        <div className={`bg-dark text-white shadow ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ width: collapsed ? '70px' : '220px', transition: '0.3s ease', minHeight: '100vh', position: 'relative' }}>
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
                <span className="fw-bold" style={{ fontSize: '1rem', display: collapsed ? 'none' : 'inline' }}>Inventory</span>
                <button className="btn btn-sm btn-outline-light ms-auto" onClick={toggleSidebar}>
                    <FaBars />
                </button>
            </div>

            <ul className="nav flex-column pt-3">
                {menuItems.map((item) => (
                    <li key={item.path} className="nav-item">
                        <Link
                            className={`nav-link text-white ${location.pathname === item.path ? 'bg-secondary' : ''}`}
                            to={item.path}
                        >
                            {!collapsed && item.name}
                            {collapsed && <span className="d-inline-block" title={item.name}>{item.name[0]}</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
