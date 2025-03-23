import formidable from 'formidable';
import { uploadToDropbox } from './dropboxHandler.js';

export const parseProposalForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
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
        // Upload file to Dropbox
        const dropboxResult = await uploadToDropbox(
          files.document[0].filepath,
          `${files.document[0].originalFilename.replace(/\.pdf$/i, '')}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`
        );
        
        resolve({
          fields,
          file: {
            ...files.document,
            url: dropboxResult.url,
            path: dropboxResult.path,
            id: dropboxResult.id
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