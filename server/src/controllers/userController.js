const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["user", "operator", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Role tidak valid",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "Role user berhasil diperbarui",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};
