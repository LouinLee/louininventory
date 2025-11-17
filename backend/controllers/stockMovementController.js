// controllers/stockMovementController.js

const StockMovement = require("../models/StockMovement");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");

exports.createStockMovement = async (req, res) => {
    try {
        const { fromWarehouseId, toWarehouseId, products, date } = req.body;

        if (fromWarehouseId === toWarehouseId) {
            return res.status(400).json({ message: "Source and destination warehouses cannot be the same" });
        }

        // Validate warehouses
        const fromWarehouse = await Warehouse.findById(fromWarehouseId);
        const toWarehouse = await Warehouse.findById(toWarehouseId);

        if (!fromWarehouse || !toWarehouse) {
            return res.status(404).json({ message: "One or both warehouses not found" });
        }

        // Validate products and availability
        for (let { product, quantity } of products) {
            const productDoc = await Product.findById(product);
            if (!productDoc) {
                return res.status(404).json({ message: `Product ${product} not found` });
            }

            const inventoryRecords = await Inventory.find({ product, warehouse: fromWarehouseId });
            const totalAvailable = inventoryRecords.reduce((sum, inv) => sum + inv.quantity, 0);

            if (totalAvailable < quantity) {
                return res.status(400).json({ message: `Not enough stock for ${productDoc.name}` });
            }
        }

        // Construct movement entries and update inventory
        const movementEntries = [];

        for (let { product, quantity } of products) {
            let remainingQty = quantity;

            const inventoryBatches = await Inventory.find({
                product,
                warehouse: fromWarehouseId
            }).sort({ date: 1 }); // FIFO

            // for (let batch of inventoryBatches) {
            //     if (remainingQty <= 0) break;

            //     const usedQty = Math.min(batch.quantity, remainingQty);

            //     // Deduct from source warehouse
            //     batch.quantity -= usedQty;

            //     // ✅ Save even if quantity becomes 0
            //     await batch.save();

            //     // Add to destination warehouse
            //     const newInventory = new Inventory({
            //         product,
            //         warehouse: toWarehouseId,
            //         quantity: usedQty,
            //         date: batch.date,
            //         buyingPrice: batch.buyingPrice,
            //         inboundId: batch.inboundId,
            //     });

            //     await newInventory.save();

            //     movementEntries.push({
            //         product,
            //         quantity: usedQty,
            //         inventoryId: newInventory._id,
            //     });

            //     remainingQty -= usedQty;
            // }

            // Updated logic to skip zero-quantity moves
            for (let batch of inventoryBatches) {
                if (remainingQty <= 0) break;
            
                const usedQty = Math.min(batch.quantity, remainingQty);
                if (usedQty <= 0) continue;  // ⬅️ skip zero-qty moves
            
                // Deduct from source warehouse
                batch.quantity -= usedQty;
                await batch.save();
            
                // Add to destination warehouse
                const newInventory = new Inventory({
                    product,
                    warehouse: toWarehouseId,
                    quantity: usedQty,
                    date: batch.date,
                    buyingPrice: batch.buyingPrice,
                    inboundId: batch.inboundId,
                });
                await newInventory.save();
            
                movementEntries.push({
                    product,
                    quantity: usedQty,
                    inventoryId: newInventory._id,
                });
            
                remainingQty -= usedQty;
            }
        }

        const stockMovement = new StockMovement({
            fromWarehouse: fromWarehouseId,
            toWarehouse: toWarehouseId,
            products: movementEntries,
            date: date ? new Date(date) : new Date()  // ✅ use user input or fallback
        });

        await stockMovement.save();

        res.status(201).json({ message: "Stock movement completed successfully", stockMovement });

    } catch (error) {
        console.error("Error moving stock:", error);
        res.status(500).json({ message: "Error moving stock", error: error.message });
    }
};

exports.getAllStockMovements = async (req, res) => {
    try {
        const movements = await StockMovement.find()
            .populate("fromWarehouse", "name")
            .populate("toWarehouse", "name")
            .populate("products.product", "name")
            .populate("products.inventoryId", "date quantity inboundId")
            .sort({ date: -1 }); // most recent first

        res.status(200).json(movements);
    } catch (error) {
        console.error("Error fetching stock movements:", error);
        res.status(500).json({ message: "Failed to fetch stock movements", error: error.message });
    }
};

exports.reverseStockMovement = async (req, res) => {
    try {
        const { id } = req.params;

        const movement = await StockMovement.findById(id).populate("products.inventoryId");

        if (!movement) {
            return res.status(404).json({ message: "Stock movement not found." });
        }

        if (movement.reversed) {
            return res.status(400).json({ message: "This stock movement has already been reversed." });
        }

        // Reverse each moved product
        for (const item of movement.products) {
            const { product, quantity, inventoryId } = item;

            // Decrease quantity from destination warehouse
            const destInventory = await Inventory.findById(inventoryId);
            if (!destInventory || destInventory.quantity < quantity) {
                return res.status(400).json({ message: `Cannot reverse product ${product}: insufficient stock.` });
            }

            destInventory.quantity -= quantity;

            // ✅ Save even if destInventory becomes 0
            await destInventory.save();

            // // Add back to source warehouse
            // const restoredInventory = new Inventory({
            //     product,
            //     warehouse: movement.fromWarehouse,
            //     quantity,
            //     inboundId: destInventory.inboundId,
            //     date: destInventory.date,
            //     buyingPrice: destInventory.buyingPrice,
            // });

            // await restoredInventory.save();
            
            // Check if the original inventory (before move) still exists (with quantity 0)
            const originalInventory = await Inventory.findOne({
                _id: item.inventoryId?.originId // or store it if you’re tracking it
            }) || await Inventory.findOne({
                product,
                warehouse: movement.fromWarehouse,
                date: destInventory.date, // closest match
                buyingPrice: destInventory.buyingPrice,
                inboundId: destInventory.inboundId,
            });

            // Reuse original inventory record if possible
            if (originalInventory) {
                originalInventory.quantity += quantity;
                await originalInventory.save();
            } else {
                // fallback if truly gone
                const newInventory = new Inventory({
                    product,
                    warehouse: movement.fromWarehouse,
                    quantity,
                    inboundId: destInventory.inboundId,
                    date: destInventory.date,
                    buyingPrice: destInventory.buyingPrice,
                });
                await newInventory.save();
            }
        }

        movement.reversed = true;
        await movement.save();

        res.status(200).json({ message: "Stock movement successfully reversed." });

    } catch (error) {
        console.error("Error reversing stock movement:", error);
        res.status(500).json({ message: "Failed to reverse stock movement", error: error.message });
    }
};
