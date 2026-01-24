import { BaseEntity } from "./BaseEntity";
import type { UserPublic } from "../types";

export class UserEntity extends BaseEntity {
  private _data: UserPublic;

  constructor(client: any, data: UserPublic) {
    super(client);
    this._data = data;
  }

  get id(): number {
    return this._data.id;
  }

  get data(): UserPublic {
    return this._data;
  }

  async fetch(): Promise<UserEntity> {
    const fresh = await this.client.getUser(this.id);
    this._data = fresh;
    return this;
  }
}


