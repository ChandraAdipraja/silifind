const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (dataUri) =>
  cloudinary.uploader.upload(dataUri, {
    folder: "silifind",
    resource_type: "image",
  });

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

    const result = await uploadToCloudinary(base64Image);

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

const uploadBase64Image = async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        message: "File gambar wajib diunggah",
      });
    }

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(mimeType)) {
      return res.status(400).json({
        message: "Format file harus JPG, JPEG, PNG, atau WEBP",
      });
    }

    const base64Content = String(imageBase64).includes(",")
      ? String(imageBase64).split(",").pop()
      : imageBase64;
    const base64Image = `data:${mimeType};base64,${base64Content}`;
    const result = await uploadToCloudinary(base64Image);

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
  uploadBase64Image,
};
