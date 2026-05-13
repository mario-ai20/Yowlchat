type BaseRecord = { id: string; createdAt: Date; updatedAt: Date };

type UserRecord = BaseRecord & {
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: Date | null;
  phoneNumber: string | null;
  gender: string | null;
  displayName: string;
  passwordHash: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  locale: string;
  publicProfile: boolean;
  isGhostMode: boolean;
  emailVerifiedAt: Date | null;
  verificationCodeHash: string | null;
  verificationCodeExpiresAt: Date | null;
  verificationCodeSentAt: Date | null;
  resetCodeHash: string | null;
  resetCodeExpiresAt: Date | null;
  resetCodeSentAt: Date | null;
  flames: number;
  yowlScore: number;
  lastSeenAt: Date | null;
};

type SessionRecord = BaseRecord & {
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  revokedAt: Date | null;
};

type ChatRecord = BaseRecord & {
  title: string;
  isGroup: boolean;
  isArchived: boolean;
  pinnedAt: Date | null;
};

type ChatParticipantRecord = BaseRecord & {
  chatId: string;
  userId: string;
  unreadCount: number;
  lastReadAt: Date | null;
  isTyping: boolean;
  isMuted: boolean;
};

type MessageRecord = BaseRecord & {
  chatId: string;
  senderId: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  ephemeralSeconds: number | null;
  replyToId: string | null;
  deletedAt: Date | null;
};

type MessageReceiptRecord = BaseRecord & {
  messageId: string;
  userId: string;
  deliveredAt: Date | null;
  readAt: Date | null;
};

type StoryRecord = BaseRecord & {
  authorId: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  expiresAt: Date;
};

type StoryViewRecord = BaseRecord & {
  storyId: string;
  userId: string;
  viewedAt: Date;
};

type FriendshipRecord = BaseRecord & {
  requesterId: string;
  addresseeId: string;
  status: string;
};

type MemoryRecord = BaseRecord & {
  userId: string;
  title: string;
  mediaUrl: string;
  folder: string;
  favorite: boolean;
  isPrivate: boolean;
};

type ReactionRecord = BaseRecord & {
  emoji: string;
  userId: string;
  messageId: string | null;
  storyId: string | null;
};

type NotificationRecord = BaseRecord & {
  userId: string;
  type: string;
  title: string;
  body: string;
  seen: boolean;
};

type AiConversationRecord = BaseRecord & {
  userId: string;
  title: string;
};

type AiMessageRecord = BaseRecord & {
  conversationId: string;
  role: string;
  content: string;
};

type LocationPingRecord = BaseRecord & {
  userId: string;
  lat: number;
  lng: number;
  ghostMode: boolean;
};

