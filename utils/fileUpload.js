import formidable from 'formidable';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary } from './cloudinaryHandler.js';

export const parseProposalForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: 'uploads',
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext) => `${uuidv4()}${ext}`,
      filter: ({ mimetype }) => {
        // Allow only PDF files
        return mimetype === 'application/pdf';
      }
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return reject(err);
      }

      // Validate required fields
      const requiredFields = ['title', 'abstract', 'callId'];
      const missingFields = requiredFields.filter(field => !fields[field]);
      
      if (missingFields.length > 0) {
        return reject(new Error(`Missing required fields: ${missingFields.join(', ')}`));
      }

      // Validate file
      if (!files.document) {
        return reject(new Error('Document file is required'));
      }

      try {
        // Upload file to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(files.document[0].filepath);
        
        resolve({
          fields,
          file: {
            ...files.document,
            url: cloudinaryResult.url,
            publicId: cloudinaryResult.secure_url
          }
        });
      } catch (uploadError) {
        reject(uploadError);
      }
    });
  });
};

export const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};