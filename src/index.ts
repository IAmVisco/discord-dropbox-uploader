import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';
import { logger } from './helpers/logger';

dotenv.config();
const client = new Discord.Client();

client.once('ready', () => {
  const botVersion = process.env.npm_package_version ? `v${process.env.npm_package_version}` : '';
  logger.info(`===== Ojou Bot ${botVersion} ready =====`);
  logger.info(`Logged in as '${client.user.tag}' (${client.user.id})`);
});

client.login(process.env.BOT_TOKEN);
