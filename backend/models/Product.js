// models/Product.js

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false, default:null },
    deleted: { type: Boolean, default: false }, // 🔁 Soft delete flag
    image: { type: String, default: null }, // Path to the product image
});

ProductSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Product", ProductSchema);
