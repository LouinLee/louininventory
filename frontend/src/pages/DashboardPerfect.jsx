import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/axios";
import currencyFormat from "../utils/formatCurrency";
import { motion } from "framer-motion";
import { Chart } from "chart.js/auto";
import 'chartjs-adapter-date-fns';
import { FaChartLine, FaRocket, FaExclamationTriangle, FaTired } from "react-icons/fa";
import { startOfDay, endOfDay, eachDayOfInterval, formatISO, startOfMonth, endOfMonth } from 'date-fns';

// --- Chart Components ---
const SalesTrendChart = ({ data, startDate, endDate }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !data) return;
        const ctx = chartRef.current.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.5)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0)');

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Total Sales',
                    data: data.map(d => d.value),
                    borderColor: 'rgba(13, 110, 253, 1)',
                    backgroundColor: gradient, // --- RE-ADDED ---
                    tension: 0.4,
                    fill: true, // --- REVERTED --- Changed back to true
                    pointBorderColor: '#fff',
                    pointRadius: (context) => context.raw > 0 ? 4 : 0,
                    pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                    pointHoverRadius: (context) => context.raw > 0 ? 7 : 0,
                    pointHoverBackgroundColor: 'rgba(13, 110, 253, 1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy' },
                        grid: { display: false },
                        min: startDate,
                        max: endDate,
                    },
                    y: {
                        grid: { color: '#e9ecef' },
                        ticks: {
                            beginAtZero: true,
                            callback: value => currencyFormat(value).replace(/\s/g, '')
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (context) => currencyFormat(context.raw) } }
                }
            }
        });
        return () => chart.destroy();
    }, [data, startDate, endDate]);

    return <canvas ref={chartRef}></canvas>;
};

// --- Helper function to fill date gaps ---
const fillDateGaps = (data, startDate, endDate) => {
    if (!data || !startDate || !endDate) return [];
    if (data.length === 0) {
        const allDays = eachDayOfInterval({
            start: startOfDay(new Date(startDate)),
            end: endOfDay(new Date(endDate))
        });
        return allDays.map(day => ({
            date: formatISO(day, { representation: 'date' }),
            value: 0
        }));
    }

    const salesDataMap = new Map(data.map(item => [item.date, item.value]));
    const interval = {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate))
    };

    const allDays = eachDayOfInterval(interval);

    return allDays.map(day => {
        const dateString = formatISO(day, { representation: 'date' });
        return {
            date: dateString,
            value: salesDataMap.get(dateString) || 0
        };
    });
};


// --- Main Dashboard Component ---
const Dashboard = () => {
    const [lowStock, setLowStock] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesTrend, setSalesTrend] = useState([]);
    const [slowMovers, setSlowMovers] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async (currentStartDate, currentEndDate) => {
        const params = { startDate: currentStartDate, endDate: currentEndDate };
        try {
            const [lowStockRes, topProductsRes, salesTrendRes, slowMoversRes] = await Promise.all([
                axios.get('/dashboard/low-stock'),
                axios.get('/dashboard/top-products', { params }),
                axios.get('/dashboard/sales-trend', { params }),
                axios.get('/dashboard/slow-movers')
            ]);

            setLowStock(lowStockRes.data);
            setTopProducts(topProductsRes.data);
            const filledTrendData = fillDateGaps(salesTrendRes.data, currentStartDate, currentEndDate);
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

        const formattedStartDate = formatISO(firstDayOfMonth, { representation: 'date' });
        const formattedEndDate = formatISO(lastDayOfMonth, { representation: 'date' });

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
            opacity: 1, y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
        })
    };

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Dashboard</h4>
                <span className="text-muted">{new Date().toLocaleDateString('en-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="pt-4 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-semibold">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <motion.div className="col-lg-12" custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold d-flex align-items-center text-primary"><FaChartLine className="me-2" /> Sales Trend</h5>
                            <p className="text-muted small">Total sales revenue over the selected period.</p>
                            <div style={{ position: 'relative', height: '350px' }}>
                                {salesTrend.length > 0 ? <SalesTrendChart data={salesTrend} startDate={startDate} endDate={endDate} /> : <div className="d-flex justify-content-center align-items-center h-100 text-muted">No sales data for this period.</div>}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="col-lg-6" custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold d-flex align-items-center text-success"><FaRocket className="me-2" /> Top 5 Selling Products</h5>
                            <p className="text-muted small">Based on units sold in the selected period.</p>
                            <ul className="list-group list-group-flush mt-3">
                                {topProducts.length > 0 ? topProducts.map((p, index) => (
                                    <li key={p.productId} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <div className="text-truncate me-3">
                                            <span className="fw-medium">{index + 1}. {p.name}</span>
                                        </div>
                                        <span className="badge bg-success-subtle text-success-emphasis rounded-pill">{p.totalSold} sold</span>
                                    </li>
                                )) : <li className="list-group-item px-0 text-muted">No products sold in this period.</li>}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <motion.div className="col-lg-6" custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                    <div className="d-flex flex-column gap-4">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-danger d-flex align-items-center"><FaExclamationTriangle className="me-2" /> Low Stock Alert</h5>
                                <p className="text-muted small">Products with 5 or fewer items in total.</p>
                                <ul className="list-group list-group-flush mt-2">
                                    {lowStock.length > 0 ? lowStock.map(p => (
                                        <li key={p.productId} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span className="fw-medium text-truncate me-3">{p.name}</span>
                                            <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">{p.totalQuantity} left</span>
                                        </li>
                                    )) : <li className="list-group-item px-0 text-muted">No low stock items.</li>}
                                </ul>
                            </div>
                        </div>
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold text-warning d-flex align-items-center"><FaTired className="me-2" /> Slow Movers</h5>
                                <p className="text-muted small">In-stock items with no sales in the last 90 days.</p>
                                <ul className="list-group list-group-flush mt-2">
                                    {slowMovers.length > 0 ? slowMovers.map(p => (
                                        <li key={p._id} className="list-group-item px-0">
                                            <span className="fw-medium">{p.name}</span>
                                        </li>
                                    )) : <li className="list-group-item px-0 text-muted">No slow-moving items found.</li>}
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

