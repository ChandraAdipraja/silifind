const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadBase64Image, uploadImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const handleImageUpload = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Ukuran gambar maksimal 5MB",
      });
    }

    return res.status(400).json({
      message: error.message || "Gagal upload gambar",
    });
  });
};

router.post("/", protect, handleImageUpload, uploadImage);
router.post("/base64", protect, uploadBase64Image);

module.exports = router;
