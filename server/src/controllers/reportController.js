const Claim = require("../models/Claim");
const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const { title, category, description, location, type, image } = req.body;

    const report = await Report.create({
      title,
      category,
      description,
      location,
      type,
      image,
      reportedBy: req.user._id,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getReports = async (req, res) => {
  const reports = await Report.find()
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });

  res.json(reports);
};

const getReportById = async (req, res) => {
  const report = await Report.findById(req.params.id).populate(
    "reportedBy",
    "name",
  );

  if (!report) {
    return res.status(404).json({
      message: "Report tidak ditemukan",
    });
  }

  res.json(report);
};

const updateReport = async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      message: "Report tidak ditemukan",
    });
  }

  if (report.reportedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Tidak punya akses",
    });
  }

  Object.assign(report, req.body);

  await report.save();

  res.json(report);
};

const deleteReport = async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({
      message: "Report tidak ditemukan",
    });
  }

  const canModerate = ["admin", "operator"].includes(req.user.role);
  const isOwner = report.reportedBy.toString() === req.user._id.toString();

  if (!isOwner && !canModerate) {
    return res.status(403).json({
      message: "Tidak punya akses",
    });
  }

  await Claim.deleteMany({ report: report._id });
  await report.deleteOne();

  res.json({
    message: "Report dihapus",
  });
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
};
