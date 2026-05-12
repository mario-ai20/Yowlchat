import type { Chat, Message, Story, User, Memory, Friendship, Notification, AiConversation, LocationPing } from "@prisma/client";

type MessageWithRelations = Message & {
  reactions?: Array<{ emoji: string; userId: string }>;
  receipts?: Array<{
    userId: string;
    deliveredAt: Date | null;
    readAt: Date | null;
  }>;
};

export function serializeUser(user: User, extras: Partial<{ friendsCount: number; isOnline: boolean }> = {}) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate?.toISOString() ?? null,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    location: user.location,
    theme: (user as User & { theme?: string }).theme === "light" ? "light" : "dark",
    publicProfile: user.publicProfile,
    isGhostMode: user.isGhostMode,
    pushNotificationsEnabled: (user as User & { pushNotificationsEnabled?: boolean }).pushNotificationsEnabled ?? true,
    autoSaveEchoes: (user as User & { autoSaveEchoes?: boolean }).autoSaveEchoes ?? true,
    flames: user.flames,
    yowlScore: user.yowlScore,
    friendsCount: extras.friendsCount ?? 0,
    isOnline: extras.isOnline ?? false,
    links: []
  };
}

export function serializeMessage(message: MessageWithRelations) {
  return {
    id: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.content,
    mediaUrl: message.mediaUrl,
    mediaType: (message.mediaType as "image" | "video" | "voice" | null) ?? null,
    ephemeralSeconds: message.ephemeralSeconds,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    replyToId: message.replyToId,
    reactions: message.reactions?.map((reaction) => ({
      emoji: reaction.emoji,
      userId: reaction.userId
    })) ?? [],
    receipts:
      message.receipts?.reduce<Record<string, { deliveredAt: string | null; readAt: string | null }>>(
        (accumulator, receipt) => {
          accumulator[receipt.userId] = {
            deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
            readAt: receipt.readAt?.toISOString() ?? null
          };
          return accumulator;
        },
        {}
      ) ?? {}
  };
}

export function serializeChat(chat: Chat & { participants?: Array<{ user: User }>; messages?: MessageWithRelations[] }) {
  const participantIds = chat.participants?.map((participant) => participant.user.id) ?? [];
  const lastMessage = chat.messages?.[0] ? serializeMessage(chat.messages[0]) : null;
  return {
    id: chat.id,
    title: chat.title,
    participantIds,
    pinned: Boolean(chat.pinnedAt),
    unreadCount: 0,
    lastMessage,
    isStreakActive: false,
    flameCount: 0,
    typingUsers: []
  };
}

export function serializeStory(story: Story) {
  return {
    id: story.id,
    authorId: story.authorId,
    mediaUrl: story.mediaUrl,
    mediaType: story.mediaType as "image" | "video",
    caption: story.caption,
    expiresAt: story.expiresAt.toISOString(),
    viewers: [],
    reactions: []
  };
}

export function serializeMemory(memory: Memory) {
  return {
    id: memory.id,
    title: memory.title,
    mediaUrl: memory.mediaUrl,
    folder: memory.folder,
    favorite: memory.favorite,
    isPrivate: memory.isPrivate,
    createdAt: memory.createdAt.toISOString()
  };
}

export function serializeFriendship(friendship: Friendship) {
  return {
    id: friendship.id,
    requesterId: friendship.requesterId,
    addresseeId: friendship.addresseeId,
    status: friendship.status,
    createdAt: friendship.createdAt.toISOString()
  };
}

export function serializeNotification(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt.toISOString(),
    seen: notification.seen
  };
}

export function serializeAiConversation(conversation: AiConversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString()
  };
}

export function serializeLocationPing(ping: LocationPing, user: User) {
  return {
    user: serializeUser(user),
    lat: ping.lat,
    lng: ping.lng,
    lastSeen: ping.createdAt.toISOString()
  };
}
