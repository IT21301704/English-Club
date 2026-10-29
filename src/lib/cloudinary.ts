import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const UPLOAD_FOLDERS = ['lessons', 'thumbnails', 'submissions', 'avatars', 'invoices'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function isCloudinaryConfigured() {
  return !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/** Signs a direct browser → Cloudinary upload so files never pass through our API routes. */
export function signUpload(folder: UploadFolder) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: `lms/${folder}` };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}
