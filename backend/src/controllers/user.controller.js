import { User } from "../models/user.model.js";
import { Batch } from "../models/batch.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { 
  generateAccessToken, 
  generateRefreshToken,
  invalidateAllUserTokens 
} from "../utils/tokenService.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, enrollmentNumber, batchCode } = req.body;

  if (!name || !email || !password || !enrollmentNumber || !batchCode) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Find the batch using the batch code
  const batch = await Batch.findOne({ batchCode });
  if (!batch) {
    throw new ApiError(404, "Invalid batch code");
  }

  // Check if enrollment number is in the batch's enrollment list
  if (!batch.enrollmentNumbers.includes(enrollmentNumber)) {
    throw new ApiError(400, "Invalid enrollment number for this batch");
  }

  // Check if enrollment number is already registered
  const existingEnrollment = await User.findOne({
    enrollmentNumber,
    batch: batch._id,
  });
  if (existingEnrollment) {
    throw new ApiError(
      409,
      "This enrollment number is already registered for this batch"
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    enrollmentNumber,
    batch: batch._id,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id, "User");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { 
          user: { ...user._doc, password: undefined }, 
          accessToken,
          refreshToken 
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Get the refresh token from cookies
  const refreshToken = req.cookies?.refreshToken;
  
  // If refresh token exists, invalidate it
  if (refreshToken) {
    await invalidateAllUserTokens(req.user._id, "User");
  }

  // Clear cookies
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user fetched successfully")
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, profilePicture } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name: name || req.user.name,
        profilePicture: profilePicture || req.user.profilePicture,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
}; 