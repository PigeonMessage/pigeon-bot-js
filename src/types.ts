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

export type MessageMedia =
  | {
      type: "Photo";
      file_id: string;
      file_url: string;
      width: number;
      height: number;
      file_size: number;
      thumbnail_url?: string | null;
      spoiler?: boolean;
    }
  | {
      type: "Document";
      file_id: string;
      file_url: string;
      file_name: string;
      mime_type: string;
      file_size: number;
      thumbnail_url?: string | null;
    }
  | {
      type: "Video";
      file_id: string;
      file_url: string;
      width: number;
      height: number;
      duration?: number | null;
      file_size: number;
      thumbnail_url?: string | null;
      supports_streaming?: boolean;
    }
  | {
      type: "Audio";
      file_id: string;
      file_url: string;
      duration?: number | null;
      file_name?: string | null;
      mime_type: string;
      file_size: number;
      thumbnail_url?: string | null;
    }
  | {
      type: "Voice";
      file_id: string;
      file_url: string;
      duration?: number | null;
      file_size: number;
      waveform?: number[] | null;
    }
  | {
      type: "Gif";
      file_id: string;
      file_url: string;
      width: number;
      height: number;
      duration?: number | null;
      file_size: number;
      preview_url?: string | null;
    }
  | {
      type: "Sticker";
      file_id: string;
      file_url: string;
      width: number;
      height: number;
      emoji?: string | null;
      set_name?: string | null;
    }
  | {
      type: "Geo";
      latitude: number;
      longitude: number;
      title?: string | null;
      address?: string | null;
    }
  | {
      type: "Contact";
      phone_number: string;
      first_name: string;
      last_name?: string | null;
      vcard?: string | null;
    }
  | {
      type: "Poll";
      question: string;
      options: PollOption[];
      allows_multiple: boolean;
      anonymous: boolean;
      is_quiz: boolean;
      has_voted?: boolean | null;
      user_voted_options?: number[] | null;
      explanation?: string | null;
      close_period?: number | null;
      correct_option_indexes?: number[] | null;
      allow_revote: boolean;
    };

export interface PollOption {
  text: string;
  id?: number | null;
  poll_id?: number | null;
  is_correct?: boolean | null;
  votes_count?: number | null;
  voters?: UserPublic[] | null;
}

export interface PollVote {
  poll_id: number;
  option_id: number;
  user_id: number;
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
  media?: MessageMedia[] | null;
  is_edited: boolean;
  created_at: string;
  edited_at: string | null;
  reactions?: MessageReaction[] | null;
  new_chat_members?: UserPublic[] | null;
  left_chat_member?: UserPublic | null;
  left_chat_member_id?: number | null;
  new_chat_title?: string | null;
  delete_chat_photo?: boolean | null;
  chat_created_type?: string | null;
  migrate_to_chat_id?: number | null;
  migrate_from_chat_id?: number | null;
  pinned_message?: Message | null;
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
  | "vote_poll"
  | "unvote_poll"
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


