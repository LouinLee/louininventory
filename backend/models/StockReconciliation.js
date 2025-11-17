// models/StockReconciliation.js

const mongoose = require("mongoose");

const StockReconciliationSchema = new mongoose.Schema({
    warehouse: {
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
            type: Number, // positive number, treat as deduction
            required: true
        },
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true
        },
        buyingPrice: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    notes: {
        type: String,
        default: ""
    },
    totalLoss: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    reversed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("StockReconciliation", StockReconciliationSchema);
