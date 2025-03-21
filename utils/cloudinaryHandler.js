import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'fs/promises';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (filePath, folder = 'researcher/proposals') => {
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
      flags: 'attachment',
      format: 'pdf',
      type: 'private'
    });

    // Delete the local file after successful upload
    await unlink(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      secure_url: result.secure_url
    };
  } catch (error) {
    // Delete the local file if upload fails
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }
    
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
}; 