import { Client } from '../src/';

const token = process.env.BOT_TOKEN!;

if (!process.env.BOT_TOKEN) {
  console.error('Please set your bot token in the BOT_TOKEN environment variable or edit this example file');
  process.exit(1);
}

const client = new Client({
  token: token,
  baseUrl: 'http://localhost',
  wsUrl: 'ws://localhost/api/v1/ws'
});

let lastMessageId: string | null = null;

client.on('ready', async () => {
  console.log('bot is ready!');
});

let botUserId: string | null = null;

client.on('authenticated', (data: { user_id?: string }) => {
  if (data.user_id && !botUserId) {
    botUserId = data.user_id;
  }
});

client
.on('new_message', async (message: any, raw: any) => {
  lastMessageId = message.id;

  if (botUserId && message.senderId === botUserId) {
    return;
  }

  const content = message.content.toLowerCase();

  if (content.includes('hi') ) {
    try {
      await client.setTyping(message.chatId, true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.reply('hi, how are you?');
      await client.setTyping(message.chatId, false);
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  }
});

client.on('raw', (data: any) => {
  return
});

client.on('error', (error: Error) => {
  console.error('Error', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
});

client.connect();

process.on('SIGINT', async () => {
  
  if (client.connected) {
    try {
      await client.disconnect();
    } catch (error: any) {
      console.error('Error during shutdown:', error.message);
    }
  }
  
  process.exit(0);
});
