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
    isRead: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for faster querying
privateMessageSchema.index({ recipient: 1, createdAt: -1 });
privateMessageSchema.index({ sender: 1, recipient: 1 });
privateMessageSchema.index({ batch: 1 });

export const PrivateMessage = mongoose.model("PrivateMessage", privateMessageSchema); 