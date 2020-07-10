import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Discord from 'discord.js';
import { logger } from './helpers/logger';
import { CustomClient, CustomMessage } from './types';

dotenv.config();
const compiled = __filename.endsWith('.js');
const client: CustomClient = new Discord.Client();
const prefix = process.env.BOT_PREFIX ?? '!!';
const commandFiles = fs.readdirSync(`./${compiled ? 'dist' : 'src'}/commands`)
  .filter((file) => file.endsWith(compiled ? '.js' : '.ts'));

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
  const botVersion = process.env.npm_package_version ? `v${process.env.npm_package_version}` : '';
  logger.info(`===== Dropbox Uploader Bot ${botVersion} ready =====`);
  logger.info(`Logged in as '${client.user?.tag}' (${client.user?.id})`);
});

/* eslint-disable consistent-return */
client.on('message', async (message: CustomMessage) => {
  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift()!.toLowerCase();

  const command = client.commands!.get(commandName)
    || client.commands!.find((cmd) => !!cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return;
  }

  try {
    if (message.channel.type !== 'dm') {
      logger.info(`Executing command ${message.content} by @${message.author.tag} `
        + `in #${message.channel.name} (${message.channel.guild.name})`);
    } else {
      logger.info(`Executing command ${message.content} by @${message.author.tag} in DMs`);
    }

    if (command.args && !args.length) {
      let reply = 'You didn\'t provide any arguments!';
      if (command.usage) {
        reply += `\nUsage: ${prefix}${command.name} ${command.usage}`;
      }

      return message.channel.send(reply);
    }
    return await command.execute(message, args);
  } catch (error) {
    logger.error('Command error', error.error ? error.error : error);
    return message.channel.send('There was an error trying to execute that command!');
  }
});
/* eslint-enable consistent-return */

client.on('error', logger.error);

client.login(process.env.BOT_TOKEN);
