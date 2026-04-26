const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File gambar wajib diunggah",
      });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64",
    )}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "silifind",
      resource_type: "image",
    });

    return res.status(201).json({
      message: "Upload gambar berhasil",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat upload gambar",
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};
