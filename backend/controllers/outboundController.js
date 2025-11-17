// controllers/outboundController.js

const Outbound = require("../models/Outbound");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const Inventory = require("../models/Inventory");

//createOutbound with discount logic but no 0 handling
// exports.createOutbound = async (req, res) => {
//     try {
//         const { warehouseId, products } = req.body;

//         // Validate warehouse
//         const warehouse = await Warehouse.findById(warehouseId);
//         if (!warehouse) {
//             return res.status(404).json({ message: "Warehouse not found" });
//         }

//         // Validate all product availability
//         for (let { product, quantity } of products) {
//             const foundProduct = await Product.findById(product);
//             if (!foundProduct) {
//                 return res.status(404).json({ message: `Product ${product} not found` });
//             }

//             const inventories = await Inventory.find({ product, warehouse: warehouseId });
//             const totalAvailable = inventories.reduce((sum, inv) => sum + inv.quantity, 0);

//             if (totalAvailable < quantity) {
//                 return res.status(400).json({ message: `Not enough stock for ${foundProduct.name}` });
//             }
//         }

//         const outboundProductEntries = [];
//         let totalAmount = 0;

//         // FIFO stock deduction
//         for (let { product, quantity, discountType, discountValue } of products) {
//             let remainingQty = quantity;

//             const productDoc = await Product.findById(product);
//             const inventoryBatches = await Inventory.find({
//                 product,
//                 warehouse: warehouseId,
//                 quantity: { $gt: 0 }
//             }).sort({ date: 1 });

//             // 🔹 Track total line subtotal across all batches for this product
//             let lineSubtotal = 0;
//             const lineEntries = [];

//             for (let batch of inventoryBatches) {
//                 if (remainingQty <= 0) break;

//                 const usedQty = Math.min(batch.quantity, remainingQty);

//                 const sellingPrice = productDoc.price;
//                 const buyingPrice = batch.buyingPrice;

//                 const batchSubtotal = sellingPrice * usedQty;
//                 lineSubtotal += batchSubtotal;

//                 lineEntries.push({
//                     product,
//                     quantity: usedQty,
//                     inventoryId: batch._id,
//                     sellingPrice,
//                     buyingPrice,
//                     subtotal: batchSubtotal
//                 });

//                 batch.quantity -= usedQty;
//                 remainingQty -= usedQty;

//                 await batch.save();
//             }

//             // 🔹 Apply discount ONCE per product line
//             let discountAmount = 0;
//             if (discountType === "percent") {
//                 discountAmount = lineSubtotal * (discountValue / 100);
//             } else if (discountType === "amount") {
//                 discountAmount = discountValue || 0;
//             }
//             if (discountAmount > lineSubtotal) discountAmount = lineSubtotal;

//             const discountedTotal = lineSubtotal - discountAmount;
//             totalAmount += discountedTotal;

//             // 🔹 Adjust the last batch entry to reflect discount (so totals match)
//             if (lineEntries.length > 0) {
//                 const lastEntry = lineEntries[lineEntries.length - 1];
//                 lastEntry.subtotal -= discountAmount;
//                 lastEntry.discountType = discountType || null;
//                 lastEntry.discountValue = discountValue || 0;
//             }

//             outboundProductEntries.push(...lineEntries);
//         }

//         // Save outbound record
//         const outbound = new Outbound({
//             warehouse: warehouseId,
//             products: outboundProductEntries,
//             total: totalAmount
//         });

//         await outbound.save();

//         res.status(201).json({ message: "Outbound (POS) created", outbound });

//     } catch (error) {
//         console.error("Error creating outbound:", error);
//         res.status(500).json({ message: "Error creating outbound record", error: error.message });
//     }
// };

