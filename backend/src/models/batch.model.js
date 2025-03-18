import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batchYear: {
      type: String,
      required: true,
    },
    batchCode: {
      type: String,
      required: true,
      unique: true,
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
    enrollmentNumbers: [{
      type: String,
      required: true,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index for batchYear, college, and degree
batchSchema.index({ batchYear: 1, college: 1, degree: 1 }, { unique: true });

// Generate a unique batch code
batchSchema.statics.generateBatchCode = function() {
  return `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const Batch = mongoose.model("Batch", batchSchema); 