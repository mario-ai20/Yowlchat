export type ID = string;

export interface ProfileLink {
  label: string;
  href: string;
}

export interface YowlUser {
  id: ID;
  username: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  phoneNumber?: string | null;
  gender?: "man" | "vrouw" | "geen_van_beide" | null;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  theme: "light" | "dark";
  publicProfile: boolean;
  flames: number;
  yowlScore: number;
  pushNotificationsEnabled: boolean;
  autoSaveEchoes: boolean;
  friendsCount: number;
  isOnline: boolean;
  isGhostMode: boolean;
  links: ProfileLink[];
}

export interface MessageReceipt {
  deliveredAt?: string | null;
  readAt?: string | null;
}

export interface YowlMessage {
  id: ID;
  chatId: ID;
  senderId: ID;
  content: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | "voice" | null;
  ephemeralSeconds?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  reactions: Array<{ emoji: string; userId: ID }>;
  receipts: Record<ID, MessageReceipt>;
  replyToId?: ID | null;
}

export interface YowlChat {
  id: ID;
  title: string;
  participantIds: ID[];
  pinned: boolean;
  unreadCount: number;
  lastMessage?: YowlMessage | null;
  isStreakActive: boolean;
  flameCount: number;
  typingUsers: ID[];
}

export interface HowlStory {
  id: ID;
  authorId: ID;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  expiresAt: string;
  viewers: ID[];
  reactions: Array<{ emoji: string; userId: ID }>;
}

export interface EchoMemory {
  id: ID;
  title: string;
  mediaUrl: string;
  folder: string;
  favorite: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface YowlMapFriend {
  user: YowlUser;
  lat: number;
  lng: number;
  lastSeen: string;
}

export interface AiConversationMessage {
  id: ID;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  id: ID;
  type: "message" | "friend_request" | "howl_view" | "map_ping" | "ai";
  title: string;
  body: string;
  createdAt: string;
  seen: boolean;
}
