const express = require("express");

const {
  createClaim,
  getMyClaims,
  getAllClaims,
  approveClaim,
  rejectClaim,
} = require("../controllers/claimController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createClaim);
router.get("/my-claims", protect, getMyClaims);

router.get("/", protect, authorizeRoles("admin", "operator"), getAllClaims);

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("admin", "operator"),
  approveClaim,
);

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("admin", "operator"),
  rejectClaim,
);

module.exports = router;
