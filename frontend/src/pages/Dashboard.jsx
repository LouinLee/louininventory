// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import currencyFormat from "../utils/formatCurrency";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    FaChartLine,
    FaRocket,
    FaExclamationTriangle,
    FaTired,
} from "react-icons/fa";
import {
    startOfDay,
    endOfDay,
    eachDayOfInterval,
    formatISO,
    startOfMonth,
    endOfMonth,
} from "date-fns";

// --- Sales Trend Chart (Recharts) ---
const SalesTrendChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor="rgba(13, 110, 253, 0.5)"
                            stopOpacity={1}
                        />
                        <stop
                            offset="100%"
                            stopColor="rgba(13, 110, 253, 0)"
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />

                <XAxis
                    dataKey="date"
                    tick={{ fill: "#6c757d", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={25} // prevents clutter by skipping labels
                />

                <YAxis
                    width={90} // 👈 adds space so labels don’t get cut
                    tick={{ fill: "#6c757d", fontSize: 12 }}
                    tickFormatter={(value) => {
                        if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
                        if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
                        if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
                        return value;
                    }}
                    tickLine={false}
                    axisLine={false}
                />

                <Tooltip
                    formatter={(value) => currencyFormat(value)}
                    labelStyle={{ color: "#495057" }}
                    contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "0.75rem",
                        border: "1px solid #dee2e6",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                />

                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="rgba(13, 110, 253, 1)"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                    dot={{ r: 3, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// --- Helper function to fill date gaps ---
const fillDateGaps = (data, startDate, endDate) => {
    if (!data || !startDate || !endDate) return [];
    if (data.length === 0) {
        const allDays = eachDayOfInterval({
            start: startOfDay(new Date(startDate)),
            end: endOfDay(new Date(endDate)),
        });
        return allDays.map((day) => ({
            date: formatISO(day, { representation: "date" }),
            value: 0,
        }));
    }

    const salesDataMap = new Map(data.map((item) => [item.date, item.value]));
    const interval = {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate)),
    };

    const allDays = eachDayOfInterval(interval);

    return allDays.map((day) => {
        const dateString = formatISO(day, { representation: "date" });
        return {
            date: dateString,
            value: salesDataMap.get(dateString) || 0,
        };
    });
};

// --- Main Dashboard Component ---
const Dashboard = () => {
    const [lowStock, setLowStock] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesTrend, setSalesTrend] = useState([]);
    const [slowMovers, setSlowMovers] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchData = async (currentStartDate, currentEndDate) => {
        const params = { startDate: currentStartDate, endDate: currentEndDate };
        try {
            const [lowStockRes, topProductsRes, salesTrendRes, slowMoversRes] =
                await Promise.all([
                    axios.get("/dashboard/low-stock"),
                    axios.get("/dashboard/top-products", { params }),
                    axios.get("/dashboard/sales-trend", { params }),
                    axios.get("/dashboard/slow-movers"),
                ]);

            setLowStock(lowStockRes.data);
            setTopProducts(topProductsRes.data);
            const filledTrendData = fillDateGaps(
                salesTrendRes.data,
                currentStartDate,
                currentEndDate
            );
            setSalesTrend(filledTrendData);
            setSlowMovers(slowMoversRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    };

    useEffect(() => {
        const today = new Date();
        const firstDayOfMonth = startOfMonth(today);
        const lastDayOfMonth = endOfMonth(today);

        const formattedStartDate = formatISO(firstDayOfMonth, {
            representation: "date",
        });
        const formattedEndDate = formatISO(lastDayOfMonth, {
            representation: "date",
        });

        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchData(startDate, endDate);
        }
    }, [startDate, endDate]);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
        }),
    };

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Dashboard</h4>
                <span className="text-muted">
                    {new Date().toLocaleDateString("en-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </span>
            </div>

            <div className="pt-4 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Sales Trend */}
                <motion.div
                    className="col-lg-12"
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                >
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold d-flex align-items-center text-primary">
                                <FaChartLine className="me-2" /> Sales Trend
                            </h5>
                            <p className="text-muted small">
                                Total sales revenue over the selected period.
                            </p>
                            <div style={{ position: "relative", height: "350px" }}>
                                {salesTrend.length > 0 ? (
                                    <SalesTrendChart data={salesTrend} />
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                                        No sales data for this period.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    className="col-lg-6"
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                >
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold d-flex align-items-center text-success">
                                <FaRocket className="me-2" /> Top 5 Selling Products
                            </h5>
                            <p className="text-muted small">
                                Based on units sold in the selected period.
                            </p>
                            <ul className="list-group list-group-flush mt-3">
                                {topProducts.length > 0 ? (
                                    topProducts.map((p, index) => (
                                        <li
                                            key={p.productId}
                                            className="list-group-item d-flex justify-content-between align-items-center px-0"
                                        >
                                            <div className="text-truncate me-3">
                                                <span className="fw-medium">
                                                    {index + 1}. {p.name}
                                                </span>
                                            </div>
                                            <span className="badge bg-success-subtle text-success-emphasis rounded-pill">
                                                {p.totalSold} sold
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item px-0 text-muted">
                                        No products sold in this period.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Low Stock + Slow Movers */}
                <motion.div
                    className="col-lg-6"
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                >
                    <div className="d-flex flex-column gap-4">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-danger d-flex align-items-center">
                                    <FaExclamationTriangle className="me-2" /> Low Stock Alert
                                </h5>
                                <p className="text-muted small">
                                    Products with 3 or fewer items in total.
                                </p>
                                <ul className="list-group list-group-flush mt-2">
                                    {lowStock.length > 0 ? (
                                        lowStock.map((p) => (
                                            <li
                                                key={p.productId}
                                                className="list-group-item d-flex justify-content-between align-items-center px-0"
                                            >
                                                <span className="fw-medium text-truncate me-3">
                                                    {p.name}
                                                </span>
                                                <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">
                                                    {p.totalQuantity} left
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="list-group-item px-0 text-muted">
                                            No low stock items.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-warning d-flex align-items-center">
                                    <FaTired className="me-2" /> Slow Movers
                                </h5>
                                <p className="text-muted small">
                                    In-stock items with no sales in the last 90 days.
                                </p>
                                <ul className="list-group list-group-flush mt-2">
                                    {slowMovers.length > 0 ? (
                                        slowMovers.map((p) => (
                                            <li key={p._id} className="list-group-item px-0">
                                                <span className="fw-medium">{p.name}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="list-group-item px-0 text-muted">
                                            No slow-moving items found.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
