// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const inboundRoutes = require("./routes/inboundRoutes");
const outboundRoutes = require("./routes/outboundRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reconciliationRoutes = require("./routes/reconciliationRoutes");
const { exec } = require("child_process");

const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: true,  // allow same-origin dynamically
    credentials: true,
}));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inbound", inboundRoutes);
app.use("/api/outbound", outboundRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stock-movement", stockMovementRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reconciliation", reconciliationRoutes);

// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React Router (must be last)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// VBS already opens the browser
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     exec(`start http://localhost:${PORT}`);
// });
