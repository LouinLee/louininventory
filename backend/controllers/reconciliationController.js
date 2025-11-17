// controllers/reconciliationController.js

const StockReconciliation = require("../models/StockReconciliation");
const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const Inventory = require("../models/Inventory");

exports.createReconciliation = async (req, res) => {
    try {
        const { warehouseId, products, notes, date } = req.body;

        // Validate warehouse
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

        let reconciliationEntries = [];
        let totalLoss = 0;

        for (let { product, quantity } of products) {
            if (quantity <= 0) {
                return res.status(400).json({ message: "Quantity must be greater than 0" });
            }

            const productDoc = await Product.findById(product);
            if (!productDoc) return res.status(404).json({ message: `Product ${product} not found` });

            let remainingQty = quantity;
            const inventoryBatches = await Inventory.find({
                product,
                warehouse: warehouseId,
                quantity: { $gt: 0 }
            }).sort({ date: 1 }); // FIFO

            const totalAvailable = inventoryBatches.reduce((sum, inv) => sum + inv.quantity, 0);
            if (totalAvailable < quantity) {
                return res.status(400).json({ message: `Not enough stock for ${productDoc.name} to reconcile` });
            }

            for (let batch of inventoryBatches) {
                if (remainingQty <= 0) break;

                const usedQty = Math.min(batch.quantity, remainingQty);
                const subtotal = usedQty * batch.buyingPrice;

                reconciliationEntries.push({
                    product,
                    quantity: usedQty,
                    inventoryId: batch._id,
                    buyingPrice: batch.buyingPrice,
                    subtotal
                });

                totalLoss += subtotal;
                batch.quantity -= usedQty;
                remainingQty -= usedQty;
                await batch.save();
            }
        }

        const reconciliation = new StockReconciliation({
            warehouse: warehouseId,
            products: reconciliationEntries,
            notes,          // ✅ top-level note
            totalLoss,
            date: date ? new Date(date) : new Date()  // ✅ use user input or fallback
        });

        await reconciliation.save();
        res.status(201).json({ message: "Stock reconciliation created", reconciliation });
    } catch (error) {
        console.error("Error creating reconciliation:", error);
        res.status(500).json({ message: "Error creating reconciliation", error: error.message });
    }
};


// Get all reconciliations
exports.getAllReconciliations = async (req, res) => {
    try {
        const reconciliations = await StockReconciliation.find()
            .populate("warehouse", "name")
            .populate("products.product", "name")
            .exec();

        res.status(200).json(reconciliations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reconciliations", error });
    }
};

// Reverse reconciliation
exports.reverseReconciliation = async (req, res) => {
    try {
        const { id } = req.params;

        const reconciliation = await StockReconciliation.findById(id).populate("products.inventoryId");

        if (!reconciliation) {
            return res.status(404).json({ message: "Reconciliation record not found." });
        }

        if (reconciliation.reversed) {
            return res.status(400).json({ message: "This reconciliation has already been reversed." });
        }

        // Restore stock to original batches
        for (const item of reconciliation.products) {
            const { product, quantity, inventoryId } = item;

            const original = await Inventory.findById(inventoryId);
            if (!original) {
                return res.status(400).json({ message: `Original inventory not found for product ${product}` });
            }

            original.quantity += quantity;
            await original.save();
        }

        reconciliation.reversed = true;
        await reconciliation.save();

        res.status(200).json({ message: "Reconciliation successfully reversed." });
    } catch (error) {
        console.error("Error reversing reconciliation:", error);
        res.status(500).json({ message: "Failed to reverse reconciliation", error: error.message });
    }
};
