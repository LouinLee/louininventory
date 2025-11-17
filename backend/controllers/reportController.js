// controllers/reportController.js

const Outbound = require('../models/Outbound');
const Inbound = require("../models/Inbound");
const StockReconciliation = require("../models/StockReconciliation");

// exports.getOutboundReport = async (req, res) => {
//     try {
//         const { startDate, endDate, warehouseId } = req.query;

//         const filter = { reversed: false };

//         // Date filtering
//         if (startDate && endDate) {
//             const start = new Date(startDate);
//             const end = new Date(endDate);
//             end.setHours(23, 59, 59, 999);
//             filter.date = { $gte: start, $lte: end };
//         } else if (startDate) {
//             const start = new Date(startDate);
//             filter.date = { $gte: start };
//         } else if (endDate) {
//             const end = new Date(endDate);
//             end.setHours(23, 59, 59, 999);
//             filter.date = { $lte: end };
//         }

//         // Only filter warehouse if warehouseId is not empty
//         if (warehouseId && warehouseId.trim() !== "") {
//             filter.warehouse = warehouseId;
//         }

//         const outboundData = await Outbound.find(filter)
//             .populate('warehouse')
//             .populate('products.product');

//         let globalTotals = {
//             totalBuying: 0,
//             totalSelling: 0,
//             profit: 0
//         };

//         // If all warehouses, return single flat dataset
//         let items = [];
//         outboundData.forEach(ob => {
//             ob.products.forEach(p => {
//                 const buySubtotal = p.buyingPrice * p.quantity;
//                 const sellSubtotal = p.sellingPrice * p.quantity;

//                 items.push({
//                     outboundId: ob._id,
//                     date: ob.date,
//                     warehouseName: ob.warehouse?.name || "Unknown Warehouse",
//                     product: p.product?.name || "Unknown Product",
//                     quantity: p.quantity,
//                     buyingPrice: p.buyingPrice,
//                     buyingSubtotal: buySubtotal,
//                     sellingPrice: p.sellingPrice,
//                     sellingSubtotal: sellSubtotal
//                 });

//                 globalTotals.totalBuying += buySubtotal;
//                 globalTotals.totalSelling += sellSubtotal;
//                 globalTotals.profit += (sellSubtotal - buySubtotal);
//             });
//         });

//         res.json({
//             items,
//             globalTotals
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error while fetching outbound report' });
//     }
// };

exports.getOutboundReport = async (req, res) => {
    try {
        const { startDate, endDate, warehouseId } = req.query;

        const filter = { reversed: false };

        // Date filtering
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        } else if (startDate) {
            const start = new Date(startDate);
            filter.date = { $gte: start };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $lte: end };
        }

        if (warehouseId && warehouseId.trim() !== "") {
            filter.warehouse = warehouseId;
        }

        const outboundData = await Outbound.find(filter)
            .populate("warehouse")
            .populate("products.product");

        let globalTotals = {
            totalBuying: 0,
            totalSelling: 0,
            profit: 0,
        };

        let items = [];
        outboundData.forEach((ob) => {
            ob.products.forEach((p) => {
                const buySubtotal = (p.buyingPrice || 0) * (p.quantity || 0);
                const sellSubtotal = p.subtotal || 0; // ✅ already discounted

                items.push({
                    outboundId: ob._id,
                    date: ob.date,
                    warehouseName: ob.warehouse?.name || "Unknown Warehouse",
                    product: p.product?.name || "Unknown Product",
                    quantity: p.quantity,
                    buyingPrice: p.buyingPrice,
                    buyingSubtotal: buySubtotal,
                    sellingPrice: p.sellingPrice,
                    discountType: p.discountType || null,
                    discountValue: p.discountValue || 0,
                    sellingSubtotal: sellSubtotal,
                });

                globalTotals.totalBuying += buySubtotal;
                globalTotals.totalSelling += sellSubtotal;
                globalTotals.profit += sellSubtotal - buySubtotal;
            });
        });

        res.json({
            items,
            globalTotals,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while fetching outbound report" });
    }
};

exports.getInboundReport = async (req, res) => {
    try {
        const { startDate, endDate, warehouseId } = req.query;

        const filter = { reversed: false };

        // Date filtering
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        } else if (startDate) {
            const start = new Date(startDate);
            filter.date = { $gte: start };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $lte: end };
        }

        // Only filter warehouse if warehouseId is not empty
        if (warehouseId && warehouseId.trim() !== "") {
            filter.warehouse = warehouseId;
        }

        const inboundData = await Inbound.find(filter)
            .populate('warehouse')
            .populate('products.product');

        let globalTotals = {
            totalBuying: 0,
        };

        let items = [];
        inboundData.forEach(ib => {
            ib.products.forEach(p => {
                const buySubtotal = p.buyingPrice * p.quantity;

                items.push({
                    inboundId: ib._id,
                    date: ib.date,
                    warehouseName: ib.warehouse?.name || "Unknown Warehouse",
                    product: p.product?.name || "Unknown Product",
                    quantity: p.quantity,
                    buyingPrice: p.buyingPrice,
                    buyingSubtotal: buySubtotal,
                });

                globalTotals.totalBuying += buySubtotal;
            });
        });

        res.json({
            items,
            globalTotals
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching inbound report' });
    }
};

exports.getReconciliationReport = async (req, res) => {
    try {
        const { startDate, endDate, warehouseId } = req.query;

        const filter = { reversed: false };

        // Date filtering
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        } else if (startDate) {
            const start = new Date(startDate);
            filter.date = { $gte: start };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.date = { $lte: end };
        }

        // Warehouse filter
        if (warehouseId && warehouseId.trim() !== "") {
            filter.warehouse = warehouseId;
        }

        const reconciliations = await StockReconciliation.find(filter)
            .populate("warehouse")
            .populate("products.product");

        let globalTotals = {
            totalLoss: 0
        };

        const items = [];
        reconciliations.forEach((rec) => {
            rec.products.forEach((p) => {
                items.push({
                    reconciliationId: rec._id,
                    date: rec.date,
                    warehouseName: rec.warehouse?.name || "Unknown Warehouse",
                    product: p.product?.name || "Unknown Product",
                    quantity: p.quantity,
                    buyingPrice: p.buyingPrice,
                    subtotal: p.subtotal
                });

                globalTotals.totalLoss += p.subtotal;
            });
        });

        res.json({
            items,
            globalTotals
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while fetching reconciliation report" });
    }
};
