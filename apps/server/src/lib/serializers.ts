import type { Prisma } from "@prisma/client";

type UserRecord = Prisma.UserGetPayload<{}>;
type ChatRecord = Prisma.ChatGetPayload<{}>;
type MessageRecord = Prisma.MessageGetPayload<{}>;
type StoryRecord = Prisma.StoryGetPayload<{}>;
type MemoryRecord = Prisma.MemoryGetPayload<{}>;
type FriendshipRecord = Prisma.FriendshipGetPayload<{}>;
type NotificationRecord = Prisma.NotificationGetPayload<{}>;
type AiConversationRecord = Prisma.AiConversationGetPayload<{}>;
type LocationPingRecord = Pick<Prisma.LocationPingGetPayload<{}>, "lat" | "lng" | "createdAt">;

type MessageReaction = Pick<Prisma.ReactionGetPayload<{}>, "emoji" | "userId">;

type MessageReceipt = Pick<Prisma.MessageReceiptGetPayload<{}>, "userId" | "deliveredAt" | "readAt">;

type MessageWithRelations = Pick<
  MessageRecord,
  "id" | "chatId" | "senderId" | "content" | "mediaUrl" | "mediaType" | "ephemeralSeconds" | "createdAt" | "updatedAt" | "replyToId"
> & {
  reactions?: MessageReaction[];
  receipts?: MessageReceipt[];
};

type ChatParticipantWithUser = {
  user: Pick<UserRecord, "id">;
};

type ChatWithRelations = Pick<ChatRecord, "id" | "title" | "pinnedAt"> & {
  participants?: ChatParticipantWithUser[];
  messages?: MessageWithRelations[];
};

export function serializeUser(user: UserRecord, extras: Partial<{ friendsCount: number; isOnline: boolean }> = {}) {
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
    theme: user.theme === "light" ? "light" : "dark",
    publicProfile: user.publicProfile,
    isGhostMode: user.isGhostMode,
    pushNotificationsEnabled: user.pushNotificationsEnabled ?? true,
    autoSaveEchoes: user.autoSaveEchoes ?? true,
    flames: user.flames,
    yowlScore: user.yowlScore,
    friendsCount: extras.friendsCount ?? 0,
    isOnline: extras.isOnline ?? false,
    links: []
  };
}

export function serializeMessage(message: MessageWithRelations) {
  const reactions = message.reactions ?? [];
  const receipts = message.receipts ?? [];

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
    reactions: reactions.map((reaction: MessageReaction) => ({
      emoji: reaction.emoji,
      userId: reaction.userId
    })),
    receipts: receipts.reduce<Record<string, { deliveredAt: string | null; readAt: string | null }>>(
      (accumulator, receipt: MessageReceipt) => {
        accumulator[receipt.userId] = {
          deliveredAt: receipt.deliveredAt?.toISOString() ?? null,
          readAt: receipt.readAt?.toISOString() ?? null
        };
        return accumulator;
      },
      {}
    )
  };
}

export function serializeChat(chat: ChatWithRelations) {
  const participantIds = chat.participants?.map((participant: ChatParticipantWithUser) => participant.user.id) ?? [];
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

export function serializeStory(story: StoryRecord) {
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

export function serializeMemory(memory: MemoryRecord) {
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

export function serializeFriendship(friendship: FriendshipRecord) {
  return {
    id: friendship.id,
    requesterId: friendship.requesterId,
    addresseeId: friendship.addresseeId,
    status: friendship.status,
    createdAt: friendship.createdAt.toISOString()
  };
}

export function serializeNotification(notification: NotificationRecord) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt.toISOString(),
    seen: notification.seen
  };
}

export function serializeAiConversation(conversation: AiConversationRecord) {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString()
  };
}

export function serializeLocationPing(ping: LocationPingRecord, user: UserRecord) {
  return {
    user: serializeUser(user),
    lat: ping.lat,
    lng: ping.lng,
    lastSeen: ping.createdAt.toISOString()
  };
}
