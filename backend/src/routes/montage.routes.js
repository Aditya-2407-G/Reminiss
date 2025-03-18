import { Router } from "express";
import {
  requestMontage,
  getMontageStatus,
  getUserMontages,
} from "../controllers/montage.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Montage routes
router.post("/", verifyJWT, requestMontage);
router.get("/:montageId", verifyJWT, getMontageStatus);
router.get("/", verifyJWT, getUserMontages);

export default router; 