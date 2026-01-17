/**
 * Configuration for JWT authentication
 */

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('⚠️  JWT_SECRET not set, using default (NOT SAFE FOR PRODUCTION)');
}

export const config = {
  jwtSecret: JWT_SECRET || 'your-secret-key-change-this-in-production',
  jwtExpiresIn: '30d',
};
