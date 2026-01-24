import type { PigeonClient } from "../Client";

export abstract class BaseEntity {
  protected readonly client: PigeonClient;

  constructor(client: PigeonClient) {
    this.client = client;
  }
}


