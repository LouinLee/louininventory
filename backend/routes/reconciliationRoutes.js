// routes/reconciliationRoutes.js

const express = require("express");
const reconciliationController = require("../controllers/reconciliationController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

// Create a reconciliation (negative stock adjustment)
router.post("/", reconciliationController.createReconciliation);

// Get all reconciliation records
router.get("/", reconciliationController.getAllReconciliations);

// Reverse a reconciliation
router.post("/reverse/:id", reconciliationController.reverseReconciliation);

module.exports = router;
