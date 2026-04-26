const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "SiliFind API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

module.exports = app;
