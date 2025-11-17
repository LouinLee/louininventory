// controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/auth");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Show register page
exports.registerForm = (req, res) => {
    res.render("register");
};

// Show login page
exports.loginForm = (req, res) => {
    res.render("login");
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid password" });

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "None",  // allow cross-site
            secure: true,      // must use HTTPS
            maxAge: 43200000,  // 12 hours
        });

        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Always create as admin
        const user = new User({ username, password, role: "admin" });
        await user.save();

        res.status(201).json({ message: "Admin registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// Old logout method (just clear cookie on client side)
// exports.logout = (req, res) => {
//     res.clearCookie("token");
//     res.redirect("/login");
// };

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });    
    res.status(200).json({ message: "Logged out" });
};

// Create new user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Only admin can create
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = new User({ username, password, role });
        await user.save();

        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Failed to create user", error });
    }
};

exports.getMe = async (req, res) => {
    try {
        const token = req.cookies.token; // cookie from frontend

        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch user from DB
        const user = await User.findById(decoded.id).select("-password"); // exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            id: user._id,
            username: user.username,
            role: user.role, // include role for frontend
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// WORKING LOGIN FUNCTION AFTER HAVING AUTHSERVICE.JS (NEVER DELETE)
// exports.login = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         // Find user
//         const user = await User.findOne({ username });
//         if (!user) return res.render("login", { error: "User not found" });

//         // Validate password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.render("login", { error: "Invalid credentials" });

//         // Generate JWT token & store in cookie
//         const token = generateToken(user);
//         res.cookie("token", token, {
//             httpOnly: true, // ⚠️ allow client-side access if false (SET TO TRUE FOR SECURITY NOW!)
//             sameSite: "Lax", // Currently "Lax" or "None" if using cross-site (and set secure: true)
//             maxAge: 43200000, // 12 hours
//         });

//         res.status(200).json({ token }); //For Postman token

//         // res.redirect("/home");
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// };
