import * as dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { UploadedFile } from 'express-fileupload';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = async (file: UploadedFile) => {
  const image = await cloudinary.v2.uploader.upload(
    file.tempFilePath,
    { folder: 'EAII-Products' },
    (result) => result
  );
  return image;
};

export { upload };
