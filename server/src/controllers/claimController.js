const Claim = require("../models/Claim");
const Report = require("../models/Report");

const createClaim = async (req, res) => {
  try {
    const { reportId, proofDescription, proofImage } = req.body;

    if (!reportId || !proofDescription) {
      return res.status(400).json({
        message: "Report ID dan deskripsi bukti wajib diisi",
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report tidak ditemukan",
      });
    }

    if (report.type !== "found") {
      return res.status(400).json({
        message: "Hanya found report yang dapat diklaim",
      });
    }

    if (report.status === "returned") {
      return res.status(400).json({
        message: "Barang sudah dikembalikan dan tidak dapat diklaim",
      });
    }

    if (report.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Tidak bisa mengklaim report milik sendiri",
      });
    }

    const existingClaim = await Claim.findOne({
      report: reportId,
      claimant: req.user._id,
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "Kamu sudah pernah mengajukan klaim untuk report ini",
      });
    }

    const claim = await Claim.create({
      claimant: req.user._id,
      report: reportId,
      proofDescription,
      proofImage,
    });

    return res.status(201).json({
      message: "Klaim berhasil diajukan",
      claim,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate("report")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("claimant", "name email phoneNumber")
      .populate("report")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Klaim tidak ditemukan",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "Klaim ini sudah diproses",
      });
    }

    const report = await Report.findById(claim.report);

    if (!report) {
      return res.status(404).json({
        message: "Report tidak ditemukan",
      });
    }

    if (report.status === "returned") {
      return res.status(400).json({
        message: "Barang sudah dikembalikan",
      });
    }

    claim.status = "approved";
    claim.verifiedBy = req.user._id;
    await claim.save();

    report.status = "returned";
    await report.save();

    await Claim.updateMany(
      {
        report: report._id,
        _id: { $ne: claim._id },
        status: "pending",
      },
      {
        status: "rejected",
        verifiedBy: req.user._id,
      },
    );

    return res.status(200).json({
      message: "Klaim berhasil disetujui dan report ditandai returned",
      claim,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Klaim tidak ditemukan",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "Klaim ini sudah diproses",
      });
    }

    claim.status = "rejected";
    claim.verifiedBy = req.user._id;
    await claim.save();

    return res.status(200).json({
      message: "Klaim berhasil ditolak",
      claim,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Klaim tidak ditemukan",
      });
    }

    await claim.deleteOne();

    return res.status(200).json({
      message: "Klaim berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getAllClaims,
  approveClaim,
  rejectClaim,
  deleteClaim,
};
