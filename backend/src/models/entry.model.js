import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    activities: [{
      type: String,
      trim: true,
    }],
    ambition: {
      type: String,
      trim: true,
    },
    memories: {
      type: String,
      trim: true,
    },
    messageToClassmates: {
      type: String,
      trim: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

// Index for efficient queries by college, degree and batch
entrySchema.index({ college: 1, degree: 1, batch: 1 });

export const Entry = mongoose.model("Entry", entrySchema); 