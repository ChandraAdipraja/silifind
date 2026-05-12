const express = require("express");

const {
  register,
  login,
  getProfile,
  updateProfile,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/reset-password", protect, resetPassword);

module.exports = router;
