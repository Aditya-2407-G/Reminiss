import { v2 as cloudinary } from "cloudinary";
import { uploadToGoogleDrive } from "./googleDrive.js";
import axios from "axios";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transformAndUpload = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    // Upload to Cloudinary for transformation
    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      transformation: [
        { width: 800, height: 1000, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    
    // Download the transformed image using axios
    const transformedImageResponse = await axios({
      method: 'get',
      url: cloudinaryResponse.secure_url,
      responseType: 'arraybuffer'
    });
    
    // Upload to Google Drive
    const driveFileUrl = await uploadToGoogleDrive(
      Buffer.from(transformedImageResponse.data),
      `yearbook_${Date.now()}.jpg`,
      'image/jpeg'
    );

    // Delete the image from Cloudinary after getting transformed version
    await cloudinary.uploader.destroy(cloudinaryResponse.public_id);
    
    return driveFileUrl;
  } catch (error) {
    console.error("Error in transform and upload:", error);
    return null;
  }
};

export { transformAndUpload }; 
