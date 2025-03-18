import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  invalidateAllUserTokens
} from "../utils/tokenService.js";

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.cookies;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  // Verify the refresh token
  const refreshTokenDoc = await verifyRefreshToken(incomingRefreshToken);

  if (!refreshTokenDoc) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Find the user associated with the token
  let user;
  if (refreshTokenDoc.userModel === "Admin") {
    user = await Admin.findById(refreshTokenDoc.userId);
  } else {
    user = await User.findById(refreshTokenDoc.userId);
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate a new access token
  const accessToken = generateAccessToken(
    user._id,
    refreshTokenDoc.userModel === "Admin" ? user.role : null
  );

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // Send the new access token
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.cookies;

  if (!incomingRefreshToken) {
    return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiResponse(200, {}, "Logged out successfully"));
  }

  // Invalidate the refresh token
  await invalidateRefreshToken(incomingRefreshToken);

  // Clear cookies
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export { refreshToken, logout }; 