import { Dropbox } from 'dropbox';
import { readFile } from 'fs/promises';
import { unlink } from 'fs/promises';

// Initialize Dropbox client
const dbx = new Dropbox({ 
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  clientId: process.env.DROPBOX_APP_KEY,
  clientSecret: process.env.DROPBOX_APP_SECRET
});

export const uploadToDropbox = async (filePath, fileName) => {
  try {
    // Read file content
    const fileContent = await readFile(filePath);
    
    // Upload file to Dropbox
    const result = await dbx.filesUpload({
      path: `/proposals/${fileName}`,
      contents: fileContent,
      mode: { '.tag': 'add' },
      autorename: true
    });

    // Create a shared link with view-only access
    const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
      path: result.result.path_display,
      settings: {
        requested_visibility: { '.tag': 'public' },
        audience: { '.tag': 'public' },
        access: { '.tag': 'viewer' }
      }
    });

    // Convert the shared link to a direct download link
    // Replace 'www.dropbox.com' with 'dl.dropboxusercontent.com' for direct download
    const directLink = sharedLink.result.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

    // Delete local file after successful upload
    await unlink(filePath);

    return {
      url: directLink,
      path: result.result.path_display,
      id: result.result.id
    };
  } catch (error) {
    // Clean up local file if upload fails
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting local file:', unlinkError);
    }
    
    console.error('Dropbox upload error:', error);
    throw new Error(`Failed to upload file to Dropbox: ${error.message}`);
  }
};

export const deleteFromDropbox = async (filePath) => {
  try {
    await dbx.filesDeleteV2({
      path: filePath
    });
  } catch (error) {
    console.error('Error deleting file from Dropbox:', error);
    throw new Error(`Failed to delete file from Dropbox: ${error.message}`);
  }
};

// Optional: Refresh access token if needed
export const refreshAccessToken = async () => {
  try {
    const response = await dbx.refreshAccessToken();
    // Update the access token
    dbx.setAccessToken(response.result.access_token);
    return response.result.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}; 