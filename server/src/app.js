const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const claimRoutes = require("./routes/claimRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const availableEndpoints = [
  {
    method: "GET",
    path: "/api/health",
    access: "public",
    description: "Check API status",
  },
  {
    method: "GET",
    path: "/api/endpoints",
    access: "public",
    description: "List available API endpoints",
  },
  {
    method: "POST",
    path: "/api/auth/register",
    access: "public",
    description: "Register a new user",
  },
  {
    method: "POST",
    path: "/api/auth/login",
    access: "public",
    description: "Login user",
  },
  {
    method: "GET",
    path: "/api/auth/profile",
    access: "authenticated",
    description: "Get authenticated user profile",
  },
  {
    method: "POST",
    path: "/api/reports",
    access: "authenticated",
    description: "Create a report",
  },
  {
    method: "GET",
    path: "/api/reports",
    access: "public",
    description: "Get all reports",
  },
  {
    method: "GET",
    path: "/api/reports/:id",
    access: "public",
    description: "Get report by ID",
  },
  {
    method: "PUT",
    path: "/api/reports/:id",
    access: "authenticated",
    description: "Update a report",
  },
  {
    method: "DELETE",
    path: "/api/reports/:id",
    access: "authenticated",
    description: "Delete a report",
  },
  {
    method: "POST",
    path: "/api/claims",
    access: "authenticated",
    description: "Create a claim",
  },
  {
    method: "GET",
    path: "/api/claims/my-claims",
    access: "authenticated",
    description: "Get claims created by authenticated user",
  },
  {
    method: "GET",
    path: "/api/claims",
    access: "admin/operator",
    description: "Get all claims",
  },
  {
    method: "PUT",
    path: "/api/claims/:id/approve",
    access: "admin/operator",
    description: "Approve a claim",
  },
  {
    method: "PUT",
    path: "/api/claims/:id/reject",
    access: "admin/operator",
    description: "Reject a claim",
  },
  {
    method: "POST",
    path: "/api/uploads",
    access: "authenticated",
    description: "Upload an image",
  },
  {
    method: "GET",
    path: "/api/users",
    access: "admin",
    description: "Get all users",
  },
  {
    method: "PUT",
    path: "/api/users/:id",
    access: "admin",
    description: "Update user data",
  },
  {
    method: "PUT",
    path: "/api/users/:id/role",
    access: "admin",
    description: "Update user role",
  },
  {
    method: "DELETE",
    path: "/api/users/:id",
    access: "admin",
    description: "Delete user",
  },
];

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "SiliFind API is running",
  });
});

app.get("/api/endpoints", (req, res) => {
  res.status(200).json({
    total: availableEndpoints.length,
    endpoints: availableEndpoints,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
