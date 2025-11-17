// controllers/dashboardController.js

const Inventory = require("../models/Inventory");
const Outbound = require("../models/Outbound");
const Product = require("../models/Product");

exports.getSalesTrend = async (req, res) => {
    try {
        const { startDate, endDate, metric = "sales" } = req.query;

        console.log("Frontend filter dates:", { startDate, endDate });

        const JAKARTA_OFFSET = 7; // Jakarta is UTC+7

        // 1️⃣ Convert frontend local dates to UTC for DB query
        const start = startDate
            ? new Date(new Date(`${startDate}T00:00:00`).getTime() - JAKARTA_OFFSET * 60 * 60 * 1000)
            : null;
        const end = endDate
            ? new Date(new Date(`${endDate}T23:59:59.999`).getTime() - JAKARTA_OFFSET * 60 * 60 * 1000)
            : null;

        console.log("Converted UTC filter dates for DB:", { start, end });

        // 2️⃣ Fetch outbound records in UTC
        const match = { reversed: false };
        if (start || end) {
            match.date = {};
            if (start) match.date.$gte = start;
            if (end) match.date.$lte = end;
        }

        const records = await Outbound.find(match).lean();
        console.log(`Fetched ${records.length} outbound records from DB`);

        // 3️⃣ Aggregate totals per Jakarta local date
        const trendMap = {};

        records.forEach((rec) => {
            // Add Jakarta offset manually
            const jakartaTime = new Date(rec.date.getTime() + JAKARTA_OFFSET * 60 * 60 * 1000);

            // Extract YYYY-MM-DD using local getters
            const year = jakartaTime.getFullYear();
            const month = String(jakartaTime.getMonth() + 1).padStart(2, "0");
            const day = String(jakartaTime.getDate()).padStart(2, "0");
            const localDate = `${year}-${month}-${day}`;

            console.log("Record UTC date:", rec.date, "→ Jakarta local date:", localDate);

            rec.products.forEach((prod) => {
                if (!trendMap[localDate]) trendMap[localDate] = 0;

                trendMap[localDate] +=
                    metric === "profit"
                        ? prod.quantity * (prod.sellingPrice - prod.buyingPrice)
                        : prod.quantity * prod.sellingPrice;
            });
        });

        console.log("Aggregated trendMap:", trendMap);

        // 4️⃣ Convert map to sorted array
        const trend = Object.keys(trendMap)
            .sort()
            .map((date) => ({ date, value: trendMap[date] }));

        console.log("Final trend array:", trend);

        // 5️⃣ Send ready-to-display result
        res.json(trend);
    } catch (err) {
        console.error("Error fetching sales trend:", err);
        res.status(500).json({ error: "Failed to fetch sales trend" });
    }
};


// --- LOW STOCK ---
exports.getLowStock = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 5;

        const lowStockProducts = await Inventory.aggregate([
            {
                $group: {
                    _id: "$product",
                    totalQuantity: { $sum: "$quantity" },
                    locations: { $push: { warehouse: "$warehouse", quantity: "$quantity" } }
                }
            },
            { $match: { totalQuantity: { $lte: threshold } } },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $lookup: {
                    from: "warehouses",
                    localField: "locations.warehouse",
                    foreignField: "_id",
                    as: "warehouseInfo"
                }
            },
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
                                    $arrayElemAt: [
                                        "$warehouseInfo.name",
                                        { $indexOfArray: ["$warehouseInfo._id", "$$loc.warehouse"] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { totalQuantity: 1 } }
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
        const { startDate, endDate, limit = 3, sortBy = "quantity", timezone = "Asia/Jakarta" } = req.query;

        const match = { reversed: false };
        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
            if (endDate) match.date.$lte = new Date(`${endDate}T23:59:59.999Z`);
        }

        const groupStage = {
            _id: "$products.product",
            totalSold: { $sum: "$products.quantity" },
            totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.sellingPrice"] } }
        };

        const sortStage = {
            $sort: sortBy === "revenue" ? { totalRevenue: -1 } : { totalSold: -1 }
        };

        const topProducts = await Outbound.aggregate([
            { $match: match },
            { $unwind: "$products" },
            { $group: groupStage },
            sortStage,
            { $limit: parseInt(limit) },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 0,
                    productId: "$product._id",
                    name: "$product.name",
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
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
        const cutOffDate = new Date();
        cutOffDate.setUTCDate(cutOffDate.getUTCDate() - days);

        const soldRecently = await Outbound.aggregate([
            { $match: { reversed: false, date: { $gte: cutOffDate } } },
            { $unwind: "$products" },
            { $group: { _id: "$products.product" } }
        ]);
        const soldIds = soldRecently.map(p => p._id);

        const inStock = await Inventory.aggregate([
            { $group: { _id: "$product", totalQuantity: { $sum: "$quantity" } } },
            { $match: { totalQuantity: { $gt: 0 } } }
        ]);
        const inStockIds = inStock.map(p => p._id);

        const slowMovers = await Product.find({
            createdAt: { $lte: cutOffDate },
            _id: { $in: inStockIds, $nin: soldIds },
            deleted: false
        }).select("name price category");

        res.json(slowMovers);
    } catch (err) {
        console.error("Error fetching slow movers:", err);
        res.status(500).json({ error: "Failed to fetch slow movers" });
    }
};

// --- SALES TREND ---
// exports.getSalesTrend = async (req, res) => {
//     try {
//         const { startDate, endDate, groupBy = "day", metric = "sales", timezone = "Asia/Jakarta" } = req.query;

//         const match = { reversed: false };
//         if (startDate || endDate) {
//             match.date = {};
//             if (startDate) match.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
//             if (endDate) match.date.$lte = new Date(`${endDate}T23:59:59.999Z`);
//         }

//         const dateFormat =
//             groupBy === "month" ? "%Y-%m" :
//             groupBy === "week" ? "%Y-%U" :
//             "%Y-%m-%d";

//         const profitCalculation = {
//             $sum: {
//                 $map: {
//                     input: "$products",
//                     as: "p",
//                     in: {
//                         $multiply: [
//                             "$$p.quantity",
//                             { $subtract: ["$$p.sellingPrice", "$$p.buyingPrice"] }
//                         ]
//                     }
//                 }
//             }
//         };

//         const trend = await Outbound.aggregate([
//             { $match: match },
//             {
//                 $group: {
//                     _id: {
//                         $dateToString: { format: dateFormat, date: "$date", timezone }
//                     },
//                     totalSales: { $sum: "$total" },
//                     totalProfit: { $sum: profitCalculation }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     date: "$_id", // already localized string
//                     value: metric === "profit" ? "$totalProfit" : "$totalSales"
//                 }
//             },
//             { $sort: { date: 1 } }
//         ]);

//         res.json(trend);
//     } catch (err) {
//         console.error("Error fetching sales trend:", err);
//         res.status(500).json({ error: "Failed to fetch sales trend" });
//     }
// };
