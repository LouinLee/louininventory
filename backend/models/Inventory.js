// models/Inventory.js

const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    quantity: { type: Number, required: true, default: 0 },
    buyingPrice: { type: Number, required: true },
    date: { type: Date, required: true },

    inboundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inbound",
        required: true
    }
});

module.exports = mongoose.model("Inventory", InventorySchema);
