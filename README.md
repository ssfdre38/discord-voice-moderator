# Discord Voice Moderator Bot

A Discord bot that monitors voice chats, transcribes speech, and automatically kicks users who violate community guidelines.

## Features

- 🎤 **Real-time Voice Monitoring**: Joins voice channels and listens to conversations
- 🗣️ **Speech-to-Text**: Uses OpenAI Whisper to transcribe audio
- 🚨 **Automated Moderation**: Kicks users who use banned words/phrases
- 📝 **Logging**: Sends detailed moderation logs to a designated channel
- ⚡ **Automatic Join**: Bot joins when users enter voice channels
- 🔒 **Permission-based**: Requires admin permissions to control

## Requirements

- Node.js 16.x or higher
- FFmpeg installed on system
- Discord Bot Token
- OpenAI API Key (for Whisper transcription)

## Installation

1. **Clone/Download this project**

2. **Install FFmpeg**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install ffmpeg
   
   # macOS
   brew install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a Discord Bot**:
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Go to "Bot" section
   - Click "Add Bot"
   - Enable these Privileged Gateway Intents:
     - SERVER MEMBERS INTENT
     - MESSAGE CONTENT INTENT
   - Copy the bot token

5. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

6. **Configure environment variables**:
   Create a `.env` file:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

7. **Customize banned phrases**:
   Edit `bot.js` and modify the `BANNED_PHRASES` array:
   ```javascript
   const BANNED_PHRASES = [
     'bad word 1',
     'bad word 2',
     'inappropriate phrase',
     // Add your moderation rules here
   ];
   ```

8. **Invite bot to server**:
   - Go to OAuth2 > URL Generator
   - Select scopes: `bot`
   - Select permissions:
     - Connect
     - Speak
     - Use Voice Activity
     - Kick Members
     - Send Messages
     - Read Message History
   - Copy and use the generated URL

## Usage

1. **Start the bot**:
   ```bash
   node bot.js
   ```

2. **Commands** (Admin only):
   - `!monitor` - Bot joins your voice channel and starts monitoring
   - `!stop` - Bot leaves voice channel and stops monitoring

3. **Automatic Monitoring**:
   - Bot automatically joins voice channels when users join
   - Transcribes speech in real-time
   - Kicks users who violate rules
   - Sends logs to `#mod-logs` or `#moderation` channel

## How It Works

1. Bot joins a voice channel
2. Listens to each user's audio stream
3. Saves audio temporarily when user speaks
4. Converts audio to text using OpenAI Whisper
5. Checks transcription against banned phrases
6. If violation detected:
   - Kicks user from voice
   - Logs incident
   - Sends DM to user (if possible)
7. Cleans up temporary audio files

## Configuration Options

### Moderation Rules

Edit `BANNED_PHRASES` in `bot.js`:
```javascript
const BANNED_PHRASES = [
  'explicit word',
  'hate speech',
  'threatening language',
  // Add more phrases
];
```

### Silence Detection

Adjust silence duration before processing (in `listenToUser` function):
```javascript
end: {
  behavior: EndBehaviorType.AfterSilence,
  duration: 1000  // milliseconds (default: 1 second)
}
```

### Audio Quality

Modify audio settings in the decoder:
```javascript
const decoder = new prism.opus.Decoder({
  rate: 48000,     // Sample rate
  channels: 2,     // Stereo
  frameSize: 960   // Frame size
});
```

## Important Notes

⚠️ **Legal & Privacy Considerations**:
- Recording voice chat may be illegal in some jurisdictions
- Always inform users they are being recorded
- Comply with Discord's Terms of Service
- Follow data privacy regulations (GDPR, etc.)
- Consider requiring user consent

⚠️ **Cost Warning**:
- OpenAI Whisper API charges per audio minute
- Monitor usage to avoid unexpected charges
- Consider implementing rate limiting

⚠️ **Performance**:
- Processing audio takes time (~1-3 seconds per clip)
- Bot requires good CPU/network for multiple users
- Audio files are temporarily stored (ensure disk space)

## Troubleshooting

### Bot doesn't hear audio:
- Ensure bot has "Connect" and "Speak" permissions
- Check voice channel user limit
- Verify `selfDeaf: false` in connection settings

### FFmpeg errors:
- Ensure FFmpeg is installed: `ffmpeg -version`
- Add FFmpeg to system PATH
- Check audio file permissions

### OpenAI API errors:
- Verify API key is correct
- Check API quota/billing
- Ensure audio file format is compatible

### Bot kicks itself:
- Bot ignores other bots by default
- Check bot role permissions

## Advanced Features (Optional Enhancements)

### Add database logging:
```bash
npm install sqlite3
```

### Add web dashboard:
```bash
npm install express
```

### Use alternative STT:
- Google Cloud Speech-to-Text
- Azure Speech Services
- Local Vosk/Whisper model

## Support

For issues or questions:
1. Check Discord.js documentation: https://discord.js.org
2. Check OpenAI API docs: https://platform.openai.com/docs
3. Verify bot permissions in Discord

## License

MIT License - Use at your own risk

## Disclaimer

This bot is for educational purposes. Server owners are responsible for:
- Legal compliance with recording laws
- User privacy and consent
- Appropriate use of moderation features
- Following Discord's Terms of Service

**Use responsibly and ethically.**
