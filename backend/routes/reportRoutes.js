// routes/reportRoutes.js

const express = require("express");
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes require admin role
router.use(authMiddleware, requireRole("admin"));

// GET /api/reports/outbound?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/outbound", reportController.getOutboundReport); 

// Inbound report
router.get("/inbound", reportController.getInboundReport);

router.get("/reconciliation", reportController.getReconciliationReport);

module.exports = router;
