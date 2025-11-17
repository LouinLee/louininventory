// server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes"); // Import auth routes
const categoryRoutes = require("./routes/categoryRoutes"); // Import category routes
const productRoutes = require("./routes/productRoutes"); // Import product routes
const warehouseRoutes = require("./routes/warehouseRoutes"); // Import warehouse routes
const inboundRoutes = require("./routes/inboundRoutes");
const outboundRoutes = require("./routes/outboundRoutes"); // Import outbound routes
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reconciliationRoutes = require("./routes/reconciliationRoutes");

const path = require("path");

const cookieParser = require("cookie-parser"); // Add this

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(cookieParser()); // Use cookie-parser to parse cookies

// Routes
app.use("/api/auth", authRoutes);  // Authentication routes (Login, Register, etc.)
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
