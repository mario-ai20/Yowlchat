import type {
  AiConversationMessage,
  EchoMemory,
  HowlStory,
  NotificationItem,
  YowlChat,
  YowlMapFriend,
  YowlMessage,
  YowlUser
} from "@yowl/types";

export const friends: YowlUser[] = [];
export const chats: YowlChat[] = [];
export const messagesByChat: Record<string, YowlMessage[]> = {};
export const howls: HowlStory[] = [];
export const memories: EchoMemory[] = [];
export const mapFriends: YowlMapFriend[] = [];
export const aiMessages: AiConversationMessage[] = [];
export const notifications: NotificationItem[] = [];
