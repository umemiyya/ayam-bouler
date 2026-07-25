export type UserRole = 'admin' | 'user';

export interface NotionUserRecord {
  id: string; // Notion page id
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface SessionPayload {
  sub: string; // Notion page id
  username: string;
  role: UserRole;
  createdAt: string;
}