import { Entry } from "../models/entry.model.js";
import { User } from "../models/user.model.js";
import { Batch } from "../models/batch.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { transformAndUpload } from "../utils/cloudinary.js";

const createEntry = asyncHandler(async (req, res) => {
  const { message, tags } = req.body;
  
  // Validate required fields
  if (!message) {
    throw new ApiError(400, "Message is required");
  }
  
  if (!req.files || !req.files.image) {
    throw new ApiError(400, "Image is required");
  }

  // Get user's batch details to extract college and degree info
  const userBatch = await Batch.findById(req.user.batch);
  if (!userBatch) {
    throw new ApiError(404, "User's batch not found");
  }

  const existingEntry = await Entry.findOne({
    user: req.user._id,
    batch: req.user.batch,
  })

  if (existingEntry) {
    throw new ApiError(400, "You have already created an entry. Multiple entries are not allowed");
  }

  const imageLocalPath = req.files.image.tempFilePath;
  
  // Transform with Cloudinary and upload to Google Drive
  const imageUrl = await transformAndUpload(imageLocalPath);

  console.log(imageUrl);
  
  if (!imageUrl) {
    throw new ApiError(500, "Error processing and uploading image");
  }

  const entry = await Entry.create({
    user: req.user._id,
    imageUrl,
    message,
    tags: tags ? JSON.parse(tags) : [],
    batch: req.user.batch,
    college: userBatch.college,
    degree: userBatch.degree
  });

  return res
    .status(201)
    .json(new ApiResponse(201, entry, "Entry created successfully"));
});

const getAllEntries = asyncHandler(async (req, res) => {
  const userBatch = await Batch.findById(req.user.batch);
  if (!userBatch) {
    throw new ApiError(404, "User's batch information not found");
  }

  const filter = {
    college: userBatch.college
  };

  const entries = await Entry.find(filter)
    .populate("user", "name enrollmentNumber profilePicture")
    .populate("college", "name code")
    .populate("batch", "batchYear batchCode");

  // Create a map for quick lookup of entries by enrollment number
  const entriesByEnrollment = entries.reduce((acc, entry) => {
    acc[entry.user.enrollmentNumber] = entry;
    return acc;
  }, {});

  // Sort entries according to enrollment numbers list
  const sortedEntries = userBatch.enrollmentNumbers.map(enrollmentNumber => 
    entriesByEnrollment[enrollmentNumber] || null
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {
      entries: sortedEntries,
      batchInfo: {
        totalStudents: userBatch.enrollmentNumbers.length,
        batchYear: userBatch.batchYear,
        batchCode: userBatch.batchCode,
        enrollmentNumbers: userBatch.enrollmentNumbers
      }
    }, "Entries fetched successfully"));
});

const getBatchEntries = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }
  
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = { 
    batch: batchId,
    college: batch.college,
    degree: batch.degree
  };
  
  const entriesCount = await Entry.countDocuments(filter);
  const totalPages = Math.ceil(entriesCount / limitNumber);
  
  const entries = await Entry.find(filter)
    .populate("user", "name enrollmentNumber profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      entries,
      pagination: {
        totalEntries: entriesCount,
        totalPages,
        currentPage: pageNumber,
        entriesPerPage: limitNumber
      }
    }, "Batch entries fetched successfully"));
});

const getUserEntries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = { user: req.user._id };
  const entriesCount = await Entry.countDocuments(filter);
  const totalPages = Math.ceil(entriesCount / limitNumber);
  
  const entries = await Entry.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        entries,
        pagination: {
          totalEntries: entriesCount,
          totalPages,
          currentPage: pageNumber,
          entriesPerPage: limitNumber
        }
      }, "User entries fetched successfully")
    );
});

// const updateEntry = asyncHandler(async (req, res) => {
//   const { entryId } = req.params;
//   const { message, tags } = req.body;
  
//   if (!entryId) {
//     throw new ApiError(400, "Entry ID is required");
//   }

//   if (!message && !tags) {
//     throw new ApiError(400, "At least one field (message or tags) is required to update");
//   }

//   const entry = await Entry.findById(entryId);

//   if (!entry) {
//     throw new ApiError(404, "Entry not found");
//   }

//   // Check if the entry belongs to the user
//   if (entry.user.toString() !== req.user._id.toString()) {
//     throw new ApiError(403, "You are not authorized to update this entry");
//   }

//   // Parse tags safely
//   let parsedTags = entry.tags;
//   if (tags) {
//     try {
//       parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
//     } catch (error) {
//       throw new ApiError(400, "Invalid tags format");
//     }
//   }

//   const updatedEntry = await Entry.findByIdAndUpdate(
//     entryId,
//     {
//       $set: {
//         message: message || entry.message,
//         tags: parsedTags,
//       },
//     },
//     { new: true }
//   );

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedEntry, "Entry updated successfully"));
// });

// const deleteEntry = asyncHandler(async (req, res) => {
//   const { entryId } = req.params;

//   const entry = await Entry.findById(entryId);

//   if (!entry) {
//     throw new ApiError(404, "Entry not found");
//   }

//   // Check if the entry belongs to the user
//   if (entry.user.toString() !== req.user._id.toString()) {
//     throw new ApiError(403, "You are not authorized to delete this entry");
//   }

//   await Entry.findByIdAndDelete(entryId);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Entry deleted successfully"));
// });

export {
  createEntry,
  getAllEntries,
  getUserEntries,
  getBatchEntries,
}; 
