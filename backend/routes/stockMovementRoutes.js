// routes/stockMovementRoutes.js

const express = require("express");
const stockMovementController = require("../controllers/stockMovementController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes below will require authentication

router.post("/", stockMovementController.createStockMovement);
router.get("/", stockMovementController.getAllStockMovements);
router.post("/reverse/:id", requireRole("admin"), stockMovementController.reverseStockMovement);

module.exports = router;
