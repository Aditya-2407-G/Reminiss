import { Router } from "express";
import {
  sendPrivateMessage,
  getConversations,
  markMessageAsRead,
  deleteMessage,
} from "../controllers/privateMessage.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
  .post(sendPrivateMessage);

router.get("/conversations", getConversations);
router.patch("/:messageId/read", markMessageAsRead);
router.delete("/:messageId", deleteMessage);

export default router;