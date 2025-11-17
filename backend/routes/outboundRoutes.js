// routes/outboundRoutes.js

const express = require("express");
const outboundController = require("../controllers/outboundController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes below will require authentication

router.post("/", requireRole(["admin", "sales"]), outboundController.createOutbound);
router.get("/", requireRole(["admin", "sales"]), outboundController.getAllOutbound);
router.get("/products/:warehouseId", requireRole(["admin", "sales"]), outboundController.getProductsByWarehouse);
router.post("/reverse/:id", requireRole("admin"), outboundController.reverseOutbound);

module.exports = router;
