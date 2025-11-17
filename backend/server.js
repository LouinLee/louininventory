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

const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
connectDB();

// =====================
// Middleware
// =====================
app.use(express.json());
app.use(cookieParser());

// Configure CORS for cross-origin cookies
const corsOptions = {
    origin: "https://anekaperabot-890420967859.asia-southeast2.run.app",
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // allowed headers
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests globally
app.options("*", cors(corsOptions));

// =====================
// Routes
// =====================
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

// =====================
// Start server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
