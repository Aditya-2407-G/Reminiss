import mongoose from "mongoose";

const privateMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    anonymousThreadId: {
      type: mongoose.Schema.Types.ObjectId,
      // This will be used to group anonymous messages into conversations
      // It's set when an anonymous message is created or when replying to one
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient conversation queries
privateMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
privateMessageSchema.index({ anonymousThreadId: 1, createdAt: -1 });

export const PrivateMessage = mongoose.model("PrivateMessage", privateMessageSchema);