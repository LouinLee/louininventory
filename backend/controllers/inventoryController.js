// controllers/inventoryController.js

const Inventory = require("../models/Inventory");

// For fetching inventory in warehouse view modal page
exports.getByWarehouse = async (req, res) => {
    try {
        const inventory = await Inventory.find(
            {
                warehouse: req.params.warehouseId,
                // Only fetch items with quantity greater than 0
                quantity: { $gt: 0 } 
            })
            .populate("product", "name price")
            .populate("warehouse", "name");
        res.json(inventory);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch inventory", error: err });
    }
};
