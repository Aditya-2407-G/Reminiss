import jwt from "jsonwebtoken";
import { Token } from "../models/token.model.js";
import crypto from "crypto";

// Generate access token with shorter expiry
const generateAccessToken = (userId, userRole = null, expiresIn = process.env.ACCESS_TOKEN_EXPIRY || "1h") => {
  return jwt.sign(
    { _id: userId, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Generate refresh token with longer expiry
const generateRefreshToken = async (userId, userModel) => {
  // Create a random token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  
  // Calculate expiry date (15 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);
  
  // Save the refresh token in the database
  await Token.create({
    userId,
    userModel,
    token: refreshToken,
    expiresAt,
  });
  
  return refreshToken;
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, expired: false, decoded };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === "TokenExpiredError",
      decoded: null,
    };
  }
};

// Find and verify a refresh token
const verifyRefreshToken = async (token) => {
  const refreshToken = await Token.findOne({
    token,
    isValid: true,
    expiresAt: { $gt: new Date() },
  });
  
  return refreshToken;
};

// Invalidate a refresh token
const invalidateRefreshToken = async (token) => {
  await Token.updateOne(
    { token },
    { isValid: false }
  );
};

// Invalidate all refresh tokens for a user
const invalidateAllUserTokens = async (userId, userModel) => {
  await Token.updateMany(
    { userId, userModel },
    { isValid: false }
  );
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  invalidateRefreshToken,
  invalidateAllUserTokens,
}; 