// routes/productRoutes.js

const express = require("express");
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes below will require authentication

// ✅ Multer first, then Auth, then Controller
router.post("/", upload.single("image"), requireRole(["admin", "purchasing"]), productController.createProduct);
router.put("/:id", upload.single("image"), requireRole(["admin", "purchasing"]), productController.updateProduct);

// ✅ Static routes first
router.get("/deleted", productController.getDeletedProducts);
router.put("/restore/:id", requireRole("admin"), productController.restoreProduct);

// ✅ Then dynamic routes
router.get("/", productController.getAllProducts);

// Get product details (for checking inventory quantity - view modal)
router.get("/:id/details", productController.getProductDetails); 

router.delete("/:id", requireRole("admin"), productController.deleteProduct);



{/*  Redundant? Old routes before upload, kept for safety  */}
// router.post("/", requireRole(["admin", "purchasing"]), productController.createProduct);
// router.put("/:id", requireRole(["admin", "purchasing"]), productController.updateProduct);

{/*  Get single product by ID — if needed later  */}
// router.get("/:id", productController.getProductById);

module.exports = router;
