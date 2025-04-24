import { google } from 'googleapis';
import stream from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

const uploadToGoogleDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    // Create a folder if GOOGLE_DRIVE_FOLDER_ID is not set or folder is not accessible
    let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    try {
      if (!folderId) {
        throw new Error('No folder ID');
      }
      await drive.files.get({
        fileId: folderId,
        fields: 'id, name'
      });
    } catch (folderError) {
      // Create new folder
      const folderMetadata = {
        name: 'ReminissUploads',
        mimeType: 'application/vnd.google-apps.folder'
      };
      
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });
      
      folderId = folder.data.id;
      
      // Make folder publicly accessible
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
      
      console.log('Created new folder with ID:', folderId);
    }

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType,
      body: bufferStream
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const fileUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
    return fileUrl;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

export { uploadToGoogleDrive };

