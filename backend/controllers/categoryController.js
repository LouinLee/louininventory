// controllers/categoryController.js

const Category = require("../models/Category");
const Product = require("../models/Product");

// Create a new category
exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        // Check existing name
        // const existingCategory = await Category.findOne({ name });
        const existingCategory = await Category.findOne({
            name: { $regex: `^${name}$`, $options: "i" }
        });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        const category = new Category({ name, description });
        await category.save();
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
        console.error("Error creating category:", error);
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const products = await Product.find({ category: id }).select("name description price");
        res.status(200).json({ category, products });
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error: error.message });
    }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        // Check existing categoy (excluding current one)
        const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};
