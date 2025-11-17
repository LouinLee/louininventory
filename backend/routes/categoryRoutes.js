// routes/categoryRoutes.js

const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes below will require authentication

router.post("/", requireRole(["admin", "purchasing"]), categoryController.createCategory);  // POST '/api/category'
router.get("/", categoryController.getAllCategories);  // GET '/api/category'
router.get("/:id", categoryController.getCategoryById);  // GET '/api/category/:id'
router.put("/:id", requireRole(["admin", "purchasing"]), categoryController.updateCategory);  // PUT '/api/category/:id'
router.delete("/:id", requireRole(["admin"]), categoryController.deleteCategory);  // DELETE '/api/category/:id'

module.exports = router;
