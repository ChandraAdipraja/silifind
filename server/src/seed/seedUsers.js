require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const users = [
      {
        name: "Admin SiliFind",
        email: "admin@silifind.com",
        phoneNumber: "081111111111",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Operator SiliFind",
        email: "operator@silifind.com",
        phoneNumber: "082222222222",
        password: "operator123",
        role: "operator",
      },
      {
        name: "User Demo",
        email: "user@silifind.com",
        phoneNumber: "083333333333",
        password: "user123",
        role: "user",
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User sudah ada: ${userData.email}`);
        continue;
      }

      await User.create(userData);
      console.log(`User dibuat: ${userData.email}`);
    }

    console.log("Seed users selesai");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedUsers();
