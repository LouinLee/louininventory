// models/Warehouse.js

const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: false },
    deleted: { type: Boolean, default: false }, // Soft delete
});

WarehouseSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Warehouse", WarehouseSchema);
