import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  getUserClassmates
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);

// User profile routes
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/profile", verifyJWT, updateUserProfile);

// Classmates route
router.get("/classmates", verifyJWT, getUserClassmates);

export default router; 