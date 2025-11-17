// controllers/productController.js

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// Create a new product
exports.createProduct = async (req, res) => {
    const { name, description, quantity, price, category } = req.body;
    try {
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
        }

        const product = new Product({ name, description, quantity, price, category });
        await product.save();
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("category");
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

// Update a product by ID
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, quantity, price, category } = req.body;

    try {
        const existingProduct = await Product.findOne({ name, _id: { $ne: id } });
        if (existingProduct) {
            return res.status(400).json({ message: "Product name already exists" });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { name, description, quantity, price, category },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
    }
};

// Get product details including warehouse information
exports.getProductDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const inventory = await Inventory.find({ product: id }).populate("warehouse", "name location");

        res.status(200).json({
            product,
            warehouses: inventory.map((item) => ({
                warehouse: item.warehouse,
                quantity: item.quantity,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product details", error });
    }
};