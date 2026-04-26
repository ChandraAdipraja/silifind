const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    proofDescription: {
      type: String,
      required: true,
    },

    proofImage: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Claim", claimSchema);
