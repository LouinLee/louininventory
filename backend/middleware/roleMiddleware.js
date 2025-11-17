// middleware/roleMiddleware.js

module.exports.requireRole = (roles) => {
    return (req, res, next) => {
        // Ensure roles is always an array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Forbidden: Requires one of the following roles: ${allowedRoles.join(", ")}` 
            });
        }

        next();
    };
};
