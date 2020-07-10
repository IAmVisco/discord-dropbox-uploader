import { Dropbox } from 'dropbox';
import getStream from 'get-stream';
import fetch from 'node-fetch';

class DropboxService {
  private readonly dropbox: Dropbox;
  private readonly MAX_UPLOAD_SIZE = 157286400;

  constructor() {
    this.dropbox = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });
  }

  async uploadFile(url: string, name?: string): Promise<DropboxTypes.files.FileMetadata> {
    const { body: stream } = await fetch(url);
    const contents = await getStream.buffer(stream);
    if (contents.length > this.MAX_UPLOAD_SIZE) {
      throw new Error('Files above 150MB are not supported.');
    }
    return this.dropbox.filesUpload({
      contents,
      path: `/${process.env.DROPBOX_FOLDER_NAME}/${name || url.split('/').pop()}`,
      autorename: true,
    });
  }
}

export const dropboxService = new DropboxService();
