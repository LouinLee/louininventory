// models/Outbound.js

const mongoose = require("mongoose");

const OutboundSchema = new mongoose.Schema({
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
            type: Number,
            required: true
        },
        inventoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory", // This ties it to the batch
            required: true
        },
        sellingPrice: {
            type: Number,
            required: true
        },
        buyingPrice: {
            type: Number,
            required: true
        },
        discountType: { // "amount" | "percent"
            type: String,
            enum: ["amount", "percent", null],
            default: null
        },
        discountValue: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date, default: Date.now
    },
    reversed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Outbound", OutboundSchema);