type Seed = {
  users: UserRecord[];
  sessions: SessionRecord[];
  chats: ChatRecord[];
  chatParticipants: ChatParticipantRecord[];
  messages: MessageRecord[];
  messageReceipts: MessageReceiptRecord[];
  stories: StoryRecord[];
  storyViews: StoryViewRecord[];
  friendships: FriendshipRecord[];
  memories: MemoryRecord[];
  reactions: ReactionRecord[];
  notifications: NotificationRecord[];
  aiConversations: AiConversationRecord[];
  aiMessages: AiMessageRecord[];
  locationPings: LocationPingRecord[];
};

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date();
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function applyOrder<T extends Record<string, any>>(items: T[], orderBy?: Array<Record<string, "asc" | "desc">>) {
  if (!orderBy?.length) return items;
  return [...items].sort((left, right) => {
    for (const order of orderBy) {
      const [key, direction] = Object.entries(order)[0] as [keyof T, "asc" | "desc"];
      const a = left[key];
      const b = right[key];
      if (a === b) continue;
      if (a == null) return direction === "asc" ? -1 : 1;
      if (b == null) return direction === "asc" ? 1 : -1;
      if (a < b) return direction === "asc" ? -1 : 1;
      if (a > b) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}

function includesParticipant(chatId: string, userId: string, participants: ChatParticipantRecord[]) {
  return participants.some((participant) => participant.chatId === chatId && participant.userId === userId);
}

function matchesUserWhere(user: UserRecord, where: any) {
  if (!where) return true;
  if (where.id?.notIn && where.id.notIn.includes(user.id)) return false;
  if (where.id?.not === user.id) return false;
  if (where.id && typeof where.id === "string" && where.id !== user.id) return false;
  if (where.email && where.email !== user.email) return false;
  if (where.username && where.username !== user.username) return false;
  if (where.OR?.length) {
    return where.OR.some((branch: any) => matchesUserWhere(user, branch));
  }
  return true;
}

function matchesChatWhere(chat: ChatRecord, where: any, participants: ChatParticipantRecord[]) {
  if (!where) return true;
  if (where.pinnedAt?.not && chat.pinnedAt === where.pinnedAt.not) return false;
  if (where.pinnedAt?.equals && chat.pinnedAt?.getTime() !== where.pinnedAt.equals.getTime()) return false;
  if (where.participants?.some?.userId) {
    return includesParticipant(chat.id, where.participants.some.userId, participants);
  }
  return true;
}

function matchesMessageWhere(message: MessageRecord, where: any) {
  if (!where) return true;
  if (where.chatId && where.chatId !== message.chatId) return false;
  if (where.deletedAt === null && message.deletedAt !== null) return false;
  return true;
}

function matchesStoryWhere(story: StoryRecord, where: any) {
  if (!where) return true;
  if (where.authorId && where.authorId !== story.authorId) return false;
  if (where.expiresAt?.gt && !(story.expiresAt > where.expiresAt.gt)) return false;
  if (where.id && where.id !== story.id) return false;
  return true;
}

function matchesFriendshipWhere(friendship: FriendshipRecord, where: any) {
  if (!where) return true;
  if (where.id && friendship.id !== where.id) return false;
  if (where.requesterId && friendship.requesterId !== where.requesterId) return false;
  if (where.addresseeId && friendship.addresseeId !== where.addresseeId) return false;
  if (where.status && friendship.status !== where.status) return false;
  if (where.OR?.length) {
    return where.OR.some((branch: any) => matchesFriendshipWhere(friendship, branch));
  }
  return true;
}

function matchesMemoryWhere(memory: MemoryRecord, where: any) {
  if (!where) return true;
  if (where.userId && memory.userId !== where.userId) return false;
  return true;
}

function matchesLocationWhere(ping: LocationPingRecord, where: any) {
  if (!where) return true;
  if (where.userId && ping.userId !== where.userId) return false;
  return true;
}

function matchesStoryViewWhere(view: StoryViewRecord, where: any) {
  if (!where) return true;
  if (where.storyId && view.storyId !== where.storyId) return false;
  if (where.userId && view.userId !== where.userId) return false;
  return true;
}

function matchesReactionWhere(reaction: ReactionRecord, where: any) {
  if (!where) return true;
  if (where.storyId && reaction.storyId !== where.storyId) return false;
  if (where.messageId && reaction.messageId !== where.messageId) return false;
  if (where.userId && reaction.userId !== where.userId) return false;
  return true;
}

function enrichMessage(message: MessageRecord, seed: Seed) {
  const receipts = seed.messageReceipts.filter((receipt) => receipt.messageId === message.id);
  const reactions = seed.reactions.filter((reaction) => reaction.messageId === message.id);
  return clone({ ...message, receipts, reactions });
}

function enrichChat(chat: ChatRecord, seed: Seed, options: { messagesTake?: number } = {}) {
  const participants = seed.chatParticipants
    .filter((participant) => participant.chatId === chat.id)
    .map((participant) => ({
      ...participant,
      user: seed.users.find((user) => user.id === participant.userId)!
    }));
  const messages = seed.messages
    .filter((message) => message.chatId === chat.id)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, options.messagesTake ?? 1)
    .map((message) => enrichMessage(message, seed));

  return clone({ ...chat, participants, messages });
}

function enrichStory(story: StoryRecord, seed: Seed) {
  const author = seed.users.find((user) => user.id === story.authorId)!;
  return clone({ ...story, author });
}

function enrichLocationPing(ping: LocationPingRecord, seed: Seed) {
  const user = seed.users.find((entry) => entry.id === ping.userId)!;
  return clone({ ...ping, user });
}

function initialSeed(): Seed {
  return {
    users: [],
    sessions: [],
    chats: [],
    chatParticipants: [],
    messages: [],
    messageReceipts: [],
    stories: [],
    storyViews: [],
    friendships: [],
    memories: [],
    reactions: [],
    notifications: [],
    aiConversations: [],
    aiMessages: [],
    locationPings: []
  };
}

class MemoryPrisma {
  private seed: Seed = initialSeed();

  private touch<T extends { updatedAt: Date }>(record: T) {
    record.updatedAt = now();
    return record;
  }

  user = {
    findUnique: async (args: any) => {
      const { where } = args ?? {};
      const user = this.seed.users.find((entry) => {
        if (!where) return false;
        if (where.id && entry.id !== where.id) return false;
        if (where.email && entry.email !== where.email) return false;
        if (where.username && entry.username !== where.username) return false;
        return true;
      });
      return user ? clone(user) : null;
    },
    findUniqueOrThrow: async (args: any) => {
      const user = await this.user.findUnique(args);
      if (!user) throw new Error("User not found");
      return user;
    },
    findFirst: async (args: any) => {
      const where = args?.where;
      const user = this.seed.users.find((entry) => matchesUserWhere(entry, where));
      return user ? clone(user) : null;
    },
    findMany: async (args: any = {}) => {
      const where = args.where;
      let users = this.seed.users.filter((entry) => matchesUserWhere(entry, where));
      if (args.take) users = users.slice(0, args.take);
      return clone(users);
    },
    count: async (args: any = {}) => {
      const where = args.where;
      return this.seed.friendships.filter((entry) => matchesFriendshipWhere(entry, where)).length;
    },
    create: async (args: any) => {
      const record: UserRecord = {
        id: args.data.id ?? id("user"),
        email: args.data.email,
        username: args.data.username,
        firstName: args.data.firstName ?? null,
        lastName: args.data.lastName ?? null,
        birthDate: args.data.birthDate ?? null,
        phoneNumber: args.data.phoneNumber ?? null,
        gender: args.data.gender ?? null,
        displayName: args.data.displayName,
        passwordHash: args.data.passwordHash,
        avatarUrl: args.data.avatarUrl ?? null,
        bio: args.data.bio ?? null,
        location: args.data.location ?? null,
        locale: args.data.locale ?? "nl",
        publicProfile: args.data.publicProfile ?? true,
        isGhostMode: args.data.isGhostMode ?? false,
        emailVerifiedAt: args.data.emailVerifiedAt ?? null,
        verificationCodeHash: args.data.verificationCodeHash ?? null,
        verificationCodeExpiresAt: args.data.verificationCodeExpiresAt ?? null,
        verificationCodeSentAt: args.data.verificationCodeSentAt ?? null,
        resetCodeHash: args.data.resetCodeHash ?? null,
        resetCodeExpiresAt: args.data.resetCodeExpiresAt ?? null,
        resetCodeSentAt: args.data.resetCodeSentAt ?? null,
        flames: args.data.flames ?? 0,
        yowlScore: args.data.yowlScore ?? 0,
        lastSeenAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.users.push(record);
      return clone(record);
    },
    upsert: async (args: any) => {
      const record = this.seed.users.find((entry) => entry.id === args.where.id);
      if (record) {
        Object.assign(record, args.update);
        this.touch(record);
        return clone(record);
      }
      const created = await this.user.create({ data: { id: args.create.id, ...args.create } });
      return created;
    },
    update: async (args: any) => {
      const record = this.seed.users.find((entry) => entry.id === args.where.id);
      if (!record) throw new Error("User not found");
      Object.assign(record, args.data);
      this.touch(record);
      return clone(record);
    },
    delete: async (args: any) => {
      const index = this.seed.users.findIndex((entry) => entry.id === args.where.id);
      if (index === -1) throw new Error("User not found");
      const [deleted] = this.seed.users.splice(index, 1);
      return clone(deleted);
    }
  };

  session = {
    create: async (args: any) => {
      const record: SessionRecord = {
        id: id("sess"),
        userId: args.data.userId,
        refreshTokenHash: args.data.refreshTokenHash,
        userAgent: args.data.userAgent ?? null,
        ipAddress: args.data.ipAddress ?? null,
        revokedAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.sessions.push(record);
      return clone(record);
    },
    findUnique: async (args: any) => {
      const record = this.seed.sessions.find((entry) => entry.id === args.where.id);
      return record ? clone(record) : null;
    },
    update: async (args: any) => {
      const record = this.seed.sessions.find((entry) => entry.id === args.where.id);
      if (!record) throw new Error("Session not found");
      Object.assign(record, args.data);
      this.touch(record);
      return clone(record);
    },
    updateMany: async (args: any) => {
      this.seed.sessions.forEach((entry) => {
        if (args.where?.id && entry.id !== args.where.id) return;
        if (args.where?.userId && entry.userId !== args.where.userId) return;
        Object.assign(entry, args.data);
        this.touch(entry);
      });
      return { count: 1 };
    }
  };

  chat = {
    findMany: async (args: any = {}) => {
      const userId = args.where?.participants?.some?.userId;
      let chats = this.seed.chats.filter((chat) => matchesChatWhere(chat, args.where, this.seed.chatParticipants));
      if (userId) {
        chats = chats.filter((chat) => includesParticipant(chat.id, userId, this.seed.chatParticipants));
      }
      chats = applyOrder(chats, args.orderBy);
      if (args.include) {
        return chats.map((chat) => enrichChat(chat, this.seed, { messagesTake: args.include?.messages?.take ?? 1 }));
      }
      if (args.take) chats = chats.slice(0, args.take);
      return clone(chats);
    },
    create: async (args: any) => {
      const record: ChatRecord = {
        id: id("chat"),
        title: args.data.title,
        isGroup: args.data.isGroup ?? false,
        isArchived: args.data.isArchived ?? false,
        pinnedAt: args.data.pinnedAt ?? null,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.chats.push(record);
      return clone(record);
    }
  };

  chatParticipant = {
    findUnique: async (args: any) => {
      const { chatId_userId } = args.where;
      const record = this.seed.chatParticipants.find((entry) => entry.chatId === chatId_userId.chatId && entry.userId === chatId_userId.userId);
      return record ? clone(record) : null;
    },
    findMany: async (args: any = {}) => {
      let participants = this.seed.chatParticipants.filter((entry) => {
        if (args.where?.chatId && entry.chatId !== args.where.chatId) return false;
        if (args.where?.userId && entry.userId !== args.where.userId) return false;
        return true;
      });
      if (args.include?.user) {
        return participants.map((participant) => ({
          ...clone(participant),
          user: clone(this.seed.users.find((user) => user.id === participant.userId)!)
        }));
      }
      return clone(participants);
    },
    updateMany: async (args: any) => {
      let count = 0;
      this.seed.chatParticipants.forEach((entry) => {
        if (args.where?.chatId && entry.chatId !== args.where.chatId) return;
        if (args.where?.userId && entry.userId !== args.where.userId) return;
        Object.assign(entry, args.data);
        this.touch(entry);
        count += 1;
      });
      return { count };
    },
    create: async (args: any) => {
      const record: ChatParticipantRecord = {
        id: id("chatp"),
        chatId: args.data.chatId,
        userId: args.data.userId,
        unreadCount: args.data.unreadCount ?? 0,
        lastReadAt: args.data.lastReadAt ?? null,
        isTyping: args.data.isTyping ?? false,
        isMuted: args.data.isMuted ?? false,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.chatParticipants.push(record);
      return clone(record);
    }
  };

  message = {
    findMany: async (args: any = {}) => {
      let messages = this.seed.messages.filter((entry) => matchesMessageWhere(entry, args.where));
      messages = applyOrder(messages, args.orderBy);
      if (args.take) messages = messages.slice(0, args.take);
      if (args.include) {
        return messages.map((message) => enrichMessage(message, this.seed));
      }
      return clone(messages);
    },
    findUniqueOrThrow: async (args: any) => {
      const record = this.seed.messages.find((entry) => entry.id === args.where.id);
      if (!record) throw new Error("Message not found");
      return enrichMessage(record, this.seed);
    },
    create: async (args: any) => {
      const record: MessageRecord = {
        id: id("msg"),
        chatId: args.data.chatId,
        senderId: args.data.senderId,
        content: args.data.content,
        mediaUrl: args.data.mediaUrl ?? null,
        mediaType: args.data.mediaType ?? null,
        ephemeralSeconds: args.data.ephemeralSeconds ?? null,
        replyToId: args.data.replyToId ?? null,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.messages.push(record);
      return enrichMessage(record, this.seed);
    }
  };

  messageReceipt = {
    createMany: async (args: any) => {
      args.data.forEach((item: any) => {
        this.seed.messageReceipts.push({
          id: id("rcpt"),
          messageId: item.messageId,
          userId: item.userId,
          deliveredAt: item.deliveredAt ?? null,
          readAt: item.readAt ?? null,
          createdAt: now(),
          updatedAt: now()
        });
      });
      return { count: args.data.length };
    },
    upsert: async (args: any) => {
      const existing = this.seed.messageReceipts.find((entry) => entry.messageId === args.where.messageId_userId.messageId && entry.userId === args.where.messageId_userId.userId);
      if (existing) {
        Object.assign(existing, args.update);
        this.touch(existing);
        return clone(existing);
      }
      const record: MessageReceiptRecord = {
        id: id("rcpt"),
        messageId: args.create.messageId,
        userId: args.create.userId,
        deliveredAt: args.create.deliveredAt ?? null,
        readAt: args.create.readAt ?? null,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.messageReceipts.push(record);
      return clone(record);
    }
  };

  story = {
    findMany: async (args: any = {}) => {
      let stories = this.seed.stories.filter((entry) => matchesStoryWhere(entry, args.where));
      stories = applyOrder(stories, args.orderBy);
      if (args.include?.author) {
        return stories.map((story) => enrichStory(story, this.seed));
      }
      return clone(stories);
    },
    findUniqueOrThrow: async (args: any) => {
      const story = this.seed.stories.find((entry) => entry.id === args.where.id);
      if (!story) throw new Error("Story not found");
      return clone(story);
    },
    create: async (args: any) => {
      const record: StoryRecord = {
        id: id("story"),
        authorId: args.data.authorId,
        mediaUrl: args.data.mediaUrl,
        mediaType: args.data.mediaType,
        caption: args.data.caption ?? null,
        expiresAt: args.data.expiresAt,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.stories.push(record);
      return clone(record);
    }
  };

  storyView = {
    findMany: async (args: any = {}) => {
      let items = this.seed.storyViews.filter((entry) => matchesStoryViewWhere(entry, args.where));
      items = applyOrder(items, args.orderBy);
      return clone(items);
    },
    upsert: async (args: any) => {
      const existing = this.seed.storyViews.find((entry) => entry.storyId === args.where.storyId_userId.storyId && entry.userId === args.where.storyId_userId.userId);
      if (existing) {
        existing.viewedAt = now();
        this.touch(existing);
        return clone(existing);
      }
      const record: StoryViewRecord = {
        id: id("view"),
        storyId: args.create.storyId,
        userId: args.create.userId,
        viewedAt: now(),
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.storyViews.push(record);
      return clone(record);
    }
  };

  friendship = {
    findMany: async (args: any = {}) => {
      let items = this.seed.friendships.filter((entry) => matchesFriendshipWhere(entry, args.where));
      if (args.include?.requester || args.include?.addressee) {
        return items.map((item) => ({
          ...clone(item),
          requester: clone(this.seed.users.find((user) => user.id === item.requesterId)!),
          addressee: clone(this.seed.users.find((user) => user.id === item.addresseeId)!)
        }));
      }
      return clone(items);
    },
    findFirst: async (args: any) => {
      const item = this.seed.friendships.find((entry) => matchesFriendshipWhere(entry, args.where));
      return item ? clone(item) : null;
    },
    findUniqueOrThrow: async (args: any) => {
      const item = this.seed.friendships.find((entry) => entry.id === args.where.id);
      if (!item) throw new Error("Friendship not found");
      return clone(item);
    },
    upsert: async (args: any) => {
      const existing = this.seed.friendships.find((entry) => entry.requesterId === args.where.requesterId_addresseeId.requesterId && entry.addresseeId === args.where.requesterId_addresseeId.addresseeId);
      if (existing) {
        Object.assign(existing, args.update);
        this.touch(existing);
        return clone(existing);
      }
      const record: FriendshipRecord = {
        id: id("friend"),
        requesterId: args.create.requesterId,
        addresseeId: args.create.addresseeId,
        status: args.create.status ?? "pending",
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.friendships.push(record);
      return clone(record);
    },
    update: async (args: any) => {
      const item = this.seed.friendships.find((entry) => entry.id === args.where.id);
      if (!item) throw new Error("Friendship not found");
      Object.assign(item, args.data);
      this.touch(item);
      return clone(item);
    },
    count: async (args: any = {}) => this.seed.friendships.filter((entry) => matchesFriendshipWhere(entry, args.where)).length
  };

  memory = {
    findMany: async (args: any = {}) => {
      let items = this.seed.memories.filter((entry) => matchesMemoryWhere(entry, args.where));
      items = applyOrder(items, args.orderBy);
      return clone(items);
    },
    createMany: async (args: any) => {
      args.data.forEach((item: any) => {
        this.seed.memories.push({
          id: id("echo"),
          userId: item.userId,
          title: item.title,
          mediaUrl: item.mediaUrl,
          folder: item.folder,
          favorite: item.favorite ?? false,
          isPrivate: item.isPrivate ?? true,
          createdAt: now(),
          updatedAt: now()
        });
      });
      return { count: args.data.length };
    },
    create: async (args: any) => {
      const record: MemoryRecord = {
        id: id("echo"),
        userId: args.data.userId,
        title: args.data.title,
        mediaUrl: args.data.mediaUrl,
        folder: args.data.folder,
        favorite: args.data.favorite ?? false,
        isPrivate: args.data.isPrivate ?? true,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.memories.push(record);
      return clone(record);
    }
  };

  reaction = {
    findMany: async (args: any = {}) => {
      let items = this.seed.reactions.filter((entry) => matchesReactionWhere(entry, args.where));
      items = applyOrder(items, args.orderBy);
      return clone(items);
    },
    create: async (args: any) => {
      const record: ReactionRecord = {
        id: id("react"),
        emoji: args.data.emoji,
        userId: args.data.userId,
        messageId: args.data.messageId ?? null,
        storyId: args.data.storyId ?? null,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.reactions.push(record);
      return clone(record);
    }
  };

  notification = {
    findMany: async () => clone(this.seed.notifications)
  };

  aiConversation = {
    findMany: async (args: any = {}) => {
      let items = this.seed.aiConversations.filter((entry) => !args.where?.userId || entry.userId === args.where.userId);
      items = applyOrder(items, args.orderBy);
      return clone(items);
    },
    findFirst: async (args: any = {}) => {
      const item = this.seed.aiConversations.find((entry) => !args.where?.userId || entry.userId === args.where.userId);
      return item ? clone(item) : null;
    },
    create: async (args: any) => {
      const record: AiConversationRecord = {
        id: id("ai"),
        userId: args.data.userId,
        title: args.data.title,
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.aiConversations.push(record);
      return clone(record);
    }
  };

  aiMessage = {
    createMany: async (args: any) => {
      args.data.forEach((item: any) => {
        this.seed.aiMessages.push({
          id: id("aimsg"),
          conversationId: item.conversationId,
          role: item.role,
          content: item.content,
          createdAt: now(),
          updatedAt: now()
        });
      });
      return { count: args.data.length };
    }
  };

  locationPing = {
    findMany: async (args: any = {}) => {
      let items = this.seed.locationPings.filter((entry) => matchesLocationWhere(entry, args.where));
      items = applyOrder(items, args.orderBy);
      if (args.distinct?.includes("userId")) {
        const seen = new Set<string>();
        items = items.filter((item) => {
          if (seen.has(item.userId)) return false;
          seen.add(item.userId);
          return true;
        });
      }
      if (args.include?.user) {
        return items.map((ping) => enrichLocationPing(ping, this.seed));
      }
      return clone(items);
    },
    create: async (args: any) => {
      const record: LocationPingRecord = {
        id: id("ping"),
        userId: args.data.userId,
        lat: args.data.lat,
        lng: args.data.lng,
        ghostMode: Boolean(args.data.ghostMode),
        createdAt: now(),
        updatedAt: now()
      };
      this.seed.locationPings.push(record);
      return args.include?.user ? enrichLocationPing(record, this.seed) : clone(record);
    }
  };

  async $connect() {}
  async $disconnect() {}
}

export const memoryPrisma = new MemoryPrisma();
