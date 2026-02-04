/**
 * User entity
 * Represents a user in the dating application
 */
export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  bio: string;
  citySlug: string;
  cityName?: string;
  cityLatitude?: number;
  cityLongitude?: number;
  cityDepartmentCode?: string;
  gender: 'male' | 'female';
  lookingFor: Array<'male' | 'female'>;
  profilePhotoUrl?: string;
  profilePhoto?: ProfilePhotoAsset;
  photos: Photo[];
  createdAt: Date;
  lastActive: Date;
}

export interface ProfilePhotoAsset {
  uri?: string;
  fileName?: string;
  type?: string;
}

/**
 * Photo entity with progressive reveal
 */
export interface Photo {
  id: string;
  url: string;
  isRevealed: boolean;
  revealedAt?: Date;
  order: number;
}

/**
 * Profile represents the public-facing user information
 */
export interface Profile {
  userId: string;
  name: string;
  age?: number;
  bio: string;
  profilePhotoUrl?: string;
  photos: Photo[];
  revealProgress: RevealProgress;
}

/**
 * Tracks the progress of content reveal between users
 */
export interface RevealProgress {
  photosRevealed: number;
  totalPhotos: number;
  messagesSent: number;
  messagesRequired: number;
}
