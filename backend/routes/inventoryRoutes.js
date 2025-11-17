// routes/inventoryRoutes.js

const express = require("express");
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/warehouse/:warehouseId", authMiddleware, inventoryController.getByWarehouse);

module.exports = router;
