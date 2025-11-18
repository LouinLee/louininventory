const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// router.get("/register", authController.registerForm);
// router.post("/register", authController.register);
router.get("/login", authController.loginForm);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/me", authController.getMe);

module.exports = router;
