// controllers/warehouseController.js

const Warehouse = require("../models/Warehouse");
const Inbound = require("../models/Inbound");
const Outbound = require("../models/Outbound");
const Inventory = require("../models/Inventory"); // ✅ Don't forget this

// Create a new warehouse
exports.createWarehouse = async (req, res) => {
    const { name, location } = req.body;
    try {
        // const existingWarehouse = await Warehouse.findOne({ name });
        const existingWarehouse = await Warehouse.findOne({
            name: { $regex: `^${name}$`, $options: "i" }
        });
        if (existingWarehouse) {
            return res.status(400).json({ message: "Warehouse name already exists" });
        }

        const warehouse = new Warehouse({ name, location });
        await warehouse.save();
        res.status(201).json({ message: "Warehouse created successfully", warehouse });
    } catch (error) {
        res.status(500).json({ message: "Error creating warehouse", error: error.message });
    }
};

// // Get all warehouses
// exports.getAllWarehouses = async (req, res) => {
//     try {
//         const warehouses = await Warehouse.find();
//         res.status(200).json(warehouses);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching warehouses", error });
//     }
// };

// Get a single warehouse by ID
exports.getWarehouseById = async (req, res) => {
    const { id } = req.params;

    try {
        const warehouse = await Warehouse.findById(id);
        if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: "Error fetching warehouse", error });
    }
};

// Update a warehouse by ID
exports.updateWarehouse = async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;

    try {
        const existingWarehouse = await Warehouse.findOne({ name, _id: { $ne: id } });
        if (existingWarehouse) {
            return res.status(400).json({ message: "Warehouse name already exists" });
        }

        const warehouse = await Warehouse.findByIdAndUpdate(
            id,
            { name, location },
            { new: true }
        );
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        res.status(200).json({ message: "Warehouse updated successfully", warehouse });
    } catch (error) {
        res.status(500).json({ message: "Error updating warehouse", error: error.message });
    }
};

// Delete a warehouse by ID
exports.deleteWarehouse = async (req, res) => {
    const { id } = req.params;

    try {
        const warehouse = await Warehouse.findById(id);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        if (warehouse.deleted) {
            return res.status(400).json({ message: "Warehouse is already deleted" });
        }

        const inventoryWithStock = await Inventory.findOne({
            warehouse: id,
            quantity: { $gt: 0 },
        });

        if (inventoryWithStock) {
            return res.status(400).json({
                message: "Cannot delete warehouse — inventory still exists in this location.",
            });
        }

        warehouse.deleted = true;
        await warehouse.save();

        res.status(200).json({ message: "Warehouse soft deleted successfully" });
    } catch (error) {
        console.error("Error soft deleting warehouse:", error);
        res.status(500).json({ message: "Error soft deleting warehouse", error: error.message });
    }
};

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({ deleted: false });

        const warehousesWithStats = await Promise.all(
            warehouses.map(async (warehouse) => {
                const inboundCount = await Inbound.aggregate([
                    { $match: { warehouse: warehouse._id } },
                    { $unwind: "$products" },
                    { $group: { _id: null, total: { $sum: "$products.quantity" } } },
                ]);

                const outboundCount = await Outbound.aggregate([
                    { $match: { warehouse: warehouse._id } },
                    { $unwind: "$products" },
                    { $group: { _id: null, total: { $sum: "$products.quantity" } } },
                ]);

                return {
                    ...warehouse.toObject(),
                    inboundCount: inboundCount[0]?.total || 0,
                    outboundCount: outboundCount[0]?.total || 0,
                };
            })
        );

        res.status(200).json(warehousesWithStats);
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        res.status(500).json({ message: "Error fetching warehouses", error });
    }
};

// Get deleted warehouses
exports.getDeletedWarehouses = async (req, res) => {
    try {
        const deletedWarehouses = await Warehouse.find({ deleted: true });
        res.status(200).json(deletedWarehouses);
    } catch (err) {
        console.error("Error fetching deleted warehouses:", err);
        res.status(500).json({ message: "Failed to fetch deleted warehouses", error: err.message });
    }
};

// Undo soft delete
exports.restoreWarehouse = async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await Warehouse.findById(id);
        if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

        if (!warehouse.deleted) {
            return res.status(400).json({ message: "Warehouse is not deleted" });
        }

        warehouse.deleted = false;
        await warehouse.save();

        res.status(200).json({ message: "Warehouse restored successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error restoring warehouse", error: err.message });
    }
};
