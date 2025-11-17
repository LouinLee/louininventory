const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/low-stock", dashboardController.getLowStock);
router.get("/top-products", dashboardController.getTopProductsBySales);
router.get("/sales-trend", dashboardController.getSalesTrend);
router.get("/slow-movers", dashboardController.getSlowMovers);

module.exports = router;
