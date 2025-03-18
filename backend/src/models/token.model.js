import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel'
    },
    userModel: {
      type: String, 
      required: true,
      enum: ['User', 'Admin']
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for faster token lookups
tokenSchema.index({ token: 1 });
tokenSchema.index({ userId: 1, userModel: 1 });
tokenSchema.index({ expiresAt: 1 });

export const Token = mongoose.model("Token", tokenSchema); 