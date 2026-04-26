const express = require("express");
const router = express.Router();

const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReport);

router.get("/", getReports);

router.get("/:id", getReportById);

router.put("/:id", protect, updateReport);

router.delete("/:id", protect, deleteReport);

module.exports = router;
