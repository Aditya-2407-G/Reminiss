import { Admin } from "../models/admin.model.js";
import { Batch } from "../models/batch.model.js";
import { Entry } from "../models/entry.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { readEnrollmentNumbers } from "../utils/excel.js";
import fs from "fs";
import { College } from "../models/college.model.js";
import { 
  generateAccessToken, 
  generateRefreshToken,
  invalidateAllUserTokens 
} from "../utils/tokenService.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(409, "Admin with this email already exists");
  }

  // Check if this is the first admin
  const adminCount = await Admin.countDocuments();
  const isFirstAdmin = adminCount === 0;

  // Only allow super admins to create new admins, except for the first admin
  if (!isFirstAdmin && req.admin && req.admin.role !== "superadmin") {
    throw new ApiError(403, "Only super admins can create new admins");
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role: isFirstAdmin ? "superadmin" : "admin", // First admin becomes superadmin
    createdBy: req.admin?._id,
  });

  const createdAdmin = await Admin.findById(admin._id).select("-password");

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering the admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin registered successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate tokens
  const accessToken = generateAccessToken(admin._id, admin.role);
  const refreshToken = await generateRefreshToken(admin._id, "Admin");

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
          admin: { ...admin._doc, password: undefined }, 
          accessToken,
          refreshToken 
        },
        "Admin logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  // Get the refresh token from cookies
  const refreshToken = req.cookies?.refreshToken;
  
  // If refresh token exists, invalidate it
  if (refreshToken) {
    await invalidateAllUserTokens(req.admin._id, "Admin");
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
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const createBatch = asyncHandler(async (req, res) => {
  const { batchYear, collegeId, degree } = req.body;
  const excelFile = req.files?.excel;

  if (!batchYear || !collegeId || !degree) {
    throw new ApiError(400, "Batch year, college, and degree are required");
  }

  if (!excelFile) {
    throw new ApiError(400, "Excel file is required");
  }

  // Validate file type
  const fileType = excelFile.mimetype;
  if (!fileType.includes('spreadsheet') && !fileType.includes('excel')) {
    throw new ApiError(400, "Please upload a valid Excel file (.xlsx, .xls)");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (excelFile.size > maxSize) {
    throw new ApiError(400, "Excel file size should be less than 5MB");
  }

  // Check if college exists and has the specified degree
  const college = await College.findById(collegeId);
  if (!college) {
    throw new ApiError(404, "College not found");
  }

  const degreeExists = college.degrees.some(d => d.name === degree);
  if (!degreeExists) {
    throw new ApiError(400, "Specified degree is not offered by this college");
  }

  // Check if batch already exists for this college and degree
  const existingBatch = await Batch.findOne({
    batchYear,
    college: collegeId,
    degree,
  });

  if (existingBatch) {
    throw new ApiError(409, "A batch for this year, college, and degree already exists");
  }

  try {
    // Read enrollment numbers from Excel
    const enrollmentNumbers = readEnrollmentNumbers(excelFile);

    if (!enrollmentNumbers.length) {
      throw new ApiError(400, "No enrollment numbers found in Excel file");
    }

    // Generate a unique batch code
    const batchCode = Batch.generateBatchCode();

    const batch = await Batch.create({
      batchYear,
      batchCode,
      college: collegeId,
      degree,
      enrollmentNumbers,
      createdBy: req.admin._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, batch, "Batch created successfully"));
  } catch (error) {
    // Clean up the temporary file if it exists
    if (excelFile.tempFilePath) {
      try {
        await fs.unlink(excelFile.tempFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
    throw error;
  }
});

const getBatchDetails = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, batch, "Batch details fetched successfully"));
});

const getBatchEntries = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const batch = await Batch.findById(batchId);

  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  const entries = await Entry.find({ batch: batchId })
    .populate("user", "name enrollmentNumber profilePicture")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, entries, "Batch entries fetched successfully")
    );
});

const removeEntry = asyncHandler(async (req, res) => {
  const { entryId } = req.params;

  const entry = await Entry.findById(entryId);

  if (!entry) {
    throw new ApiError(404, "Entry not found");
  }

  await Entry.findByIdAndDelete(entryId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Entry removed successfully"));
});

export {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  createBatch,
  getBatchDetails,
  getBatchEntries,
  removeEntry,
}; 