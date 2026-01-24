export interface ApiError {
  code: number;
  message: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
}

export interface UserPublic {
  id: number;
  username: string;
  name: string;
  is_bot: boolean;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  last_seen_at: string | null;
}

export type ChatType = "DM" | "GROUP" | "CHANNEL";

export interface ChatMember {
  chat_id: number;
  user_id: number;
  role: string;
  custom_nickname: string | null;
  can_send_messages: boolean;
  can_manage_messages: boolean;
  can_manage_members: boolean;
  can_manage_chat: boolean;
  joined_at: string;
  last_read_message_id: number | null;
}

export interface Chat {
  id: number;
  chat_type: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  owner_id: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  members: ChatMember[];
  member_count: number;
}

export interface ChatPreview {
  id: number;
  chat_type: string;
  name: string | null;
  description: string | null;
  avatar_url: string | null;
  is_public: boolean;
  member_count: number;
  last_message: Message | null;
  last_user: UserPublic | null;
  other_user: UserPublic | null;
  last_read_message_id: number | null;
  unread_count: number;
}

export interface MessageAttachment {
  id: number;
  chat_id: number;
  uploaded_by: number;
  file_type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  created_at: string;
}

export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  reply_to_message_id: number | null;
  content: string;
  is_edited: boolean;
  created_at: string;
  edited_at: string | null;
  attachments?: MessageAttachment[] | null;
  reactions?: MessageReaction[] | null;
}

export type WsMessageType =
  // client -> server
  | "ping"
  | "authenticate"
  | "subscribe"
  | "unsubscribe"
  | "send_message"
  | "edit_message"
  | "delete_message"
  | "add_reaction"
  | "remove_reaction"
  | "mark_as_read"
  | "mark_all_as_read"
  | "typing"
  | "get_online_list"
  // server -> client
  | "pong"
  | "authenticated"
  | "error"
  | "new_message"
  | "message_edited"
  | "message_deleted"
  | "reaction_added"
  | "reaction_removed"
  | "user_online"
  | "user_offline"
  | "user_typing"
  | "message_read"
  | "all_messages_read"
  | "poll_created"
  | "poll_voted"
  | "poll_closed"
  | "online_list";

export interface WsEnvelope<T = any> {
  type: WsMessageType | string;
  data: T;
}

export interface WsAuthenticatedData {
  user_id: number;
}

export interface WsErrorData {
  message: string;
}

export interface WsOnlineListUser {
  id: number;
}

export interface WsOnlineListData {
  users: WsOnlineListUser[];
}


