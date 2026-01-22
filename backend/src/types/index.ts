export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  age?: number;
  bio: string;
  profile_photo?: string | null;
  created_at: Date;
  last_active: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  age?: number;
  bio: string;
  profile_photo?: string | null;
  created_at: Date;
  last_active: Date;
}

export interface Match {
  id: string;
  user_id_1: string;
  user_id_2: string;
  created_at: Date;
  status: 'active' | 'archived' | 'blocked';
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: Date;
  last_message_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: Date;
}

export interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: Date;
}

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
  age?: number;
  bio?: string;
  profilePhoto?: string | null;
}

export interface RegisterFormData {
  email?: string;
  password?: string;
  name?: string;
  age?: string | number;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
