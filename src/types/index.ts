import type { Client, Collection, Message } from 'discord.js';

export interface CustomClient extends Client {
  commands?: Collection<string, Command>;
}

export interface Command {
  name: string;
  group: string;
  args?: boolean;
  usage?: string;
  aliases?: Array<string>;
  description: string;
  hidden?: boolean;
  execute: (message: Message & { client: CustomClient}, args?: Array<string>) => Promise<Message | void>;
}
