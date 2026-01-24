import { BaseEntity } from "./BaseEntity";
import type {
  Chat,
  ChatMember,
  ChatPreview,
  Message,
  MessageAttachment,
} from "../types";

export class ChatEntity extends BaseEntity {
  private _data: Chat | ChatPreview;

  constructor(client: any, data: Chat | ChatPreview) {
    super(client);
    this._data = data;
  }

  get id(): number {
    return this._data.id;
  }

  get data(): Chat | ChatPreview {
    return this._data;
  }

  async fetchFull(): Promise<ChatEntity> {
    const chat = await this.client.getChat(this.id);
    this._data = chat;
    return this;
  }

  async fetchMembers(): Promise<ChatMember[]> {
    return this.client.getChatMembers(this.id);
  }

  async fetchMessages(params?: {
    limit?: number;
    before_id?: number;
    after_id?: number;
  }): Promise<Message[]> {
    return this.client.getMessages(this.id, params);
  }

  async sendMessage(
    content: string,
    replyTo?: number | null,
    attachmentIds?: number[] | null,
  ): Promise<void> {
    await this.client.sendMessage(this.id, content, replyTo, attachmentIds);
  }

  async removeMember(userId: number): Promise<void> {
    await this.client.removeMember(this.id, userId);
  }

  async uploadAttachment(formData: FormData): Promise<MessageAttachment> {
    return this.client.uploadAttachment(this.id, formData);
  }
}


