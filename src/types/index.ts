import type { Client, Collection, Message } from 'discord.js';

export interface CustomClient extends Client {
  commands?: Collection<string, Command>;
}

export interface CustomMessage extends Message {
  client: CustomClient
}

export interface Command {
  name: string;
  group: string;
  args?: boolean;
  usage?: string;
  aliases?: Array<string>;
  description: string;
  hidden?: boolean;
  execute: (message: CustomMessage, args?: Array<string>) => Promise<Message | void>;
}
