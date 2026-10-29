import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handler, parseBody, requireUser, ApiError } from '@/lib/api';
import { isCloudinaryConfigured, signUpload, UPLOAD_FOLDERS } from '@/lib/cloudinary';

const STUDENT_FOLDERS = ['submissions', 'avatars'];

export const POST = handler(async (req) => {
  const user = await requireUser();
  const { folder } = await parseBody(req, z.object({ folder: z.enum(UPLOAD_FOLDERS) }));
  if (user.role !== 'ADMIN' && !STUDENT_FOLDERS.includes(folder)) throw new ApiError(403, 'Forbidden');
  if (!isCloudinaryConfigured()) throw new ApiError(503, 'File uploads are not configured (missing Cloudinary env vars)');
  return NextResponse.json(signUpload(folder));
});
