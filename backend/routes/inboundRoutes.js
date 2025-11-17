// routes/inboundRoutes.js

const express = require("express");
const inboundController = require("../controllers/inboundController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes below will require authentication

router.post("/", requireRole(["admin", "purchasing"]), inboundController.createInbound);
router.get("/", requireRole(["admin", "purchasing"]), inboundController.getAllInbound);

// router.get("/:id", inboundController.getInboundById);

router.post("/reverse/:id", requireRole("admin"), inboundController.reverseInbound);

module.exports = router;
