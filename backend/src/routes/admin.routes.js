import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  createBatch,
  getBatchDetails,
  getBatchEntries,
  removeEntry,
} from "../controllers/admin.controller.js";
import { verifyJWT, isAdmin, isSuperAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Auth routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", verifyJWT, isAdmin, logoutAdmin);

// Batch management routes
router.post("/batches", verifyJWT, isAdmin, createBatch);
router.get("/batches/:batchId", verifyJWT, isAdmin, getBatchDetails);
router.get("/batches/:batchId/entries", verifyJWT, isAdmin, getBatchEntries);

// Entry moderation routes
router.delete("/entries/:entryId", verifyJWT, isAdmin, removeEntry);

export default router; 