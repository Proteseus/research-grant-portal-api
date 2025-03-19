import formidable from 'formidable';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const parseProposalForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: 'uploads',
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part, form) => {
        const originalName = path.basename(part.originalFilename, path.extname(part.originalFilename));
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${originalName}-${day}-${month}-${year}${path.extname(part.originalFilename)}`;
      },
      filter: ({ mimetype }) => {
        // Allow only PDF files
        return mimetype === 'application/pdf';
      }
    });

    form.parse(req, (err, fields, files) => {
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

      resolve({
        fields,
        file: files.document
      });
    });
  });
};

export const getFileUrl = (filename) => {
  return `/uploads/${filename}`;
};