exports.createOutbound = async (req, res) => {
    try {
        const { warehouseId, products, date } = req.body;

        // ✅ Validate warehouse
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        // ✅ Validate all product availability
        for (let { product, quantity } of products) {
            const foundProduct = await Product.findById(product);
            if (!foundProduct) {
                return res.status(404).json({ message: `Product ${product} not found` });
            }

            const inventories = await Inventory.find({ product, warehouse: warehouseId });
            const totalAvailable = inventories.reduce((sum, inv) => sum + inv.quantity, 0);

            if (totalAvailable < quantity) {
                return res.status(400).json({ message: `Not enough stock for ${foundProduct.name}` });
            }
        }

        const outboundProductEntries = [];
        let totalAmount = 0;

        // ✅ FIFO stock deduction
        for (let { product, quantity, discountType, discountValue } of products) {
            let remainingQty = quantity;

            const productDoc = await Product.findById(product);
            const inventoryBatches = await Inventory.find({
                product,
                warehouse: warehouseId,
                quantity: { $gt: 0 }
            }).sort({ date: 1 });

            let lineSubtotal = 0;
            const lineEntries = [];

            for (let batch of inventoryBatches) {
                if (remainingQty <= 0) break;

                const usedQty = Math.min(batch.quantity, remainingQty);
                const sellingPrice = productDoc.price;
                const buyingPrice = batch.buyingPrice;

                const batchSubtotal = sellingPrice * usedQty;
                lineSubtotal += batchSubtotal;

                lineEntries.push({
                    product,
                    quantity: usedQty,
                    inventoryId: batch._id,
                    sellingPrice,
                    buyingPrice,
                    subtotal: batchSubtotal
                });

                batch.quantity -= usedQty;
                remainingQty -= usedQty;
                await batch.save();
            }

            // ✅ Validate discount BEFORE applying
            if (discountType === "percent") {
                if (discountValue > 99) {
                    return res.status(400).json({
                        message: `Discount percent cannot exceed 99% for product ${productDoc.name}`
                    });
                }
            } else if (discountType === "amount") {
                if (discountValue >= lineSubtotal) {
                    return res.status(400).json({
                        message: `Discount amount cannot be equal to or greater than subtotal (${lineSubtotal}) for product ${productDoc.name}`
                    });
                }
            }

            // ✅ Calculate discount safely
            let discountAmount = 0;
            if (discountType === "percent") {
                discountAmount = lineSubtotal * (discountValue / 100);
            } else if (discountType === "amount") {
                discountAmount = discountValue || 0;
            }

            const discountedTotal = lineSubtotal - discountAmount;
            totalAmount += discountedTotal;

            // ✅ Attach discount info to last batch entry
            if (lineEntries.length > 0) {
                const lastEntry = lineEntries[lineEntries.length - 1];
                lastEntry.subtotal -= discountAmount;
                lastEntry.discountType = discountType || null;
                lastEntry.discountValue = discountValue || 0;
            }

            outboundProductEntries.push(...lineEntries);
        }

        // ✅ Save outbound record
        const outbound = new Outbound({
            warehouse: warehouseId,
            products: outboundProductEntries,
            total: totalAmount,
            date: date ? new Date(date) : new Date()  // ✅ use provided date or fallback
        });

        await outbound.save();

        res.status(201).json({ message: "Outbound (POS) created", outbound });

    } catch (error) {
        console.error("Error creating outbound:", error);
        res.status(500).json({ message: "Error creating outbound record", error: error.message });
    }
};

// Get all outbound records
exports.getAllOutbound = async (req, res) => {
    try {
        const outbounds = await Outbound.find()
            .populate("products.product", "name quantity")
            .populate("warehouse", "name")
            .exec();
        res.status(200).json(outbounds);
    } catch (error) {
        res.status(500).json({ message: "Error fetching outbounds", error });
    }
};

exports.getProductsByWarehouse = async (req, res) => {
    const { warehouseId } = req.params;

    try {
        const inventory = await Inventory.find({ warehouse: warehouseId })
            .populate("product", "name price");

        if (!inventory || inventory.length === 0) {
            return res.status(404).json({ message: "No products found in this warehouse" });
        }

        // Aggregate by product ID
        const aggregated = {};

        inventory.forEach((item) => {
            const id = item.product._id.toString();

            if (!aggregated[id]) {
                aggregated[id] = {
                    productId: id,
                    name: item.product.name,
                    price: item.product.price, // ✅ Include price
                    quantity: item.quantity,
                };
            } else {
                aggregated[id].quantity += item.quantity;
            }
        });

        const result = Object.values(aggregated).filter(p => p.quantity > 0); // ✅ Filter out zero stock

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching products for warehouse:", error);
        res.status(500).json({ message: "Error fetching products for warehouse", error });
    }
};

