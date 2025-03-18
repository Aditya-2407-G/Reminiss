import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { verifyAccessToken } from "../utils/tokenService.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const { valid, expired, decoded } = verifyAccessToken(token);

    if (!valid) {
      if (expired) {
        throw new ApiError(401, "Access token has expired", true);
      }
      throw new ApiError(401, "Invalid access token");
    }

    let user;
    
    // Check if it's an admin token
    if (decoded.role) {
      user = await Admin.findById(decoded._id).select("-password");
      if (!user) {
        throw new ApiError(401, "Invalid Admin Access Token");
      }
      req.admin = user;
    } else {
      // It's a user token
      user = await User.findById(decoded._id).select("-password");
      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
      req.user = user;
    }

    next();
  } catch (error) {
    // Add a flag to the error if it's a token expiration error
    if (error.message === "Access token has expired") {
      error.tokenExpired = true;
    }
    next(error);
  }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.admin) {
    throw new ApiError(403, "Admin access required");
  }
  next();
});

export const isSuperAdmin = asyncHandler(async (req, res, next) => {
  if (!req.admin || req.admin.role !== "superadmin") {
    throw new ApiError(403, "Super Admin access required");
  }
  next();
}); 