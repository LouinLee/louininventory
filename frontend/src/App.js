// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Warehouses from "./pages/Warehouses";
import Inbound from "./pages/Inbound";
import Outbound from "./pages/Outbound";
import StockMovement from "./pages/StockMovement";
import PrivateRoute from "./components/PrivateRoute";
import NewLayout from "./components/NewLayout";
import ReportOutbound from "./pages/ReportOutbound";
import ReportInbound from "./pages/ReportInbound";
import Users from "./pages/Users";
import Reconciliation from "./pages/Reconciliation";
import ReportReconciliation from "./pages/ReportReconciliation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <Router>
            {/* Add ToastContainer to render toast notifications */}
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Routes>
                {/* Redirect root path to /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public Routes */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Route with Layout */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    {/* This is where the child route for Dashboard should be rendered */}
                    <Route index element={<Dashboard />} /> {/* Ensure index route */}
                </Route>

                <Route
                    path="/users"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Users />} />
                </Route>

                {/* Product List Route inside Layout */}
                <Route
                    path="/products"
                    element={
                        <PrivateRoute>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Products />} />
                </Route>

                <Route
                    path="/categories"
                    element={
                        <PrivateRoute>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Categories />} />
                </Route>

                <Route
                    path="/warehouses"
                    element={
                        <PrivateRoute>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Warehouses />} />
                </Route>

                <Route
                    path="/inbound"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'purchasing']}>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Inbound />} />
                </Route>

                <Route
                    path="/outbound"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'sales']}>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Outbound />} />
                </Route>

                <Route
                    path="/stock-movement"
                    element={
                        <PrivateRoute>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<StockMovement />} />
                </Route>

                <Route
                    path="/reconciliation"
                    element={
                        <PrivateRoute>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<Reconciliation />} />
                </Route>

                <Route
                    path="/reports/outbound"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<ReportOutbound />} />
                </Route>

                <Route
                    path="/reports/inbound"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<ReportInbound />} />
                </Route>

                <Route
                    path="/reports/reconciliation"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <NewLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<ReportReconciliation />} />
                </Route>


            </Routes>
        </Router>
    );
}

export default App;
