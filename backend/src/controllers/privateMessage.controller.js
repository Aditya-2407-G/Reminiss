import { PrivateMessage } from "../models/privateMessage.model.js";
import { User } from "../models/user.model.js";
import { Batch } from "../models/batch.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const sendPrivateMessage = asyncHandler(async (req, res) => {
  const { recipientId, message, isAnonymous, replyToAnonymousId } = req.body;

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

  const messageData = {
    sender: req.user._id,
    recipient: recipientId,
    message,
    batch: req.user.batch,
    isAnonymous: isAnonymous || false,
  };

  // If this is a reply to an anonymous message, link it to the original thread
  if (replyToAnonymousId) {
    // Find the original anonymous message
    const originalMessage = await PrivateMessage.findOne({
      _id: replyToAnonymousId,
      isAnonymous: true,
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    });

    if (!originalMessage) {
      throw new ApiError(404, "Original anonymous message not found");
    }

    // Set up the anonymous conversation thread
    messageData.anonymousThreadId = originalMessage.anonymousThreadId || originalMessage._id;
    messageData.isAnonymous = true;
    
    // If the current user was the recipient of the anonymous message, they are replying
    if (originalMessage.recipient.toString() === req.user._id.toString()) {
      messageData.recipient = originalMessage.sender; // Reply goes to the original sender
    }
  }

  // Generate a unique thread ID for new anonymous messages
  if (isAnonymous && !replyToAnonymousId) {
    messageData.anonymousThreadId = new mongoose.Types.ObjectId();
  }

  const privateMessage = await PrivateMessage.create(messageData);

  return res
    .status(201)
    .json(new ApiResponse(201, privateMessage, "Private message sent successfully"));
});

const getConversations = asyncHandler(async (req, res) => {
  // Get all messages where user is sender or recipient
  const messages = await PrivateMessage.find({
    $or: [{ sender: req.user._id }, { recipient: req.user._id }]
  })
  .sort({ createdAt: -1 })
  .populate({
    path: "sender",
    select: "name profilePicture"
  })
  .populate({
    path: "recipient", 
    select: "name profilePicture"
  });

  // Group messages into conversations
  const conversationMap = new Map();

  messages.forEach(message => {
    let conversationKey;
    let otherUser;
    
    if (message.isAnonymous) {
      // For anonymous messages, use the thread ID as the conversation key
      conversationKey = message.anonymousThreadId || message._id.toString();
      
      // Determine who the "other user" is based on who we are
      if (message.sender._id.toString() === req.user._id.toString()) {
        // We sent this anonymous message
        otherUser = message.recipient;
      } else {
        // We received this anonymous message
        otherUser = null; // Keep sender anonymous
      }
    } else {
      // For regular messages, create a consistent conversation key
      const userId1 = message.sender._id.toString();
      const userId2 = message.recipient._id.toString();
      conversationKey = [userId1, userId2].sort().join('-');
      
      // The other user is whoever is not the current user
      otherUser = message.sender._id.toString() === req.user._id.toString() 
        ? message.recipient 
        : message.sender;
    }

    if (!conversationMap.has(conversationKey)) {
      conversationMap.set(conversationKey, {
        conversationId: conversationKey,
        otherUser: otherUser,
        messages: [],
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
        isAnonymous: message.isAnonymous,
        anonymousThreadId: message.anonymousThreadId || message._id
      });
    }

    const conversation = conversationMap.get(conversationKey);
    
    // Process the message for display
    let processedMessage = message.toObject();
    
    // If it's an anonymous message and we're the recipient, hide sender info
    if (message.isAnonymous && message.recipient._id.toString() === req.user._id.toString()) {
      processedMessage.sender = null;
    }
    
    conversation.messages.push(processedMessage);
    
    // Update conversation metadata
    if (!conversation.lastMessageTime || message.createdAt > conversation.lastMessageTime) {
      conversation.lastMessage = message;
      conversation.lastMessageTime = message.createdAt;
    }
    
    // Count unread messages
    if (!message.isRead && message.recipient._id.toString() === req.user._id.toString()) {
      conversation.unreadCount++;
    }
  });

  // Convert to array and sort by most recent
  const conversations = Array.from(conversationMap.values())
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  return res
    .status(200)
    .json(new ApiResponse(200, conversations, "Conversations fetched successfully"));
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
  getConversations,
  markMessageAsRead,
  deleteMessage,
};