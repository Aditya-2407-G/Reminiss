import { College } from "../models/college.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createCollege = asyncHandler(async (req, res) => {
  const { name, code, degrees } = req.body;

  if (!name || !code || !degrees || !degrees.length) {
    throw new ApiError(400, "College name, code, and at least one degree are required");
  }

  const existingCollege = await College.findOne({ 
    $or: [{ name }, { code }] 
  });

  if (existingCollege) {
    throw new ApiError(409, "College with this name or code already exists");
  }

  const college = await College.create({
    name,
    code,
    degrees,
    createdBy: req.admin._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, college, "College created successfully"));
});

const getColleges = asyncHandler(async (req, res) => {
  const colleges = await College.find().select("-createdBy");
  return res
    .status(200)
    .json(new ApiResponse(200, colleges, "Colleges fetched successfully"));
});

const getCollegeDetails = asyncHandler(async (req, res) => {
  const { collegeId } = req.params;

  const college = await College.findById(collegeId).select("-createdBy");

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, college, "College details fetched successfully"));
});

const updateCollege = asyncHandler(async (req, res) => {
  const { collegeId } = req.params;
  const { name, code, degrees } = req.body;

  const college = await College.findById(collegeId);

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  if (name) college.name = name;
  if (code) college.code = code;
  if (degrees) college.degrees = degrees;

  await college.save();

  return res
    .status(200)
    .json(new ApiResponse(200, college, "College updated successfully"));
});

const deleteCollege = asyncHandler(async (req, res) => {
  const { collegeId } = req.params;

  const college = await College.findById(collegeId);

  if (!college) {
    throw new ApiError(404, "College not found");
  }

  await College.findByIdAndDelete(collegeId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "College deleted successfully"));
});

export {
  createCollege,
  getColleges,
  getCollegeDetails,
  updateCollege,
  deleteCollege,
}; 