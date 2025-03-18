import mongoose from "mongoose";

const montageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrls: [{
      type: String,
      required: true,
    }],
    selectedAudio: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    outputUrl: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
  },
  { timestamps: true }
);

export const Montage = mongoose.model("Montage", montageSchema); 