import { Router } from "express";
import {
  createEntry,
  getAllEntries,
  getUserEntries,
  getBatchEntries,
} from "../controllers/entry.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Entry routes
router.post("/", verifyJWT, createEntry);
router.get("/", verifyJWT, getAllEntries);
router.get("/user", verifyJWT, getUserEntries);
router.get("/batch/:batchId", verifyJWT, getBatchEntries);
// router.patch("/:entryId", verifyJWT, updateEntry);
// router.delete("/:entryId", verifyJWT, deleteEntry);    

export default router; 