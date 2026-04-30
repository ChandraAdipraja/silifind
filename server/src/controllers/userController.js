const User = require("../models/User");

const allowedRoles = ["user", "operator", "admin"];

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users berhasil diambil",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memuat users",
      error: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Role tidak valid",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Role user berhasil diperbarui",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memperbarui role user",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};
