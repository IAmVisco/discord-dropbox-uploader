import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';

dotenv.config();
const client = new Discord.Client();

client.once('ready', () => {
  const botVersion = process.env.npm_package_version ? `v${process.env.npm_package_version}` : '';
  console.log(`===== Ojou Bot ${botVersion} ready =====`);
  console.log(`Logged in as '${client.user.tag}' (${client.user.id})`);
});

client.login(process.env.BOT_TOKEN);
