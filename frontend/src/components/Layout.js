// src/components/Layout.js

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="d-flex flex-column flex-lg-row min-vh-100">
            <Sidebar />

            <div className="flex-grow-1">
                <Header />
                <main className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 60px)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
