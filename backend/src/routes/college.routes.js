import { Router } from "express";
import {
  createCollege,
  getColleges,
  getCollegeDetails,
  updateCollege,
  deleteCollege,
} from "../controllers/college.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, isAdmin);

router.route("/")
  .post(createCollege)
  .get(getColleges);

router.route("/:collegeId")
  .get(getCollegeDetails)
  .patch(updateCollege)
  .delete(deleteCollege);

export default router;