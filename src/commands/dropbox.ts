import { Collection, MessageAttachment } from 'discord.js';
import * as path from 'path';
import { dropboxService } from '../services/DropboxService';
import { Command, CustomMessage } from '../types';

const group = path.parse(__filename).name;

const tryGetMessageAttachments = async (
  message?: CustomMessage,
  args?: string[],
): Promise<Collection<string, MessageAttachment> | null> => {
  if (!message) {
    return null;
  }
  const params = args || message.content.split(/ +/g).splice(0, 1);
  if (message.attachments.size) {
    return message.attachments;
  }

  if (params.length) {
    // First arg is message id
    if (!params[0].startsWith('http')) {
      return (await message.channel.messages.fetch(params[0]))?.attachments;
    }

    const linkLastChunk = params[0].split('/').pop();
    if (!linkLastChunk) {
      return null;
    }
    if (linkLastChunk.indexOf('.') > -1) {
      // If link is a direct file link
      const dummyAttachment = new MessageAttachment('');
      [dummyAttachment.url] = params;
      return new Collection<string, MessageAttachment>().set('0', dummyAttachment);
    }

    // Link is most likely Discord message link
    return (await message.channel.messages.fetch(linkLastChunk))?.attachments;
  }

  return null;
};

const upload: Command = {
  name: 'upload',
  group,
  aliases: ['up'],
  description: 'Uploads message attachments to Dropbox.',
  role: process.env.DROPBOX_ROLE,
  async execute(message, args) {
    let attachments = await tryGetMessageAttachments(message, args);
    if (!attachments) {
      attachments = await tryGetMessageAttachments((await message.channel.messages.fetch({ limit: 2 })).last());
    }

    if (attachments) {
      const promises = attachments.map(async (a) => dropboxService.uploadFile(a.url, a.name));
      await Promise.all(promises);
    } else {
      return message.channel.send('No file found for upload.');
    }

    return message.channel.send('Successfully uploaded files.');
  },
};

export default [upload];
