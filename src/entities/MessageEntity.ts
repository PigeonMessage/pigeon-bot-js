import { BaseEntity } from "./BaseEntity";
import type { Message } from "../types";

export class MessageEntity extends BaseEntity {
  private _data: Message;

  constructor(client: any, data: Message) {
    super(client);
    this._data = data;
  }

  get data(): Message {
    return this._data;
  }

  get id(): number {
    return this._data.id;
  }

  get chatId(): number {
    return this._data.chat_id;
  }

  get senderId(): number {
    return this._data.sender_id;
  }

  get content(): string {
    return this._data.content;
  }

  async edit(content: string): Promise<void> {
    await this.client.editMessage(this.id, content);
    this._data.content = content;
    this._data.is_edited = true;
  }

  async delete(): Promise<void> {
    await this.client.deleteMessage(this.id);
  }

  async addReaction(emoji: string): Promise<void> {
    await this.client.addReaction(this.id, emoji);
  }

  async removeReaction(emoji: string): Promise<void> {
    await this.client.removeReaction(this.id, emoji);
  }

  async reply(
    content: string,
    attachmentIds?: number[] | null,
  ): Promise<void> {
    await this.client.sendMessage(
      this.chatId,
      content,
      this.id,
      attachmentIds,
    );
  }
}


