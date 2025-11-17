// controllers/userController.js

const User = require("../models/User");

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // const existing = await User.findOne({ username });
        const existing= await User.findOne({
            username: { $regex: `^${username}$`, $options: "i" }
        });
        if (existing) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const user = new User({ username, password, role });
        await user.save();

        res.status(201).json({ message: "User created successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent downgrading the last admin
        if (user.role === "admin" && role && role !== "admin") {
            const adminCount = await User.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                return res.status(400).json({ error: "Cannot change role of the last admin" });
            }
        }

        if (username) user.username = username;
        if (password) user.password = password; // will be hashed by pre-save
        if (role) user.role = role;

        await user.save();

        if (req.user.id === req.params.id) {
            // User modified/deleted themselves → force logout
            res.clearCookie("token");
            return res.status(200).json({
                message: "Your account has been updated. Please log in again.",
                forceLogout: true
            });
        }

        res.json({ message: "User updated successfully", user });

    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
};

// Delete user with "last admin" safeguard
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Prevent deleting the last admin
        if (user.role === "admin") {
            const adminCount = await User.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                return res.status(400).json({ error: "Cannot delete the last admin" });
            }
        }

        await user.deleteOne();

        if (req.user.id === req.params.id) {
            // User modified/deleted themselves → force logout
            res.clearCookie("token");
            return res.status(200).json({
                message: "Your account has been updated. Please log in again.",
                forceLogout: true
            });
        }

        res.json({ message: "User deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};
