import { PrivateMessage } from "../models/privateMessage.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { v4 as uuidv4 } from "uuid"

const sendPrivateMessage = asyncHandler(async (req, res) => {
  const { recipientId, message, isAnonymous, anonymousThreadId } = req.body

  if (!recipientId || !message) {
    throw new ApiError(400, "Recipient and message are required")
  }

  // Verify recipient exists and is in the same batch
  const recipient = await User.findById(recipientId)
  if (!recipient) {
    throw new ApiError(404, "Recipient not found")
  }

  // Check if recipient is in the same batch as the sender
  if (recipient.batch.toString() !== req.user.batch.toString()) {
    throw new ApiError(403, "You can only send messages to users in your batch")
  }

  // Generate or use provided anonymousThreadId
  const threadId = isAnonymous ? anonymousThreadId || uuidv4() : null

  const privateMessage = await PrivateMessage.create({
    sender: req.user._id,
    recipient: recipientId,
    message,
    batch: req.user.batch,
    isAnonymous: isAnonymous || false,
    anonymousThreadId: threadId,
  })

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        ...privateMessage.toObject(),
        anonymousThreadId: threadId,
      },
      "Private message sent successfully",
    ),
  )
})

const getReceivedMessages = asyncHandler(async (req, res) => {
  // Fetch all received messages
  const messages = await PrivateMessage.find({ recipient: req.user._id }).sort({ createdAt: -1 }).populate({
    path: "sender",
    select: "name profilePicture",
  })

  // Process messages to handle anonymous ones
  const processedMessages = messages.map((message) => {
    const processedMessage = message.toObject()

    if (processedMessage.isAnonymous) {
      // Keep the anonymousThreadId but remove sender identity
      processedMessage.sender = null
    }

    return processedMessage
  })

  return res.status(200).json(new ApiResponse(200, processedMessages, "Received messages fetched successfully"))
})

const getSentMessages = asyncHandler(async (req, res) => {
  const messages = await PrivateMessage.find({ sender: req.user._id })
    .sort({ createdAt: -1 })
    .populate("recipient", "name profilePicture")

  return res.status(200).json(new ApiResponse(200, messages, "Sent messages fetched successfully"))
})

const replyToAnonymous = asyncHandler(async (req, res) => {
  const { anonymousThreadId, message } = req.body

  if (!anonymousThreadId || !message) {
    throw new ApiError(400, "Thread ID and message are required")
  }

  // Find the original anonymous message to get the sender
  const originalMessage = await PrivateMessage.findOne({
    anonymousThreadId,
    recipient: req.user._id,
    isAnonymous: true,
  })

  if (!originalMessage) {
    throw new ApiError(404, "Anonymous thread not found")
  }

  // Create reply message
  const replyMessage = await PrivateMessage.create({
    sender: req.user._id,
    recipient: originalMessage.sender,
    message,
    batch: req.user.batch,
    isAnonymous: false, // Reply is not anonymous
    anonymousThreadId, // Use the same thread ID to maintain the conversation
    isReplyToAnonymous: true,
  })

  return res.status(201).json(new ApiResponse(201, replyMessage, "Reply to anonymous message sent successfully"))
})

const getAnonymousThreads = asyncHandler(async (req, res) => {
  // Get all unique anonymous threads where the user is either sender or recipient
  const threads = await PrivateMessage.aggregate([
    {
      $match: {
        anonymousThreadId: { $ne: null },
        $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$anonymousThreadId",
        latestMessage: { $first: "$$ROOT" },
        messageCount: { $sum: 1 },
      },
    },
  ])

  // Populate necessary fields
  const populatedThreads = await Promise.all(
    threads.map(async (thread) => {
      const messages = await PrivateMessage.find({ anonymousThreadId: thread._id })
        .sort({ createdAt: 1 })
        .populate("sender", "name profilePicture")
        .populate("recipient", "name profilePicture")

      // Process messages to hide sender identity when needed
      const processedMessages = messages.map((msg) => {
        const msgObj = msg.toObject()

        // If message is anonymous and current user is the recipient, hide sender
        if (msgObj.isAnonymous && msgObj.recipient._id.toString() === req.user._id.toString()) {
          msgObj.sender = null
        }

        return msgObj
      })

      return {
        threadId: thread._id,
        messages: processedMessages,
        messageCount: thread.messageCount,
        lastActivity: thread.latestMessage.createdAt,
      }
    }),
  )

  return res.status(200).json(new ApiResponse(200, populatedThreads, "Anonymous threads fetched successfully"))
})

const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params

  const message = await PrivateMessage.findById(messageId)
  if (!message) {
    throw new ApiError(404, "Message not found")
  }

  // Check if the user is the recipient
  if (message.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to mark this message as read")
  }

  message.isRead = true
  await message.save()

  return res.status(200).json(new ApiResponse(200, message, "Message marked as read"))
})

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params

  const message = await PrivateMessage.findById(messageId)
  if (!message) {
    throw new ApiError(404, "Message not found")
  }

  // Check if the user is either the sender or recipient
  if (
    message.sender.toString() !== req.user._id.toString() &&
    message.recipient.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to delete this message")
  }

  await PrivateMessage.findByIdAndDelete(messageId)

  return res.status(200).json(new ApiResponse(200, {}, "Message deleted successfully"))
})

export {
  sendPrivateMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageAsRead,
  deleteMessage,
  replyToAnonymous,
  getAnonymousThreads,
}
