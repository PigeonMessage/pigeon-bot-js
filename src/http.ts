import type { ApiResponse } from "./types";
import type {
  Chat,
  ChatMember,
  ChatPreview,
  Message,
  MessageAttachment,
  UserPublic,
} from "./types";
import type { ClientConfig } from "./config";
import { resolveApiUrl } from "./config";

declare const fetch: typeof globalThis.fetch;

export interface GetMessagesQuery {
  limit?: number;
  before_id?: number;
  after_id?: number;
}

export class HttpClient {
  private readonly config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  private authHeader(): Record<string, string> {
    return {
      Authorization: `Bot ${this.config.token}`,
    };
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = resolveApiUrl(this.config, path);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.authHeader(),
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify({ data: body }) : undefined,
    });

    if (res.status === 204) {
      // @ts-expect-error
      return undefined;
    }

    const json = (await res.json()) as ApiResponse<T>;

    if (json.error) {
      throw new Error(json.error.message || "Request failed");
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return json.data as T;
  }

  // ========== USERS ==========
  async getUser(id: number): Promise<UserPublic> {
    return this.request<UserPublic>("GET", `/users/${id}`);
  }

  async getMe(): Promise<UserPublic> {
    return this.request<UserPublic>("GET", `/users/me`);
  }

  // ========== CHATS ==========
  async getChat(id: number): Promise<Chat> {
    return this.request<Chat>("GET", `/chats/${id}`);
  }

  async getMyChats(): Promise<ChatPreview[]> {
    return this.request<ChatPreview[]>("GET", `/chats`);
  }

  async getChatMembers(chatId: number): Promise<ChatMember[]> {
    return this.request<ChatMember[]>("GET", `/chats/${chatId}/members`);
  }

  async removeMember(chatId: number, userId: number): Promise<void> {
    await this.request<void>("DELETE", `/chats/${chatId}/members/${userId}`);
  }

  // ========== MESSAGES ==========
  async getMessages(
    chatId: number,
    query: GetMessagesQuery = {},
  ): Promise<Message[]> {
    const params = new URLSearchParams();
    if (query.limit != null) params.set("limit", String(query.limit));
    if (query.before_id != null) params.set("before_id", String(query.before_id));
    if (query.after_id != null) params.set("after_id", String(query.after_id));

    const qs = params.toString();
    const path =
      qs.length > 0
        ? `/chats/${chatId}/messages?${qs}`
        : `/chats/${chatId}/messages`;

    const url = resolveApiUrl(this.config, path);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...this.authHeader(),
      },
    });

    const json = (await res.json()) as ApiResponse<Message[]>;

    if (json.error) {
      throw new Error(json.error.message || "Request failed");
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return (json.data || []) as Message[];
  }

  // ========== ATTACHMENTS ==========
  async uploadAttachment(
    chatId: number,
    formData: FormData,
  ): Promise<MessageAttachment> {
    const url = resolveApiUrl(this.config, `/chats/${chatId}/attachments`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...this.authHeader(),
      },
      body: formData,
    });

    const json = (await res.json()) as ApiResponse<MessageAttachment>;

    if (json.error) {
      throw new Error(json.error.message || "Upload failed");
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return json.data as MessageAttachment;
  }
}


