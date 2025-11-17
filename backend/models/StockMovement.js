// models/StockMovement.js

const mongoose = require("mongoose");

const StockMovementSchema = new mongoose.Schema({
    fromWarehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },
    toWarehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true
        },
    }],
    date: {
        type: Date,
        default: Date.now
    },
    reversed: {
        type: Boolean,
        default: false,
      }
});

exports.getAllStockMovements = async (req, res) => {
    try {
        const movements = await StockMovement.find()
            .populate("fromWarehouse", "name")
            .populate("toWarehouse", "name")
            .populate("products.product", "name")
            .exec();

        res.status(200).json(movements);
    } catch (error) {
        console.error("Error fetching stock movements:", error);
        res.status(500).json({ message: "Failed to fetch stock movements", error: error.message });
    }
};

module.exports = mongoose.model("StockMovement", StockMovementSchema);
