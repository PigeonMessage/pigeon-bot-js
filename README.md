# Pigeon Bot

[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A Node.js library for building chat bots on the Pigeon Messenger.

## Installation

```bash
npm install pigeon-bot
# or
yarn add pigeon-bot
```

## Quick Start

```typescript
import { Client } from 'pigeon-bot';

const client = new Client({
  token: process.env.BOT_TOKEN!,
  baseUrl: 'http://example.com',
  wsUrl: 'ws://example.com/api/v1/ws'
});

client.on('ready', () => {
  console.log('bot is ready!');
});

client.on('new_message', async (message) => {
  if (message.content.toLowerCase().includes('hello')) {
    await message.reply('hiii');
  }
});

client.connect();
```

## Configuration

```typescript
interface ClientConfig {
  token: string;
  baseUrl?: string;
  wsUrl?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}
```

## Events

- `ready`: Fires when the bot connects successfully
- `authenticated`: Fires after successful authentication
- `new_message`: Triggered on new messages
- `error`: Emitted on connection/authentication errors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
