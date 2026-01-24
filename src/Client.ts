import { EventEmitter } from "events";
import WebSocket from "ws";

import type {
  Chat,
  ChatMember,
  ChatPreview,
  Message,
  MessageAttachment,
  WsAuthenticatedData,
  WsEnvelope,
  WsErrorData,
  WsOnlineListData,
  UserPublic,
} from "./types";
import type { ClientConfig } from "./config";
import { resolveWsUrl } from "./config";
import { HttpClient, type GetMessagesQuery } from "./http";
import { MessageEntity } from "./entities/MessageEntity";

export class PigeonClient extends EventEmitter {
  private readonly config: ClientConfig;
  private ws: WebSocket | null = null;
  private _connected = false;
  private _authenticated = false;
  private http: HttpClient;

  constructor(config: ClientConfig) {
    super();
    if (!config.token) {
      throw new Error("Bot token is required");
    }
    this.config = {
      autoReconnect: true,
      reconnectIntervalMs: 5_000,
      ...config,
    };
    this.http = new HttpClient(this.config);
  }

  get connected(): boolean {
    return this._connected;
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  // ========== HTTP ==========
  async getUser(id: number) {
    return this.http.getUser(id);
  }

  async getMe() {
    return this.http.getMe();
  }

  async getChat(id: number): Promise<Chat> {
    return this.http.getChat(id);
  }

  async getMyChats(): Promise<ChatPreview[]> {
    return this.http.getMyChats();
  }

  async getChatMembers(chatId: number): Promise<ChatMember[]> {
    return this.http.getChatMembers(chatId);
  }

  async getMessages(
    chatId: number,
    query?: GetMessagesQuery,
  ): Promise<Message[]> {
    return this.http.getMessages(chatId, query);
  }

  async uploadAttachment(
    chatId: number,
    formData: FormData,
  ): Promise<MessageAttachment> {
    return this.http.uploadAttachment(chatId, formData);
  }

  async removeMember(chatId: number, userId: number): Promise<void> {
    return this.http.removeMember(chatId, userId);
  }

  // ========== WS CONNECT ==========
  connect(): void {
    if (this._connected) {
      throw new Error("Client is already connected");
    }

    const url = resolveWsUrl(this.config);
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this._connected = true;
      this._authenticated = false;

      const authMsg: WsEnvelope<{ token: string }> = {
        type: "authenticate",
        data: { token: `Bot ${this.config.token}` },
      };

      this.sendRaw(authMsg).catch((err) => {
        this.emit("error", err);
      });
    });

    this.ws.on("message", (data: WebSocket.RawData) => {
      try {
        const payload = JSON.parse(String(data)) as WsEnvelope<any>;
        this.emit("raw", payload);

        if (payload.type === "authenticated") {
          this._authenticated = true;
          this.emit("authenticated", payload.data as WsAuthenticatedData);
          this.emit("ready");
        } else if (payload.type === "error") {
          const errData = payload.data as WsErrorData;
          if (!this._authenticated && errData.message === "Please authenticate first") {
            return;
          }
          this.emit("error", new Error(errData.message));
        }

        switch (payload.type) {
          case "new_message": {
            const msg: Message = (payload.data as any).message;
            const entity = new MessageEntity(this, msg);
            this.emit("new_message", entity, payload.data);
            break;
          }
          case "message_edited": {
            const msg: Message = (payload.data as any).message;
            const entity = new MessageEntity(this, msg);
            this.emit("message_edited", entity, payload.data);
            break;
          }
          case "message_deleted": {
            this.emit("message_deleted", payload.data);
            break;
          }
          case "reaction_added": {
            this.emit("reaction_added", payload.data);
            break;
          }
          case "reaction_removed": {
            this.emit("reaction_removed", payload.data);
            break;
          }
          case "user_online":
          case "user_offline": {
            this.emit(payload.type, payload.data);
            break;
          }
          case "online_list": {
            const users: { id: number }[] = (payload.data as WsOnlineListData)
              .users;
            this.emit("online_list", payload.data);
            break;
          }
          default: {
            this.emit(payload.type, payload.data);
          }
        }
      } catch (err) {
        this.emit("error", err);
      }
    });

    this.ws.on("close", () => {
      this._connected = false;
      this._authenticated = false;
      this.emit("disconnect");
      if (this.config.autoReconnect) {
        setTimeout(() => this.connect(), this.config.reconnectIntervalMs);
      }
    });

    this.ws.on("error", (err: unknown) => {
      this.emit("error", err);
    });
  }

  async disconnect(code = 1000, reason?: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ws) {
        resolve();
        return;
      }
      const ws = this.ws;
      const onClose = () => {
        ws.removeAllListeners("close");
        resolve();
      };
      ws.on("close", onClose);
      try {
        ws.close(code, reason);
      } catch {
        resolve();
      }
    });
  }

  // ========== WS COMMANDS ==========
  async sendMessage(
    chatId: number,
    content: string,
    replyTo?: number | null,
    attachmentIds?: number[] | null,
  ): Promise<void> {
    await this.sendRaw({
      type: "send_message",
      data: {
        chat_id: chatId,
        content,
        reply_to: replyTo ?? null,
        attachment_ids: attachmentIds ?? null,
      },
    });
  }

  async editMessage(messageId: number, content: string): Promise<void> {
    await this.sendRaw({
      type: "edit_message",
      data: {
        message_id: messageId,
        content,
      },
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.sendRaw({
      type: "delete_message",
      data: {
        message_id: messageId,
      },
    });
  }

  async addReaction(messageId: number, emoji: string): Promise<void> {
    await this.sendRaw({
      type: "add_reaction",
      data: {
        message_id: messageId,
        emoji,
      },
    });
  }

  async removeReaction(messageId: number, emoji: string): Promise<void> {
    await this.sendRaw({
      type: "remove_reaction",
      data: {
        message_id: messageId,
        emoji,
      },
    });
  }

  async setTyping(chatId: number, isTyping = true): Promise<void> {
    await this.sendRaw({
      type: "typing",
      data: {
        chat_id: chatId,
        is_typing: isTyping,
      },
    });
  }

  async getOnlineList(): Promise<WsOnlineListData["users"]> {
    const waitFor = (event: string, timeoutMs = 5_000) =>
      new Promise<any>((resolve, reject) => {
        const handler = (data: any) => {
          clearTimeout(timer);
          this.removeListener(event, handler);
          resolve(data);
        };
        const timer = setTimeout(() => {
          this.removeListener(event, handler);
          reject(new Error(`Timed out waiting for ${event}`));
        }, timeoutMs);
        this.on(event, handler);
      });

    await this.sendRaw({ type: "get_online_list", data: {} });
    const data = (await waitFor("online_list")) as WsOnlineListData;
    return data.users || [];
  }

  // ========== LOW LEVEL SEND ==========
  private async sendRaw(payload: WsEnvelope<any>): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected to WebSocket");
    }
    if (!this._authenticated && payload.type !== "authenticate") {
      throw new Error("Please authenticate first.");
    }
    await new Promise<void>((resolve, reject) => {
      this.ws!.send(
        JSON.stringify(payload),
        (err?: Error | undefined) => (err ? reject(err) : resolve()),
      );
    });
  }
}

export default PigeonClient;


