import { cleanEnv, port, str, url } from 'envalid';

export default cleanEnv(process.env, {
   PORT: port(),
   MONGO_URI: str(),
   ACCESS_TOKEN_SECRET: str(),
   REFRESH_TOKEN_SECRET: str(),
   GOOGLE_CLIENT_ID: str(),
   GOOGLE_CLIENT_SECRET: str(),
   GOOGLE_REDIRECT_URL: url(),
   GITHUB_CLIENT_ID: str(),
   GITHUB_CLIENT_SECRET: str(),
   MAILTRAP_USER: str(),
   MAILTRAP_PASSWORD: str(),
   CLOUDINARY_CLOUD_NAME: str(),
   CLOUDINARY_API_KEY: str(),
   CLOUDINARY_API_SECRET: str(),
   CLIENT_URL: url(),
});
