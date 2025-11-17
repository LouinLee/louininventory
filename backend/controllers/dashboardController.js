// controllers/dashboardController.js
const Inventory = require("../models/Inventory");
const Outbound = require("../models/Outbound");
const Product = require("../models/Product");

// Helper to convert Jakarta date string to UTC
const toUTC = (dateString, endOfDay = false) => {
    const JAKARTA_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in ms
    const time = endOfDay ? "T23:59:59.999" : "T00:00:00";
    return new Date(new Date(`${dateString}${time}`).getTime() - JAKARTA_OFFSET);
};

// Helper to convert UTC date to Jakarta local YYYY-MM-DD
const toJakartaDate = (utcDate) => {
    const JAKARTA_OFFSET = 7 * 60 * 60 * 1000;
    const dt = new Date(utcDate.getTime() + JAKARTA_OFFSET);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// --- SALES TREND ---
exports.getSalesTrend = async (req, res) => {
    try {
        const { startDate, endDate, metric = "sales" } = req.query;
        const start = startDate ? toUTC(startDate) : null;
        const end = endDate ? toUTC(endDate, true) : null;

        const match = { reversed: false };
        if (start || end) {
            match.date = {};
            if (start) match.date.$gte = start;
            if (end) match.date.$lte = end;
        }

        const records = await Outbound.find(match).lean();

        const trendMap = {};
        records.forEach((rec) => {
            const localDate = toJakartaDate(rec.date);
            rec.products.forEach((prod) => {
                trendMap[localDate] = trendMap[localDate] || 0;
                trendMap[localDate] +=
                    metric === "profit"
                        ? prod.quantity * (prod.sellingPrice - prod.buyingPrice)
                        : prod.quantity * prod.sellingPrice;
            });
        });

        const trend = Object.keys(trendMap)
            .sort()
            .map((date) => ({ date, value: trendMap[date] }));

        res.json(trend);
    } catch (err) {
        console.error("Error fetching sales trend:", err);
        res.status(500).json({ error: "Failed to fetch sales trend" });
    }
};

// --- LOW STOCK ---
exports.getLowStock = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 3;
        const lowStockProducts = await Inventory.aggregate([
            {
                $group: {
                    _id: "$product",
                    totalQuantity: { $sum: "$quantity" },
                    locations: { $push: { warehouse: "$warehouse", quantity: "$quantity" } },
                },
            },
            { $match: { totalQuantity: { $lte: threshold } } },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productInfo" } },
            { $unwind: "$productInfo" },
            { $lookup: { from: "warehouses", localField: "locations.warehouse", foreignField: "_id", as: "warehouseInfo" } },
            {
                $project: {
                    _id: 0,
                    productId: "$productInfo._id",
                    name: "$productInfo.name",
                    totalQuantity: 1,
                    locations: {
                        $map: {
                            input: "$locations",
                            as: "loc",
                            in: {
                                quantity: "$$loc.quantity",
                                warehouseName: {
                                    $arrayElemAt: ["$warehouseInfo.name", { $indexOfArray: ["$warehouseInfo._id", "$$loc.warehouse"] }],
                                },
                            },
                        },
                    },
                },
            },
            { $sort: { totalQuantity: 1 } },
        ]);

        res.json(lowStockProducts);
    } catch (err) {
        console.error("Error fetching low stock:", err);
        res.status(500).json({ error: "Failed to fetch low stock products" });
    }
};

// --- TOP PRODUCTS ---
exports.getTopProductsBySales = async (req, res) => {
    try {
        const { startDate, endDate, limit = 3, sortBy = "quantity" } = req.query;
        const start = startDate ? toUTC(startDate) : null;
        const end = endDate ? toUTC(endDate, true) : null;

        const match = { reversed: false };
        if (start || end) {
            match.date = {};
            if (start) match.date.$gte = start;
            if (end) match.date.$lte = end;
        }

        const groupStage = {
            _id: "$products.product",
            totalSold: { $sum: "$products.quantity" },
            totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.sellingPrice"] } },
        };

        const sortStage = { $sort: sortBy === "revenue" ? { totalRevenue: -1 } : { totalSold: -1 } };

        const topProducts = await Outbound.aggregate([
            { $match: match },
            { $unwind: "$products" },
            { $group: groupStage },
            sortStage,
            { $limit: parseInt(limit) },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $project: { _id: 0, productId: "$product._id", name: "$product.name", totalSold: 1, totalRevenue: 1 } },
        ]);

        res.json(topProducts);
    } catch (err) {
        console.error("Error fetching top products:", err);
        res.status(500).json({ error: "Failed to fetch top products by sales" });
    }
};

// --- SLOW MOVERS ---
exports.getSlowMovers = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const cutOffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000); // subtract days in ms

        const soldRecently = await Outbound.aggregate([
            { $match: { reversed: false, date: { $gte: cutOffDate } } },
            { $unwind: "$products" },
            { $group: { _id: "$products.product" } },
        ]);
        const soldIds = soldRecently.map(p => p._id);

        const inStock = await Inventory.aggregate([
            { $group: { _id: "$product", totalQuantity: { $sum: "$quantity" } } },
            { $match: { totalQuantity: { $gt: 0 } } },
        ]);
        const inStockIds = inStock.map(p => p._id);

        const slowMovers = await Product.find({
            createdAt: { $lte: cutOffDate },
            _id: { $in: inStockIds, $nin: soldIds },
            deleted: false,
        }).select("name price category");

        res.json(slowMovers);
    } catch (err) {
        console.error("Error fetching slow movers:", err);
        res.status(500).json({ error: "Failed to fetch slow movers" });
    }
};
