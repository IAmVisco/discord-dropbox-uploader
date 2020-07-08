import * as path from 'path';
import * as moment from 'moment-timezone';
import { MessageEmbed } from 'discord.js';
import { Command } from '../types';

const group = path.parse(__filename).name;

const help: Command = {
  name: 'help',
  group,
  aliases: ['commands', 'h'],
  description: 'Prints out this message.',
  execute(message) {
    const { user } = message.client;
    const orderedCommands = {};
    const commands = { uncategorized: [] };
    message.client.commands.forEach((c) => {
      if (c.group) {
        c.group in commands
          ? commands[c.group].push(c)
          : commands[c.group] = [c];
      } else {
        commands.uncategorized.push(c);
      }
    });
    Object.keys(commands).sort().forEach((key) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      orderedCommands[capitalizedKey] = commands[key]
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .filter((c) => !c.hidden);
    });

    const embed = new MessageEmbed()
      .setTitle(`${user.username} commands list`)
      .setThumbnail(user.avatarURL({ dynamic: true }))
      .setDescription('Uploads your stuff to Dropbox.')
      .setTimestamp();
    Object.keys(orderedCommands).forEach((k) => {
      if (orderedCommands[k].length > 0) {
        embed.addField('Group', `**${k}**`);
        orderedCommands[k].forEach((c) => {
          const prefix = process.env.BOT_PREFIX;
          let commandName = `${prefix}${c.name}`;
          if (c.aliases) {
            commandName = `${commandName}, ${c.aliases.map((a) => `${prefix}${a}`).join(', ')}`;
          }
          embed.addField(commandName, c.description, true);
        });
      }
    });

    return message.channel.send(embed);
  },
};

const ping: Command = {
  name: 'ping',
  group,
  description: 'Ping!',
  async execute(message) {
    const msg = await message.channel.send('Pong!');
    const pingTime = moment(msg.createdTimestamp).diff(moment(message.createdTimestamp));

    return msg.edit(`Pong! Time taken: ${pingTime}ms`);
  },
};

module.exports = [help, ping];
