import { Router } from "express"
import {
  sendPrivateMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageAsRead,
  deleteMessage,
  replyToAnonymous,
  getAnonymousThreads,
} from "../controllers/privateMessage.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/").post(sendPrivateMessage).get(getReceivedMessages)

router.get("/sent", getSentMessages)
router.get("/anonymous-threads", getAnonymousThreads)
router.post("/reply-anonymous", replyToAnonymous)
router.patch("/:messageId/read", markMessageAsRead)
router.delete("/:messageId", deleteMessage)

export default router
