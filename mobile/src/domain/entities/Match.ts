/**
 * Match entity
 * Represents a mutual like between two users
 */
export interface Match {
  id: string;
  userIds: [string, string];
  createdAt: Date;
  conversationId?: string;
  status: MatchStatus;
}

export enum MatchStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

/**
 * Like entity
 * Represents a user liking another user's profile
 */
export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
}

/**
 * Discovery profile
 * A lightweight version of profile for discovery screen
 */
export interface DiscoveryProfile {
  userId: string;
  name: string;
  age?: number;
  bio: string;
  previewPhoto?: string; // Only one blurred or low-res preview
}
