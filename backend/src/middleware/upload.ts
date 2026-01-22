import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { generateId, sanitizeFilename } from '../utils/crypto';

const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-photos');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (
    _req: Express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const safeName = sanitizeFilename(file.originalname);
    const safeExtension = path.extname(safeName) || '.jpg';
    cb(null, `${generateId('photo_')}${safeExtension}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Invalid file type'));
    return;
  }
  cb(null, true);
};

export const profilePhotoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
