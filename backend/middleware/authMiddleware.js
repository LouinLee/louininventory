// middlware/authMiddleware.js

const { verifyToken } = require("../config/auth");

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // Read token from cookies

    // Redirect if no token to main landing page (No longer needed, PrivateRoute.js in frontend)
    // if (!token) return res.redirect("/login"); 

    // POSTMAN
    if (!token) {
        console.log("No token provided");

        // Always return JSON if the request is from Postman or any API client
        if (
            req.headers["user-agent"]?.includes("Postman") ||
            req.headers["content-type"]?.includes("application/json") ||
            req.headers.accept?.includes("*/*")
        ) {
            return res.status(401).json({ error: "Unauthorized, token missing" });
        }
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        res.clearCookie("token"); // Clear invalid token
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
