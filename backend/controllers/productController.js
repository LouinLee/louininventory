// controllers/productController.js

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const fs = require("fs");
const path = require("path");

exports.createProduct = async (req, res) => {
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);

    try {
        const { name, description, price, category } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({ message: "Name and price are required" });
        }

        // Check duplicate name
        // const existingProduct = await Product.findOne({ name });
        const existingProduct = await Product.findOne({
            name: { $regex: `^${name}$`, $options: "i" }
        });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
        }

        // Handle image upload
        const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

        // Create new product (category can be undefined → default: null)
        const product = new Product({
            name,
            description,
            price,
            category, // optional, default null if not provided
            image: imagePath,
        });

        await product.save();

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};


// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ deleted: false }).populate("category");
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate("category");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, removeImage } = req.body;

        // ✅ Find existing product
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ Check for duplicate name (excluding current product)
        if (name && name !== product.name) {
            const existingProduct = await Product.findOne({ name, _id: { $ne: id } });
            if (existingProduct) {
                return res.status(400).json({ message: "Product name already exists" });
            }
        }

        // ✅ Update fields if provided
        if (name) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        product.category = category || null; // If not sent, null

        // ✅ Handle image update
        if (req.file) {
            // Remove old image if exists
            if (product.image) {
                const oldPath = path.join(__dirname, "..", product.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            // Save new image
            product.image = `/uploads/products/${req.file.filename}`;
        }
        else if (removeImage === "true") {
            // User requested to remove the image
            if (product.image) {
                const oldPath = path.join(__dirname, "..", product.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            product.image = null;
        }

        // ✅ Save updated product
        await product.save();

        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.deleted) {
            return res.status(400).json({ message: "Product is already deleted" });
        }

        // 🔍 Check if product exists in inventory with quantity > 0
        const inventoryWithStock = await Inventory.findOne({
            product: id,
            quantity: { $gt: 0 }
        });

        if (inventoryWithStock) {
            return res.status(400).json({
                message: "Cannot delete product — it still exists in inventory."
            });
        }

        // ✅ Soft delete the product
        product.deleted = true;
        await product.save();

        res.status(200).json({ message: "Product soft deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error soft deleting product", error });
    }
};

// Get product details including aggregated warehouse inventory
exports.getProductDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const inventory = await Inventory.find({ product: id })
            .populate("warehouse", "name location");

        // Group inventory by warehouse ID
        const warehouseMap = new Map();

        for (const item of inventory) {
            const wid = item.warehouse._id.toString();

            if (!warehouseMap.has(wid)) {
                warehouseMap.set(wid, {
                    warehouse: item.warehouse,
                    quantity: item.quantity
                });
            } else {
                warehouseMap.get(wid).quantity += item.quantity;
            }
        }

        const groupedWarehouses = Array.from(warehouseMap.values())
            .filter((w) => w.quantity > 0); // Optional: filter out zero-quantity entries

        res.status(200).json({
            product,
            warehouses: groupedWarehouses
        });
    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ message: "Error fetching product details", error });
    }
};

// Get deleted products
exports.getDeletedProducts = async (req, res) => {
    try {
        const deletedList = await Product.find({ deleted: true });
        res.status(200).json(deletedList);
    } catch (err) {
        console.error("Error fetching deleted products:", err);
        res.status(500).json({ message: "Error fetching deleted products", error: err.message });
    }
};

// Restore (undo delete) a product
exports.restoreProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (!product.deleted) return res.status(400).json({ message: "Product is not deleted" });

        product.deleted = false;
        await product.save();

        res.status(200).json({ message: "Product restored successfully" });
    } catch (err) {
        console.error("Error restoring product:", err);
        res.status(500).json({ message: "Error restoring product", error: err.message });
    }
};

// Create a new product
// exports.createProduct = async (req, res) => {
//     const { name, description, price, category } = req.body;
//     try {
//         const existingProduct = await Product.findOne({ name });
//         if (existingProduct) {
//             return res.status(400).json({ message: "Product name already exists" });
//         }

//         const product = new Product({ name, description, price, category });
//         await product.save();
//         res.status(201).json({ message: "Product created successfully", product });
//     } catch (error) {
//         res.status(500).json({ message: "Error creating product", error: error.message });
//     }
// };


// Update a product by ID
// exports.updateProduct = async (req, res) => {
//     const { id } = req.params;
//     const { name, description, price, category } = req.body;

//     try {
//         const existingProduct = await Product.findOne({ name, _id: { $ne: id } });
//         if (existingProduct) {
//             return res.status(400).json({ message: "Product name already exists" });
//         }

//         const product = await Product.findByIdAndUpdate(
//             id,
//             { name, description, price, category },
//             { new: true }
//         );
//         if (!product) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         res.status(200).json({ message: "Product updated successfully", product });
//     } catch (error) {
//         res.status(500).json({ message: "Error updating product", error: error.message });
//     }
// };

