import { PrivateMessage } from "../models/privateMessage.model.js";
import { User } from "../models/user.model.js";
import { Batch } from "../models/batch.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const sendPrivateMessage = asyncHandler(async (req, res) => {
  const { recipientId, message, isAnonymous } = req.body;
  
  if (!recipientId || !message) {
    throw new ApiError(400, "Recipient and message are required");
  }

  // Verify recipient exists and is in the same batch
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new ApiError(404, "Recipient not found");
  }

  // Check if recipient is in the same batch as the sender
  if (recipient.batch.toString() !== req.user.batch.toString()) {
    throw new ApiError(403, "You can only send messages to users in your batch");
  }

  const privateMessage = await PrivateMessage.create({
    sender: req.user._id,
    recipient: recipientId,
    message,
    batch: req.user.batch,
    isAnonymous: isAnonymous || false,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, privateMessage, "Private message sent successfully"));
});

const getReceivedMessages = asyncHandler(async (req, res) => {
  // First, fetch all received messages
  const messages = await PrivateMessage.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "sender",
      select: "name profilePicture"
    });

  // Then process messages to handle anonymous ones
  const processedMessages = messages.map(message => {
    
    const processedMessage = message.toObject();
    
    if (processedMessage.isAnonymous) {
      processedMessage.sender = null;
    }
    
    return processedMessage;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, processedMessages, "Received messages fetched successfully"));
});

const getSentMessages = asyncHandler(async (req, res) => {
  const messages = await PrivateMessage.find({ sender: req.user._id })
    .sort({ createdAt: -1 })
    .populate("recipient", "name profilePicture");

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Sent messages fetched successfully"));
});

const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await PrivateMessage.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Check if the user is the recipient
  if (message.recipient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to mark this message as read");
  }

  message.isRead = true;
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as read"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await PrivateMessage.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Check if the user is either the sender or recipient
  if (
    message.sender.toString() !== req.user._id.toString() &&
    message.recipient.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to delete this message");
  }

  await PrivateMessage.findByIdAndDelete(messageId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

export {
  sendPrivateMessage,
  getReceivedMessages,
  getSentMessages,
  markMessageAsRead,
  deleteMessage,
}; 