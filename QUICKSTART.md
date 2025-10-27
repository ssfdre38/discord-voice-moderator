# Quick Start Guide

## Setup Steps

1. **Install FFmpeg** (required for audio processing):
   ```bash
   sudo apt-get update && sudo apt-get install -y ffmpeg
   ```

2. **Create .env file** with your credentials:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Add your:
   - Discord Bot Token (from https://discord.com/developers/applications)
   - OpenAI API Key (from https://platform.openai.com/api-keys)

3. **Start the bot**:
   ```bash
   npm start
   ```

## Bot Setup

### Create Discord Bot:
1. Visit https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" → "Add Bot"
4. Enable Privileged Intents:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
5. Copy token

### Invite Bot to Server:
Use this URL (replace CLIENT_ID with your application ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=19530752&scope=bot
```

Required Permissions:
- Connect
- Speak  
- Use Voice Activity
- Kick Members
- Send Messages
- Read Message History

## Usage

1. Join a voice channel
2. Type `!monitor` (admin only)
3. Bot joins and starts monitoring
4. Speaks in voice → Transcribed → Checked for violations
5. Type `!stop` to stop monitoring

## Customize Moderation

Edit `bot.js` line 27-32:
```javascript
const BANNED_PHRASES = [
  'add your',
  'banned words',
  'here'
];
```

## Test It

1. Have bot join voice channel
2. Say a banned phrase
3. Bot should kick you and log to #mod-logs

## Important Warning ⚠️

**Legal Notice**: Recording voice chat may be illegal without consent in your jurisdiction. Always:
- Inform users they are being recorded
- Get proper consent
- Follow local laws (GDPR, wiretapping laws, etc.)
- Review Discord Terms of Service

**This is for educational purposes only. Use responsibly.**
