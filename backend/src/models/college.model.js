import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    degrees: [{
      name: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export const College = mongoose.model("College", collegeSchema); 