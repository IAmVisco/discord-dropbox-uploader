import * as path from 'path';
import { Dropbox } from 'dropbox';
import * as fetch from 'isomorphic-fetch';
import { Command } from '../types';

const group = path.parse(__filename).name;
const dropbox = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

const upload: Command = {
  name: 'upload',
  group,
  aliases: ['up'],
  description: 'Uploads message attachments to Dropbox.',
  async execute(message) {
    const data = await dropbox.filesListFolder({ path: '' });
    // eslint-disable-next-line no-console
    console.dir(data);
    return message.channel.send('OK!');
  },
};

export default [upload];