exports.reverseOutbound = async (req, res) => {
    try {
        const { id } = req.params;

        const outbound = await Outbound.findById(id).populate("products.inventoryId");

        if (!outbound) {
            return res.status(404).json({ message: "Outbound record not found." });
        }

        if (outbound.reversed) {
            return res.status(400).json({ message: "This outbound has already been reversed." });
        }

        // Restore each product back to the original inventory entry
        for (const item of outbound.products) {
            const { product, quantity, inventoryId } = item;

            const original = await Inventory.findById(inventoryId);
            if (!original) {
                return res.status(400).json({ message: `Original inventory not found for product ${product}` });
            }

            // Restore quantity back into the original batch
            original.quantity += quantity;
            await original.save();
        }

        // Mark outbound as reversed
        outbound.reversed = true;
        await outbound.save();

        res.status(200).json({ message: "Outbound successfully reversed." });

    } catch (error) {
        console.error("Error reversing outbound:", error);
        res.status(500).json({ message: "Failed to reverse outbound", error: error.message });
    }
};

//Old createOutbound without discount logic
// exports.createOutbound = async (req, res) => {
//     try {
//         const { warehouseId, products } = req.body;

//         // Validate warehouse
//         const warehouse = await Warehouse.findById(warehouseId);
//         if (!warehouse) {
//             return res.status(404).json({ message: "Warehouse not found" });
//         }

//         // Validate all product availability
//         for (let { product, quantity } of products) {
//             const foundProduct = await Product.findById(product);
//             if (!foundProduct) {
//                 return res.status(404).json({ message: `Product ${product} not found` });
//             }

//             const inventories = await Inventory.find({ product, warehouse: warehouseId });
//             const totalAvailable = inventories.reduce((sum, inv) => sum + inv.quantity, 0);

//             if (totalAvailable < quantity) {
//                 return res.status(400).json({ message: `Not enough stock for ${foundProduct.name}` });
//             }
//         }

//         const outboundProductEntries = [];
//         let totalAmount = 0;

//         // FIFO stock deduction
//         for (let { product, quantity } of products) {
//             let remainingQty = quantity;

//             const productDoc = await Product.findById(product);
//             const inventoryBatches = await Inventory.find({
//                 product,
//                 warehouse: warehouseId,
//                 quantity: { $gt: 0 } // ✅ Only consider inventory with quantity > 0
//             }).sort({ date: 1 });

//             for (let batch of inventoryBatches) {
//                 if (remainingQty <= 0) break;

//                 const usedQty = Math.min(batch.quantity, remainingQty);

//                 const sellingPrice = productDoc.price; // Get from Product model
//                 const buyingPrice = batch.buyingPrice;  // Get from Inventory
//                 const subtotal = sellingPrice * usedQty;

//                 outboundProductEntries.push({
//                     product,
//                     quantity: usedQty,
//                     inventoryId: batch._id,
//                     sellingPrice,
//                     buyingPrice,
//                     subtotal
//                 });

//                 totalAmount += subtotal;

//                 batch.quantity -= usedQty;
//                 remainingQty -= usedQty;

//                 await batch.save(); // Always save, even if 0 (for reversal tracking)
//             }
//         }

//         // Save outbound record
//         const outbound = new Outbound({
//             warehouse: warehouseId,
//             products: outboundProductEntries,
//             total: totalAmount
//         });

//         await outbound.save();

//         res.status(201).json({ message: "Outbound (POS) created", outbound });

//     } catch (error) {
//         console.error("Error creating outbound:", error);
//         res.status(500).json({ message: "Error creating outbound record", error: error.message });
//     }
// };

// Updated createOutbound with discount logic
