import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}_${random}`;
};

export const sanitizeFilename = (filename: string): string => {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safeName.length > 0 ? safeName : 'photo.jpg';
};
