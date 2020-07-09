import { Dropbox } from 'dropbox';
import getStream from 'get-stream';
import * as path from 'path';
import fetch from 'node-fetch';
import { Command, CustomMessage } from '../types';

const group = path.parse(__filename).name;
const dropbox = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

const upload: Command = {
  name: 'upload',
  group,
  aliases: ['up'],
  description: 'Uploads message attachments to Dropbox.',
  async execute(message, args) {
    let targetMessage: CustomMessage;
    if (args.length) {
      const messageSnowflake = args[0].startsWith('http') ? args[0].split('/').pop() : args[0];
      targetMessage = await message.channel.messages.fetch(messageSnowflake);
    } else {
      targetMessage = (await message.channel.messages.fetch({ limit: 2 })).last();
    }

    const promises = targetMessage.attachments.map(async (a) => {
      const { body: stream } = await fetch(a.url);
      const contents = await getStream.buffer(stream);
      return dropbox.filesUpload({ contents, path: `/${process.env.DROPBOX_FOLDER_NAME}/${a.name}`, autorename: true });
    });
    await Promise.all(promises);

    return message.channel.send(`Uploaded **${promises.length}** files.`);
  },
};

export default [upload];
