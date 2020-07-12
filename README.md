# Dropbox Uploader
Discord bot to quickly upload message attachments to the Dropbox. 
Based on my discord.js bot template that needs few tweaks before going public. 

## Functions
Literally 3 commands:
- `help` - Prints commands list.
- `ping` - Checks Discord pings.
- `upload` - Uploads your files to Dropbox (duh).

Upload captures attachments on the following order:
 1. Message with command - its attachments.
 2. Message with command - its argument.
 3. Message above the command - its attachments.
 4. Message above the command - it's argument.
 Argument can be one of the following:
    - Direct link to file.
    - Link to Discord message (RMB - Copy Message Link).
    - Message Snowflake.

## Installation and usage
Copy `.env.example` into `.env` and fill up env vars. Everything should be self-explanatory. Role can be omitted.
 ```shell script
npm i
npm run start
```
Or build TS and run with node/pm2.
```shell script
npm i
npm run build
node dist/index.js
```
## License
MIT
