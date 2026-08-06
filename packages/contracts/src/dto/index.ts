import type { UserRole, UserType } from '../permissions/index.js';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  userType: UserType;
  avatarUrl?: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthSession {
  user: UserProfile;
  tokens: SessionTokens;
}

export interface MeResponse {
  user: UserProfile;
  capabilities: string[];
}
