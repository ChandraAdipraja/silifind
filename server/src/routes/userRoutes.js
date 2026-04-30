const express = require("express");
const { getUsers, updateUserRole } = require("../controllers/userController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);

module.exports = router;
