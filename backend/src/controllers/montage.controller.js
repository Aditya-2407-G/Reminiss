import { Montage } from "../models/montage.model.js";
import { Entry } from "../models/entry.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { montageQueue } from "../utils/queue.js";

const requestMontage = asyncHandler(async (req, res) => {
  const { imageIds, selectedAudio } = req.body;

  if (!imageIds || !imageIds.length || !selectedAudio) {
    throw new ApiError(400, "Image IDs and audio selection are required");
  }

  // Verify that all images exist and are accessible by the user
  const entries = await Entry.find({
    _id: { $in: imageIds },
    batch: req.user.batch,
  });

  if (entries.length !== imageIds.length) {
    throw new ApiError(400, "One or more images are invalid or inaccessible");
  }

  // Extract image URLs from entries
  const imageUrls = entries.map((entry) => entry.imageUrl);

  // Create montage request
  const montage = await Montage.create({
    user: req.user._id,
    imageUrls,
    selectedAudio,
    batch: req.user.batch,
  });

  // Add job to the queue
  const job = await montageQueue.add({
    montageId: montage._id,
    imageUrls,
    selectedAudio,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { montage, jobId: job.id },
        "Montage request created and queued for processing"
      )
    );
});

const getMontageStatus = asyncHandler(async (req, res) => {
  const { montageId } = req.params;

  const montage = await Montage.findById(montageId);

  if (!montage) {
    throw new ApiError(404, "Montage request not found");
  }

  // Verify ownership
  if (montage.user.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to access this montage request"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        montage,
        `Montage status: ${montage.status}`
      )
    );
});

const getUserMontages = asyncHandler(async (req, res) => {
  const montages = await Montage.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, montages, "User montages fetched successfully")
    );
});

export { requestMontage, getMontageStatus, getUserMontages }; 