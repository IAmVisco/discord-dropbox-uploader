import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './helpers/logger';
import { CustomClient, CustomMessage } from './types';

dotenv.config();
const client: CustomClient = new Discord.Client();
const prefix = process.env.BOT_PREFIX ?? '!!';
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands'))
  .filter((file) => file.match(/^([^.].*)\.(js|ts)$/g));

client.commands = new Discord.Collection();

(async () => {
// eslint-disable-next-line no-restricted-syntax
  for (const file of commandFiles) {
    // eslint-disable-next-line no-await-in-loop
    const { default: commands } = await import(`./commands/${file}`);
    if (Array.isArray(commands)) {
      commands.forEach((c) => client.commands!.set(c.name, c));
    } else {
      client.commands!.set(commands.name, commands);
    }
  }
})();

client.once('ready', () => {
  logger.info('===== Dropbox Uploader Bot ready =====');
  logger.info(`Logged in as '${client.user?.tag}' (${client.user?.id})`);
});

client.on('message', async (message: CustomMessage) => {
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return null;
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift()!.toLowerCase();

  const command = client.commands!.get(commandName)
    || client.commands!.find((cmd) => !!cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return null;
  }

  try {
    if (message.channel.type !== 'dm') {
      logger.info(`Executing command ${message.content} by @${message.author.tag} `
        + `in #${message.channel.name} (${message.channel.guild.name})`);
    } else {
      logger.info(`Executing command ${message.content} by @${message.author.tag} in DMs`);
    }

    if (command.permissions && !message.member?.hasPermission(command.permissions)) {
      const reply = 'You need higher permissions to execute this command!';
      return message.channel.send(reply);
    }

    if (command.role && !message.member?.roles.cache.has(command.role)) {
      const reply = 'You need specific role to execute this command!';
      return message.channel.send(reply);
    }

    if (command.args && !args.length) {
      const reply = 'You didn\'t provide any arguments!'
        + `${command.usage && `\nUsage: ${prefix}${command.name} ${command.usage}`}`;
      return message.channel.send(reply);
    }

    return await command.execute(message, args);
  } catch (error) {
    logger.error('Command error', error.error ? error.error : error);
    return message.channel.send('There was an error trying to execute that command!');
  }
});

client.on('error', logger.error);

client.login(process.env.BOT_TOKEN);
