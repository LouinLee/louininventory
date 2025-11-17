// routes/warehouseRoutes.js

const express = require("express");
const warehouseController = require("../controllers/warehouseController");
const authMiddleware = require("../middleware/authMiddleware"); // Authentication middleware
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes below will require authentication

router.post("/", requireRole(["admin"]), warehouseController.createWarehouse);
router.get("/", warehouseController.getAllWarehouses);

// ✅ Static routes first
router.get("/deleted", warehouseController.getDeletedWarehouses);
router.put("/restore/:id", requireRole(["admin"]), warehouseController.restoreWarehouse);

// ✅ Then dynamic routes
router.get("/:id", warehouseController.getWarehouseById);
router.put("/:id", requireRole(["admin"]), warehouseController.updateWarehouse);
router.delete("/:id", requireRole(["admin"]), warehouseController.deleteWarehouse);

module.exports = router;
