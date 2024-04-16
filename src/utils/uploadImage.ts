import { v2 as cloudinary } from 'cloudinary';

import env from './cleanEnv';
cloudinary.config({
   cloud_name: env.CLOUDINARY_CLOUD_NAME,
   api_key: env.CLOUDINARY_API_KEY,
   api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: Express.Multer.File) => {
   const image = file;
   const base64Image = Buffer.from(image.buffer).toString('base64');
   const dataURI = `data:${image.mimetype};base64,${base64Image}`;
   const uploadResponse = await cloudinary.uploader.upload(dataURI);
   return uploadResponse.url;
};
